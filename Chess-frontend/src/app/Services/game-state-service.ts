import { Injectable, inject } from '@angular/core';
import { SoundService } from './sound-service';
import { ChessUtils } from '../utils/chess-utils';
import { MoveGenerator } from '../engine/move-generator';
import { Move } from '../models/move.model';

@Injectable({
  providedIn: 'root',
})
export class GameStateService {
  private soundService = inject(SoundService);
  private _board: string[] = [];
  activeMoves: number[] = [];
  public lastMove: Move | null = null;

  initGame(fen: string) {
    this._board = ChessUtils.loadFEN(fen);
  }

  public get board() : ReadonlyArray<string> {
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

    this._board[target] = piece;
    this._board[src] = "";

    this.lastMove = new Move(src, target, piece, isCapture);

    if (isCapture) {
      this.soundService.playCapture();
    } else {
      this.soundService.playMove();
    }
  }

  getMoves(index: number) {
    const moves =  MoveGenerator.getPseudoLegalMoves(index, [...this._board]);
    this.activeMoves = moves.map(move => move.target);
    return moves;
  }

}
