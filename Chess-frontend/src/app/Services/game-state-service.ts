import { Injectable, inject } from '@angular/core';
import { SoundService } from './sound-service';
import { ChessUtils } from '../utils/chess-utils';
import { Move } from '../models/move.model';
import { MoveGenerator } from '../engine/move-generator';
import { MoveValidator } from '../engine/move-validator';
import { MoveHistoryEntry, GameState, ChessPlayer } from '../utils/chess-types';


@Injectable({
  providedIn: 'root',
})
export class GameStateService {
  private soundService = inject(SoundService);
  private _board: string[] = [];
  public threatMap: number[] = [];
  public history: MoveHistoryEntry[] = [];
  turnToPlay: ChessPlayer = 'w';
  activeMoves: number[] = [];
  public lastMove: Move | null = null;
  private castlingRights = 15;

  initGame(fen: string) {
    this.loadFEN(fen);
  }

  exportFEN(): string {
    return ChessUtils.exportFEN({
      board: [...this.board],
      turn: this.turnToPlay,
      castling:  ChessUtils.getCastlingString(this.castlingRights),
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
    const piece = this._board[src];
    const isCapture = !!this._board[target];
    const move = new Move(src, target, piece, isCapture);

    if (!piece) return
    if (this.turnToPlay !== ChessUtils.getPlayerType(piece)) return;
    if (src === target) return; // if the target move is the same as the source return

    const allLegalMoves = this.getMoves(src);

    if (!this.activeMoves.includes(target)) return; // only make the moves if it's on the set of possible moves

    const san = ChessUtils.getSAN(move, [...this._board], allLegalMoves);
    this.history.push({ fen: this.exportFEN(), san: san }); // pushing the state to the history before making the move
    this.lastMove = move;

    // actually making the move
    this._board[target] = piece;
    this._board[src] = "";

    // updating everything that needs to be updated
    this.updateThreatMap();
    this.turnToPlay = this.turnToPlay === 'w' ? 'b' : 'w';

    // making sound
    if (isCapture) {
      this.soundService.playCapture();
    } else {
      this.soundService.playMove();
    }


  }

  undo() {
    if (this.history.length === 0) return;

    const previousState = this.history.pop()!.fen;
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


      const gameState: GameState = {
        board: [...this.board],
        turn: this.turnToPlay,
        castling: ChessUtils.getCastlingString(this.castlingRights),
        enPassant: null
      };
      this.threatMap = this.threatMap.concat(MoveGenerator.getPseudoLegalMoves(i, gameState, true).map(move => move.target));

    }
  }

  getMoves(index: number): Move[] {
    let piece = this.board[index];
    if (!piece) return [];
    if (this.turnToPlay !== ChessUtils.getPlayerType(piece)) return [];
    const gameState: GameState = {
      board: [...this.board],
      turn: this.turnToPlay,
      castling: ChessUtils.getCastlingString(this.castlingRights),
      enPassant: null
    };
    const moves = MoveValidator.getValidMoves(index, gameState, this.threatMap);
    this.activeMoves = moves.map(move => move.target);
    return moves;
  }

}
