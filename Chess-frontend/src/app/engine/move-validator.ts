import { Move } from "../models/move.model";
import { ChessUtils } from "../utils/chess-utils";
import { MoveGenerator } from "./move-generator";

export class MoveValidator {
  static getValidMoves(index: number, board: string[]) {
    let pseudoMoves = MoveGenerator.getPseudoLegalMoves(index, board);
    let moves = new Array();

    for (const move of pseudoMoves) {
      let newBoard = [...board];

      newBoard[move.target] = move.piece;
      newBoard[move.src] = '';

      if (!ChessUtils.isKingInDanger(move.piece, newBoard)) moves.push(move);

    }

    return moves;

  }
}
