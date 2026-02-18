import { Injectable, inject } from '@angular/core';
import { SoundService } from './sound-service';
import { ChessUtils } from '../utils/chess-utils';
import { MoveGenerator } from '../engine/move-generator';
import { Move } from '../models/move.model';
import { MoveValidator } from '../engine/move-validator';
import { ChessPlayer, GameState } from '../utils/chess-types';


@Injectable({
  providedIn: 'root',
})
export class GameStateService {
  private soundService = inject(SoundService);
  private _board: string[] = [];
  public threatMap: number[] = [];
  public history: string[] = [];
  turnToPlay: ChessPlayer = 'w';

  activeMoves: number[] = [];
  public lastMove: Move | null = null;

  initGame(fen: string) {
    this.loadFEN(fen);
  }

  exportFEN(): string {
    return ChessUtils.exportFEN({
      board: [...this.board],
      turn: this.turnToPlay,
      castling:  "",
      enPassant: null
    });
  }

  loadFEN(fen: string) {
    const gameState = ChessUtils.loadFEN(fen);
    this._board = gameState.board;
    this.turnToPlay = gameState.turn;

  }

  public get board(): ReadonlyArray<string> {
    return this._board;
  }

  clearActiveMoves() {
    this.activeMoves = [];
  }

  handleMove(src: number, target: number): void {
    if (src === target) return; // if the target move is the same as the source return

    const piece = this._board[src];
    const isCapture = !!this._board[target];

    this.getMoves(src);

    if (!this.activeMoves.includes(target)) return; // only make the moves if it's on the set of possible moves

    if (this.turnToPlay !== ChessUtils.getPlayerType(piece)) return;

    this.history.push(this.exportFEN());
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

  undo() {
    if (this.history.length === 0) return;

    const previousState = this.history.pop()!;
    this.loadFEN(previousState);
    this.updateThreatMap();
    this.soundService.playMove();
  }

  redo() {}

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
      this.threatMap = this.threatMap.concat(MoveGenerator.getPseudoLegalMoves(i, [...this.board], true).map(move => move.target));

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
