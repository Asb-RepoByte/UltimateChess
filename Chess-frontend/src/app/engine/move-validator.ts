import { Move } from "../models/move.model";
import { ChessUtils } from "../utils/chess-utils";
import { MoveGenerator } from "./move-generator";
import { GameState } from "../utils/chess-types";

export class MoveValidator {
  static getValidMoves(index: number, gameState: GameState) {
    const board = gameState.board;
    let pseudoMoves = MoveGenerator.getPseudoLegalMoves(index, gameState);
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
