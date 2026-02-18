import { Injectable, inject } from '@angular/core';
import { SoundService } from './sound-service';
import { ChessUtils } from '../utils/chess-utils';
import { MoveGenerator } from '../engine/move-generator';
import { Move } from '../models/move.model';
import { MoveValidator } from '../engine/move-validator';
import { ChessPlayer } from '../utils/chess-types';
import { MoveHistoryEntry } from '../utils/chess-types';


@Injectable({
  providedIn: 'root',
})
export class GameStateService {
  private soundService = inject(SoundService);
  private _board: string[] = [];
  public san: string = '';
  public threatMap: number[] = [];
  public history: MoveHistoryEntry[] = [];
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
    const piece = this._board[src];
    const isCapture = !!this._board[target];
    const move = new Move(src, target, piece, isCapture);

    if (this.turnToPlay !== ChessUtils.getPlayerType(piece)) return;
    if (src === target) return; // if the target move is the same as the source return

    // making sound
    if (isCapture) {
      this.soundService.playCapture();
    } else {
      this.soundService.playMove();
    }

    const allLegalMoves = this.getMoves(src);

    if (!this.activeMoves.includes(target)) return; // only make the moves if it's on the set of possible moves

    const san = ChessUtils.getSAN(move, [...this._board], allLegalMoves);
    this.history.push({ fen: this.exportFEN(), san: san }); // pushing the state to the history before making the move
    this.lastMove = move;
    this.san = ChessUtils.getSAN(move, [...this._board], allLegalMoves);

    // actually making the move
    this._board[target] = piece;
    this._board[src] = "";

    // updating everything that needs to be updated
    this.updateThreatMap();
    this.turnToPlay = this.turnToPlay === 'w' ? 'b' : 'w';


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

      console.log("piece: ", piece);
      this.threatMap = this.threatMap.concat(MoveGenerator.getPseudoLegalMoves(i, [...this.board], true).map(move => move.target));

    }

    console.log("threat: ", this.threatMap);
  }

  getMoves(index: number): Move[] {
    let piece = this.board[index];
    if (!piece) return [];
    if (this.turnToPlay !== ChessUtils.getPlayerType(piece)) return [];
    const moves = MoveValidator.getValidMoves(index, [...this._board]);
    this.activeMoves = moves.map(move => move.target);
    return moves;
  }

}
