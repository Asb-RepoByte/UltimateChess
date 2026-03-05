import { Move } from "../models/move.model";
import { ChessUtils } from "../utils/chess-utils";
import { Castling, Direction, GameState } from "../utils/chess-types";
import { LoggerService } from "../Services/logger.service";
import { inject } from "@angular/core";


export class MoveGenerator {
  private static logger = new LoggerService();

  private static _boardSweeper: Array<Record<Direction, number>> = [];
  static readonly directions: { name: Direction, vector: number }[] = [
    { name: "west", vector: -1 },
    { name: "east", vector: 1 },
    { name: "north", vector: -8 },
    { name: "south", vector: 8 },
    { name: "northEast", vector: -7 },
    { name: "northWest", vector: -9 },
    { name: "southEast", vector: 9 },
    { name: "southWest", vector: 7 },
  ];


  static get boardSweeper(): Array<Record<Direction, number>> {
    if (this._boardSweeper.length === 0) {
      this._boardSweeper = this.initSweep();
      return this._boardSweeper;
    } else {
      return this._boardSweeper;
    }

  }

  static initSweep() {
    let sweeper = new Array(64);

    for (let i = 0; i < 64; i++) {
      const { row, column } = ChessUtils.getCoord(i);
      const distWest = column;
      const distEast = 7 - column;
      const distNorth = 7 - row;
      const distSouth = row;
      sweeper[i] = {
        west: distWest,
        east: distEast,
        south: distSouth,
        north: distNorth,
        northEast: Math.min(distNorth, distEast),
        northWest: Math.min(distNorth, distWest),
        southEast: Math.min(distSouth, distEast),
        southWest: Math.min(distSouth, distWest)
      };
    }

    return sweeper;

  }

  static calculateKing(piece: string, index: number, gameState: GameState, threatMap: number[]): Move[] {
    const board = gameState.board;
    const rights = ChessUtils.getCastlingBitMap(gameState.castling);
    const isWhite = ChessUtils.getPlayerType(piece) === 'w';
    let moves: Array<Move> = new Array();
    let pieceDirections = ChessUtils.getPieceDirections(piece);

    if (!pieceDirections) return [];

    for (let dirObj of pieceDirections) {
      const dir: Direction = dirObj.name;
      const vector = dirObj.vector;

      let next = index + vector;
      let other = board[next];

      // in case the square is empty
      if (!other) {
        moves.push(new Move(index, next, piece));
        continue;
      }

      // Calculate bounds for king wrapping check
      const p1 = ChessUtils.getCoord(index);
      const p2 = ChessUtils.getCoord(next);
      if (Math.abs(p2.column - p1.column) > 1) continue; // King cannot wrap around the board

      if (ChessUtils.isFreind(piece, other)) {
        continue;
      } else {
        moves.push(new Move(index, next, piece));
        continue;
      }

    }

    if (!threatMap) return moves;
    this.logger.debug("threat: ", threatMap);
    // white queen side
    if (isWhite && (rights & Castling.WhiteQueenside)) {
      // squares must be empty and king must not be in danger
      if (!board[59] && !board[58] && !board[57]) {
        if (!threatMap.includes(60) && !threatMap.includes(59) && !threatMap.includes(58)) {
          moves.push(new Move(index, 58, piece, false, undefined, true));
        }
      }
    }

    // white king side
    if (isWhite && (rights & Castling.WhiteKingside)) {
      // squares must be empty and king must not be in danger
      if (!board[62] && !board[61]) {
        if (!threatMap.includes(60) && !threatMap.includes(61)) {
          moves.push(new Move(index, 62, piece, false, undefined, true));
        }
      }
    }

    // black queen side
    if (!isWhite && (rights & Castling.BlackQueenside)) {
      // squares must be empty and king must not be in danger
      if (!board[1] && !board[2] && !board[3]) {
        if (!threatMap.includes(3) && !threatMap.includes(4)) {
          moves.push(new Move(index, 2, piece, false, undefined, true));
        }
      }
    }

    // black king side
    if (!isWhite && (rights & Castling.BlackKingside)) {
      // squares must be empty and king must not be in danger
      if (!board[5] && !board[6]) {
        if (!threatMap.includes(4) && !threatMap.includes(5)) {
          moves.push(new Move(index, 6, piece, false, undefined, true));
        }
      }
    }


    return moves;
  }

  static calculateSweeper(piece: string, index: number, gameState: GameState): Move[] {
    const board = gameState.board;
    let moves: Array<Move> = new Array();
    let pieceDirections = ChessUtils.getPieceDirections(piece);

    // in case of null
    if (!pieceDirections) return new Array();


    for (let dirObj of pieceDirections) {
      const dir: Direction = dirObj.name;
      const vector = dirObj.vector;

      for (let i = 1; i <= this.boardSweeper[index][dir]; i++) {
        let next = index + i * vector;
        let other = board[next];

        // in case the square is empty
        if (!other) {
          moves.push(new Move(index, next, piece));
          continue;
        }

        if (ChessUtils.isFreind(piece, other)) {
          break;
        } else {
          moves.push(new Move(index, next, piece));
          break;
        }

      }
    }

    return moves;

  }

  static calculateKnight(piece: string, index: number, board: string[]): Move[] {

    let moves: Array<Move> = new Array();
    let pieceDirections = ChessUtils.getPieceDirections(piece, index, board);

    // in case of null
    if (!pieceDirections) return new Array();

    for (let dirObj of pieceDirections) {
      const dir: Direction = dirObj.name;
      const vector = dirObj.vector;

      let next = index + vector;
      let other = board[next];

      // stop jumping through the black hole (wrapping around columns/rows)
      let p1 = ChessUtils.getCoord(index);
      let p2 = ChessUtils.getCoord(next);

      // Prevent jumping off the board directly
      if (next < 0 || next > 63) continue;

      // Fix coordinate distance diff logic
      if ((p2.row - p1.row) ** 2 + (p2.column - p1.column) ** 2 > 5) continue;

      // in case the square is empty
      if (!other) {
        moves.push(new Move(index, next, piece));
        continue;
      }

      // square not empty
      if (ChessUtils.isFreind(piece, other)) continue; // if friend no
      else {
        moves.push(new Move(index, next, piece))
        continue;
      }

    }

    return moves;

  }

  static calculatePawn(piece: string, index: number, gameState: GameState, forThreat: boolean = false): Move[] {
    const board = gameState.board;
    let moves: Array<Move> = new Array();
    let pieceDirections = ChessUtils.getPieceDirections(piece, index, board, forThreat = forThreat);

    // in case of null
    if (!pieceDirections) return new Array();

    for (let dirObj of pieceDirections) {
      const dir: Direction = dirObj.name;
      const vector = dirObj.vector;

      let next = index + vector;
      let other = board[next];

      if (Math.abs(vector) === 16 && board[index + (vector / Math.abs(vector)) * 8]) continue; // stop jumping over pieces

      const p1 = ChessUtils.getCoord(index);
      const p2 = ChessUtils.getCoord(next);
      if (((p2.row - p1.row) ** 2 + (p2.column - p1.column) ** 2) > 4) continue;
      const isPromotion = ChessUtils.getCoord(next).row === 0 || ChessUtils.getCoord(next).row === 7;

      // in case the square is empty
      if (!other) {
        // En Passant check (diagonal move to empty square that matches enPassant index)
        if (gameState.enPassant === next && Math.abs(vector) !== 8 && Math.abs(vector) !== 16) {
          moves.push(new Move(index, next, piece, true, undefined, false, true));
          continue;
        }
        // stop moving diagonaly when no enemy piece is there
        if (ChessUtils.getCoord(index).column !== ChessUtils.getCoord(next).column) continue;

        if (isPromotion) {
          const promotions = piece.toUpperCase() === piece ? ['Q', 'R', 'B', 'N'] : ['q', 'r', 'b', 'n'];
          promotions.forEach(promo => moves.push(new Move(index, next, piece, false, promo)));
        } else {
          // normal forward move
          moves.push(new Move(index, next, piece));
        }

        continue;
      }

      // square not empty
      if (ChessUtils.isFreind(piece, other)) continue; // if friend no
      if (ChessUtils.getCoord(index).column !== ChessUtils.getCoord(next).column) {
        // Standard Capture
        if (isPromotion) {
          const promotions = piece.toUpperCase() === piece ? ['Q', 'R', 'B', 'N'] : ['q', 'r', 'b', 'n'];
          promotions.forEach(promo => moves.push(new Move(index, next, piece, true, promo)));
        } else {
          moves.push(new Move(index, next, piece, true));
        }
        continue;
      }

    }

    return moves;
  }

  static getPseudoLegalMoves(index: number, gameState: GameState, forThreat: boolean = false, threatMap: number[] = []): Move[] {
    const board = gameState.board;
    const piece = board[index];

    if (piece.toLowerCase() === 'k') return this.calculateKing(piece, index, gameState, threatMap = threatMap);
    if (ChessUtils.isSweeper(piece)) return this.calculateSweeper(piece, index, gameState);
    else if (ChessUtils.isKnight(piece)) return this.calculateKnight(piece, index, board);
    else return this.calculatePawn(piece, index, gameState, forThreat = forThreat);

  }

}
