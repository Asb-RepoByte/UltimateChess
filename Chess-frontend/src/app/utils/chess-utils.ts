import { MoveGenerator } from "../engine/move-generator";
import { ChessPlayer, Direction, GameState } from "./chess-types";

export class ChessUtils {
  static loadFEN(fen: string): GameState {
    let board = new Array(64).fill(""); // start with an empty board
    const fenPieces = fen.split(" ")[0];
    const turn: 'w' | 'b' = (fen.split(" ")[1] === 'w') ? 'w' : 'b';
    const rows = fenPieces.split("/");

    let currentPos = 0;
    for (const row of rows) {
      for (const char of row) {
        if (isNaN(parseInt(char))) {
          board[currentPos] = char;
          currentPos++;
        } else {
          currentPos += parseInt(char);
        }

      }

    }

    return { board: board, turn: turn, castling: "", enPassant: null }
  }

  static exportFEN(gameState: GameState): string {
    let fen = "";
    for (let row = 0; row < 8; row++) {
      let emptyCount = 0;
      for (let col = 0; col < 8; col++) {
        const piece = gameState.board[row * 8 + col];
        if (piece === "") {
          emptyCount++;
        } else {
          if (emptyCount > 0) {
            fen += emptyCount;
            emptyCount = 0;
          }
          fen += piece;
        }
      }
      if (emptyCount > 0) fen += emptyCount;
      if (row < 7) fen += "/";
    }
    // For a full FEN, you'd append " w KQkq - 0 1" etc. here
    return fen + " " + gameState.turn;

  }

  static getCoord(index: number) {
    return { "row": 7 - Math.floor(index / 8), "column": index % 8 };
  }

  static getColumLabel(column: number) {
    return String.fromCharCode(97 + column);
  }

  static isSquareBlack(index: number): boolean {
    let { row, column } = this.getCoord(index);
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

  static getPieceDirections(piece: string, index: number = -1, board: string[] = [], forThreat: boolean = false): { name: Direction, vector: number }[] | null {

    let rank = ChessUtils.getCoord(index).row;
    if (piece.toLowerCase() === 'p') {
      if (forThreat) {
        if (this.getPlayerType(piece) === 'w') {
          return [{ name: 'northWest', vector: -9 }, { name: 'northEast', vector: -7 }];
        } else {
          return [{ name: 'southWest', vector: 7 }, { name: 'southEast', vector: 9 }];
        }
      }
      if (piece.toUpperCase() === piece) {
        // white pawn
        let pawnDirections: { name: Direction, vector: number }[] = [{ name: "north", vector: -8 }];
        if (board[index - 7]) pawnDirections.push({ name: "northEast", vector: -7 });
        if (board[index - 9]) pawnDirections.push({ name: "northWest", vector: -9 });
        if (rank === 1) pawnDirections.push({ name: "northNorth", vector: -16 }); // white and first move
        return pawnDirections;

      } else {
        // black pawn
        let pawnDirections: { name: Direction, vector: number }[] = [{ name: "west", vector: 8 }];
        if (board[index + 7]) pawnDirections.push({ name: "southWest", vector: 7 });
        if (board[index + 9]) pawnDirections.push({ name: "southEast", vector: 9 });
        if (rank === 6) pawnDirections.push({ name: "westWest", vector: 16 }); // black and first move
        return pawnDirections;

      }
    }

    if (piece.toLowerCase() === 'n') {
      return [
        { name: 'N1', vector: -17 },
        { name: 'N2', vector: -10 },
        { name: 'N3', vector: 6 },
        { name: 'N4', vector: 15 },
        { name: 'N5', vector: 17 },
        { name: 'N6', vector: 10 },
        { name: 'N7', vector: -6 },
        { name: 'N8', vector: -15 },
      ]

    }

    if (piece.toLowerCase() === 'q') {
      return [
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
      return [
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
      return [
        { name: "west", vector: -1 },
        { name: "east", vector: 1 },
        { name: "north", vector: -8 },
        { name: "south", vector: 8 },
      ];

    }

    if (piece.toLowerCase() === 'b') {
      return [
        { name: "northEast", vector: -7 },
        { name: "northWest", vector: -9 },
        { name: "southEast", vector: 9 },
        { name: "southWest", vector: 7 },
      ];

    }

    return null;

  }

  static isKingInDanger(piece: string, board: string[]): boolean {
    let king = piece.toLowerCase() === piece ? 'k' : 'K';
    let kingIndex = board.findIndex(x => x === king);

    for (let i = 0; i < board.length; i++) {
      let other = board[i];
      if (!other || ChessUtils.isFreind(piece, other)) continue;

      let targetSquares = MoveGenerator.getPseudoLegalMoves(i, board).map(move => move.target);

      if (targetSquares.includes(kingIndex)) return true;

    }
    return false;
  }

  static getPlayerType(piece: string): ChessPlayer {
    if (piece.toUpperCase() === piece) return 'w';
    return 'b';

  }

}
