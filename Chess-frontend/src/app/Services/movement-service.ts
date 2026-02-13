import { Injectable } from '@angular/core';
import { ChessUtils } from '../utils/chess-utils';

type Direction = 'north' | 'west' | 'east' | 'south' | 'northEast' | 'northWest' | 'southWest' | 'southEast'

@Injectable({
  providedIn: 'root',
})
export class MovementService {
  boardSweeper: Array<Record<Direction, number>> = [];
  readonly directions = [
    { 'west': -1 },
    { 'east': 1 },
    { 'north': -8 },
    { 'south': 8 },
    { 'northEast': -7 },
    { 'northWest': -9 },
    { 'southEast': 9 },
    { 'southWest': 7 }
  ] as const;

  constructor() {
    this.sweep();
  }


  sweep() {
    this.boardSweeper = new Array(64);

    for (let i = 0; i < 64; i++)  {
      const {row, column} = ChessUtils.getCoord(i);
      const distWest = column;
      const distEast = 7 - column;
      const distNorth = 7 - row;
      const distSouth = row;
      this.boardSweeper[i] = {
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

  }


  calculateMovement(piece: string, index: number, board: string[]) {
    if (ChessUtils.isSweeper(piece)) return this.calculateSweeper(piece, index, board);
    else if (ChessUtils.isKnight(piece)) return this.calculateKnight(piece, index, board);
    else return this.claculatePawn(piece, index, board);
  }

  calculateSweeper(piece: string, index: number, board: string[]) {}

  calculateKnight(piece: string, index: number, board: string[]) {}

  claculatePawn(piece: string, index: number, board: string[]) {}
}
