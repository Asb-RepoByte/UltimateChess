import { Injectable, inject } from '@angular/core';
import { SoundService } from './sound-service';
import { ChessUtils } from '../utils/chess-utils';
import { MoveGenerator } from '../engine/move-generator';
import { Move } from '../models/move.model';
import { MoveValidator } from '../engine/move-validator';
import { ChessPlayer } from '../utils/chess-types';


@Injectable({
  providedIn: 'root',
})
export class GameStateService {
  private soundService = inject(SoundService);
  private _board: string[] = [];
  public threatMap: number[] = [];
  turnToPlay: ChessPlayer = 'w';

  activeMoves: number[] = [];
  public lastMove: Move | null = null;

  initGame(fen: string) {
    this._board = ChessUtils.loadFEN(fen);
  }

  public get board(): ReadonlyArray<string> {
    return this._board;
  }

  clearActiveMoves() {
    this.activeMoves = [];
  }

  handleMove(src: number, target: number): void {
    if (src === target) return;

    const piece = this._board[src];
    const isCapture = !!this._board[target];
    const moves = this.getMoves(src);

    if (!this.activeMoves.includes(target)) return; // only make the moves if it's on the set of possible moves
    if (this.turnToPlay !== ChessUtils.getPlayerType(piece)) return;

    this._board[target] = piece;
    this._board[src] = "";

    this.updateThreatMap();
    this.turnToPlay = this.turnToPlay === 'w' ? 'b' : 'w';

    this.lastMove = new Move(src, target, piece, isCapture);

    if (isCapture) {
      this.soundService.playCapture();
    } else {
      this.soundService.playMove();
    }
  }

  updateThreatMap() {
    this.threatMap = new Array();
    for (let i = 0; i < this._board.length; i++) {
      let piece = this._board[i];
      if (!piece) continue;

      if (this.turnToPlay === 'w') {
        if (piece.toUpperCase() !== piece) continue;
      } else {
        if (piece.toLowerCase() !== piece) continue;
      }

      console.log("piece: ", piece);
      this.threatMap = this.threatMap.concat(MoveGenerator.getPseudoLegalMoves(i, [...this.board]).map(move => move.target));

    }

    console.log("threat: ", this.threatMap);
  }

  getMoves(index: number) {
    let piece = this.board[index];
    if (!piece) return;
    if (this.turnToPlay !== ChessUtils.getPlayerType(piece)) return;
    const moves = MoveValidator.getValidMoves(index, [...this._board]);
    this.activeMoves = moves.map(move => move.target);
    return moves;
  }

}
