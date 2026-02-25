import { Move } from "../models/move.model";
import { ChessUtils } from "../utils/chess-utils";
import { Castling, Direction, GameState } from "../utils/chess-types";


export class MoveGenerator {

  private static _boardSweeper: Array<Record<Direction, number>> =  [];
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

      if (ChessUtils.isFreind(piece, other)) {
        continue;
      } else {
        moves.push(new Move(index, next, piece));
        continue;
      }

    }

    if (!threatMap) return moves;
    // white queen side
    if (isWhite && (rights & Castling.WhiteQueenside)) {
      // squares must be empty and king must not be in danger
      //
      console.log("and got here");
      if (!board[59] && !board[58] && !board[57]) {
        if (!threatMap[60] && !threatMap[59] && !threatMap[58]) {
          moves.push(new Move(index, 58, piece));
        }

      }
    }

    // white king side
    if (isWhite && (rights & Castling.WhiteKingside)) {
      // squares must be empty and king must not be in danger
      if (!board[62] && !board[61]) {
        if (!threatMap[60] && !threatMap[61]) {
          moves.push(new Move(index, 62, piece));
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

      // stup jumping through the black hole
      let p1 = ChessUtils.getCoord(index);
      let p2 = ChessUtils.getCoord(next);

      if ((p2.row - p2.row) ** 2 + (p2.column - p1.column) ** 2 > 5) continue;

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

  static claculatePawn(piece: string, index: number, board: string[], forThreat:boolean = false): Move[] {

    let moves: Array<Move> = new Array();
    let pieceDirections = ChessUtils.getPieceDirections(piece, index, board, forThreat=forThreat);

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
      // in case the square is empty
      if (!other) {
        moves.push(new Move(index, next, piece));
        continue;
      }

      // square not empty
      if (ChessUtils.isFreind(piece, other)) continue; // if friend no
      if (ChessUtils.getCoord(index).column !== ChessUtils.getCoord(next).column) {
        moves.push(new Move(index, next, piece))
        continue;
      }

    }

    return moves;
  }

  static getPseudoLegalMoves(index: number, gameState: GameState, forThreat:boolean = false, threatMap: number[] = []): Move[] {
    const board = gameState.board;
    const piece = board[index];

    if (piece.toLowerCase() === 'k') return this.calculateKing(piece, index, gameState, threatMap=threatMap);
    if (ChessUtils.isSweeper(piece)) return this.calculateSweeper(piece, index, gameState);
    else if (ChessUtils.isKnight(piece)) return this.calculateKnight(piece, index, board);
    else return this.claculatePawn(piece, index, board, forThreat = forThreat);

  }

}
