import { Move } from "../models/move.model";
import { ChessUtils } from "../utils/chess-utils";
import { Direction } from "../utils/chess-types";


export class MoveGenerator {

  private static boardSweeper: Array<Record<Direction, number>> = MoveGenerator.initSweep();
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

  static calculateSweeper(piece: string, index: number, board: string[]): Move[] {
    let moves: Array<Move> = new Array();
    let pieceDirections = ChessUtils.getPieceDirections(piece);

    console.log("this is a sweeper");

    // in case of null
    console.log("directions:", pieceDirections);
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

  static calculateKnight(piece: string, index: number, board: string[]): Move[] { return new Array(); }

  static claculatePawn(piece: string, index: number, board: string[]): Move[] {

    let moves: Array<Move> = new Array();
    let pieceDirections = ChessUtils.getPieceDirections(piece, index, board);

    console.log("this is a pawn");

    // in case of null
    console.log("directions:", pieceDirections);
    if (!pieceDirections) return new Array();

    for (let dirObj of pieceDirections) {
      const dir: Direction = dirObj.name;
      const vector = dirObj.vector;

      let next = index + vector;
      let other = board[next];

      if (Math.abs(vector) === 16 && board[index + (vector / Math.abs(vector)) * 8]) continue; // stop jumping over pieces

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

  static getPseudoLegalMoves(index: number, board: string[]): Move[] {
    console.log("this pseudo legal");
    const piece = board[index];

    if (ChessUtils.isSweeper(piece)) return this.calculateSweeper(piece, index, board);
    else if (ChessUtils.isKnight(piece)) return this.calculateKnight(piece, index, board);
    else return this.claculatePawn(piece, index, board);

  }

}
