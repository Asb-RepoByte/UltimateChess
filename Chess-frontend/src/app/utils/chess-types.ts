export type Direction = 'north' | 'west' | 'east' | 'south' | 'northEast' | 'northWest' | 'southWest' | 'southEast' | 'northNorth' | 'westWest' | 'N1' | 'N2' | 'N3' | 'N4' |  'N5' | 'N6' | 'N7' | 'N8'
export type ChessPlayer = 'w' | 'b'

// so for the knight directions I know they are bit weird but think of them this way start from the north west that's 1 and go counter clock wise

export interface GameState {
  board: string[];
  turn: 'w' | 'b';
  castling: string;
  enPassant: number | null;
}

export interface MoveHistoryEntry {
  san: string;
  fen: string; // The state AFTER the move
}
