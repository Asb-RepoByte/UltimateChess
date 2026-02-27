import { MoveGenerator } from "../engine/move-generator";
import { ChessPlayer, Direction, GameState, Castling } from "./chess-types";
import { Move } from "../models/move.model";

export class ChessUtils {
  static loadFEN(fen: string): GameState {
    let board = new Array(64).fill(""); // start with an empty board
    const fenPieces = fen.split(" ")[0];
    const turn: 'w' | 'b' = (fen.split(" ")[1] === 'w') ? 'w' : 'b';
    const castlingRights = fen.split(" ")[2];
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
    return { board: board, turn: turn, castling: castlingRights, enPassant: null }
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
    return fen + " " + gameState.turn + " " + gameState.castling;

  }

  static getCastlingString(castlingRights: number): string {
    let res = '';
    if (castlingRights & Castling.WhiteKingside) res += 'K';
    if (castlingRights & Castling.WhiteQueenside) res += 'Q';
    if (castlingRights & Castling.BlackKingside) res += 'k';
    if (castlingRights & Castling.BlackQueenside) res += 'q';

    return res || '-';
  }

  static getCastlingBitMap(castlingRights: string): number {
    let rights = 0;
    if (castlingRights.includes("Q")) rights |= Castling.WhiteQueenside;
    if (castlingRights.includes("K")) rights |= Castling.WhiteKingside;
    if (castlingRights.includes("q")) rights |= Castling.BlackQueenside;
    if (castlingRights.includes("k")) rights |= Castling.BlackKingside;

    return rights;
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
    return ['r', 'q', 'b'].includes(piece.toLowerCase());
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

      const gameState: GameState = {
        board: board,
        turn: 'w',
        castling: "",
        enPassant: null
      };
      let targetSquares = MoveGenerator.getPseudoLegalMoves(i, gameState).map(move => move.target);

      if (targetSquares.includes(kingIndex)) return true;

    }
    return false;
  }

  static getPlayerType(piece: string): ChessPlayer {
    if (piece.toUpperCase() === piece) return 'w';
    return 'b';

  }

  static getIndexToCoord(index: number) {
    return this.getColumLabel(ChessUtils.getCoord(index).column) + (ChessUtils.getCoord(index).row + 1);
  }

  static getSAN(move: Move, board: string[], allLegalMoves: Move[]): string {
    const piece = move.piece.toUpperCase();
    const targetSquare = this.getIndexToCoord(move.target); // e.g., "e4"

    // 1. Castling (Special Case)
    if (piece === 'K') {
      if (move.src === 4 && move.target === 6) return 'O-O';
      if (move.src === 4 && move.target === 2) return 'O-O-O';
      if (move.src === 60 && move.target === 62) return 'O-O';
      if (move.src === 60 && move.target === 58) return 'O-O-O';
    }

    let san = '';

    // 2. Piece Letter (None for Pawns)
    if (piece !== 'P') {
      san += piece;

      // 3. Disambiguation
      // Find all other pieces of the same type that could move to this target
      const duplicates = allLegalMoves.filter(m =>
        m.target === move.target &&
        m.src !== move.src &&
        board[m.src].toUpperCase() === piece
      );

      if (duplicates.length > 0) {
        const srcCoord = this.getCoord(move.src);
        const hasSameFile = duplicates.some(m => this.getCoord(m.src).column === srcCoord.column);
        const hasSameRank = duplicates.some(m => this.getCoord(m.src).row === srcCoord.row);

        if (!hasSameFile) {
          san += this.getColumLabel(srcCoord.column);
        } else if (!hasSameRank) {
          san += (srcCoord.row + 1).toString();
        } else {
          san += this.getColumLabel(srcCoord.column) + (srcCoord.row + 1).toString();
        }
      }
    }

    // 4. Captures
    if (move.isCapture) {
      if (piece === 'P') {
        // Pawns must show their starting file on capture (e.g., "exd5")
        san += this.getColumLabel(this.getCoord(move.src).column);
      }
      san += 'x';
    }

    // 5. Target Square
    san += targetSquare;

    // 6. Promotion (Example: e8=Q)
    // You'll need to add a 'promotion' property to your Move object later
    // if (move.promotion) san += "=" + move.promotion.toUpperCase();

    return san;
  }

}
