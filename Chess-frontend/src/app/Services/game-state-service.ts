import { Injectable, inject } from '@angular/core';
import { SoundService } from './sound-service';
import { ChessUtils } from '../utils/chess-utils';
import { Move } from '../models/move.model';
import { MoveGenerator } from '../engine/move-generator';
import { MoveValidator } from '../engine/move-validator';
import { MoveHistoryEntry, GameState, ChessPlayer, Castling } from '../utils/chess-types';


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
    this.castlingRights = ChessUtils.getCastlingBitMap(gameState.castling);
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

    if (!piece) return
    if (this.turnToPlay !== ChessUtils.getPlayerType(piece)) return;
    if (src === target) return; // if the target move is the same as the source return

    const allLegalMoves = this.getMoves(src);
    const move = allLegalMoves.find(m => m.src === src && m.target === target);
    if (!move) return; // only make the move if it's in the set of legal moves

    const san = ChessUtils.getSAN(move, [...this._board], allLegalMoves);
    const fen = this.exportFEN();
    console.log(fen);
    this.history.push({ fen: fen, san: san }); // pushing the state to the history before making the move
    this.lastMove = move;

    if (move.isCastling) {
      this.handleCastling(move);
    } else if (move.promotion) {
      this.handlePromotion();
    } else if (move.enPassant) {
      this.handleEnPassant();
    }
    else {
      // actually making the move
      this._board[target] = piece;
      this._board[src] = "";

    }

    this.handleCastlingRights(piece, move);

    // updating everything that needs to be updated
    this.turnToPlay = this.turnToPlay === 'w' ? 'b' : 'w';
    this.updateThreatMap()

    // making sound
    if (isCapture) {
      this.soundService.playCapture();
    } else {
      this.soundService.playMove();
    }
  }

  handleCastlingRights(piece: string, move: Move) {
    if (piece.toLowerCase() === 'k') {
      if (ChessUtils.getPlayerType(piece) === 'w') {
        this.castlingRights &= ~Castling.WhiteKingside;
        this.castlingRights &= ~Castling.WhiteQueenside;
      } else {
        this.castlingRights &= ~Castling.BlackQueenside;
        this.castlingRights &= ~Castling.BlackKingside;

      }
    }

    if (piece.toLowerCase() === 'r') {
      if (ChessUtils.getPlayerType(piece) === 'w') {
        if (move.src === 56)
          this.castlingRights &= ~Castling.WhiteQueenside;
        if (move.src === 63)
          this.castlingRights &= ~Castling.WhiteKingside;
      } else {
        if (move.src === 0)
          this.castlingRights &= ~Castling.BlackQueenside;
        if (move.src === 7)
          this.castlingRights &= ~Castling.BlackKingside;
      }
    }
  }

  handleCastling(move: Move) {
    if (move.src === 60) { // white king
      if (move.target === 62 && (this.castlingRights & Castling.WhiteKingside)) { // king side
        this._board[move.target] = 'K';
        this._board[move.src] = '';
        this._board[61] = 'R';
        this._board[63] = '';
      }
      if (move.target === 58 && (this.castlingRights & Castling.WhiteQueenside)) { // king side
        this._board[move.target] = 'K';
        this._board[move.src] = '';
        this._board[59] = 'R';
        this._board[56] = '';
      }

    }
    if (move.src === 4) { // black king
      if (move.target === 6 && (this.castlingRights & Castling.BlackKingside)) { // king side
        this._board[move.target] = 'k';
        this._board[move.src] = '';
        this._board[5] = 'r';
        this._board[7] = '';
      }
      if (move.target === 2 && (this.castlingRights & Castling.BlackQueenside)) { // king side
        this._board[move.target] = 'k';
        this._board[move.src] = '';
        this._board[3] = 'r';
        this._board[0] = '';
      }

    }

  }

  handlePromotion() {

  }

  handleEnPassant() {

  }

  undo() {
    if (this.history.length === 0) return;

    const previousState = this.history.pop()!.fen;
    console.log(previousState);
    this.loadFEN(previousState);
    this.updateThreatMap();
    this.soundService.playMove();
  }

  redo() {}

  updateThreatMap() {
    const gameState: GameState = {
      board: [...this.board],
      turn: this.turnToPlay,
      castling: ChessUtils.getCastlingString(this.castlingRights),
      enPassant: null
    };
    this.threatMap = new Array();
    for (let i = 0; i < this._board.length; i++) {
      let piece = this._board[i];
      if (!piece) continue;

      if (this.turnToPlay === 'w' && ChessUtils.getPlayerType(piece) === 'w') continue;
      if (this.turnToPlay === 'b' && ChessUtils.getPlayerType(piece) === 'b') continue;
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
