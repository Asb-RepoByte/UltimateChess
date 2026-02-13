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
    return piece.toLowerCase() in ['r', 'k', 'q', 'b'];
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

}
