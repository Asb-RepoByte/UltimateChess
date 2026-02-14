import { Direction } from "./chess-types";

export class ChessUtils {
  static loadFEN(fen: string): Array<string> {
    let board = new Array(64).fill(""); // start with an empty board
    const fenPieces = fen.split(" ")[0];
    const rows = fenPieces.split("/");

    let currentPos = 0;
    for (const row  of rows) {
      for (const char of row) {
        if (isNaN(parseInt(char))) {
          board[currentPos] = char;
          currentPos++;
        } else {
          currentPos += parseInt(char);
        }

      }

    }

    return board
  }

  static getCoord(index: number) {
    return { "row": 7 - Math.floor(index / 8 ), "column": index % 8 };
  }

  static getColumLabel(column: number) {
    return String.fromCharCode(97 + column);
  }

  static isSquareBlack(index: number): boolean {
    let {row, column} = this.getCoord(index);
    return (row + column) % 2 === 0; // a square is black if the sum of row and column is odd
  }

  static isSweeper(piece: string): boolean {
    return ['r', 'k', 'q', 'b'].includes(piece.toLowerCase());
  }

  static isPawn(piece: string): boolean {
    return piece.toLowerCase() === 'p';
  }

  static isKnight(piece: string): boolean {
    return piece.toLowerCase() === 'n';
  }

  static getColor(piece: string) {
    return piece.toLowerCase() === piece ? "b" : "w";
  }

  static isFreind(piece: string, other: string): boolean {
    return this.getColor(piece) === this.getColor(other);
  }

  static getPieceDirections(piece: string, index: number = -1, board: string[] = []): {name: Direction, vector: number}[] | null {

    let rank = ChessUtils.getCoord(index).row;
    console.log("rank: " + rank);
    if (piece.toLowerCase() === 'p') {
      if (piece.toUpperCase() === piece) {
        // white pawn
        let pawnDirections: {name: Direction, vector: number}[] = [ { name: "north", vector: -8 } ];
        if (board[index - 7]) pawnDirections.push({name: "northEast", vector: -7});
        if (board[index - 9]) pawnDirections.push({name: "northWest", vector: -9});
        if (rank === 1) pawnDirections.push({ name: "northNorth", vector: -16 }); // white and first move
        return pawnDirections;

      } else {
        // black pawn
        let pawnDirections: {name: Direction, vector: number}[] = [ { name: "west", vector: 8 } ];
        if (board[index + 7]) pawnDirections.push({name: "southWest", vector: 7});
        if (board[index + 9]) pawnDirections.push({name: "southEast", vector: 9});
        if (rank === 6) pawnDirections.push({ name: "westWest", vector: 16 }); // black and first move
        return pawnDirections;

      }
    }
    if (piece.toLowerCase() === 'q') {
      return  [
        { name: "west", vector: -1 },
        { name: "east", vector: 1 },
        { name: "north", vector: -8 },
        { name: "south", vector: 8 },
        { name: "northEast", vector: -7 },
        { name: "northWest", vector: -9 },
        { name: "southEast", vector: 9 },
        { name: "southWest", vector: 7 },
      ];

    }

    if (piece.toLowerCase() === 'k') {
      return  [
        { name: "west", vector: -1 },
        { name: "east", vector: 1 },
        { name: "north", vector: -8 },
        { name: "south", vector: 8 },
        { name: "northEast", vector: -7 },
        { name: "northWest", vector: -9 },
        { name: "southEast", vector: 9 },
        { name: "southWest", vector: 7 },
      ];

    }

    if (piece.toLowerCase() === 'r') {
      return  [
        { name: "west", vector: -1 },
        { name: "east", vector: 1 },
        { name: "north", vector: -8 },
        { name: "south", vector: 8 },
      ];

    }

    if (piece.toLowerCase() === 'b') {
      return  [
        { name: "northEast", vector: -7 },
        { name: "northWest", vector: -9 },
        { name: "southEast", vector: 9 },
        { name: "southWest", vector: 7 },
      ];

    }

    return null;

  }

}
