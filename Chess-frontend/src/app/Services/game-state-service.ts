import { Injectable, inject } from '@angular/core';
import { SoundService } from './sound-service';
import { ChessUtils } from '../utils/chess-utils';

@Injectable({
  providedIn: 'root',
})
export class GameStateService {
  private soundService = inject(SoundService);
  private _board: string[] = [];

  initGame(fen: string) {
    this._board = ChessUtils.loadFEN(fen);
  }

  public get board() : ReadonlyArray<string> {
    return this._board;
  }

  handleMove(src: number, target: number): void {
    if (src === target) return;

    const piece = this._board[src];
    const isCapture = !!this._board[target];

    this._board[target] = piece;
    this._board[src] = "";

    if (isCapture) {
      this.soundService.playCapture();
    } else {
      this.soundService.playMove();
    }
  }

}
