import { Component, input, OnInit } from '@angular/core';
import { Piece } from '../piece/piece';
import { CdkDragDrop, DragDropModule } from "@angular/cdk/drag-drop";
import { SoundService } from '../../Services/sound-service';

@Component({
  selector: 'chess-board',
  imports: [Piece, DragDropModule],
  templateUrl: './board.html',
  styleUrl: './board.css',
})
export class Board {
  startPos = input<string>("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR");
  board: string[] = [];
  soundService: SoundService;

  constructor(soundService: SoundService) {
    this.soundService = soundService;
  }

  ngOnInit() {
    this.boardSetup(this.startPos());
  }

  boardSetup(startPos: string) {
    this.board = Array(64).fill(""); // start with an empty board
    const fenPieces = startPos.split(" ")[0];
    const rows = fenPieces.split("/");

    let currentPos = 0;
    for (const row  of rows) {
      for (const char of row) {
        if (isNaN(parseInt(char))) {
          this.board[currentPos] = char;
          currentPos++;
        } else {
          currentPos += parseInt(char);
        }

      }

    }
  }

  onDrop(event: CdkDragDrop<number>) {
    const initialPos = event.previousContainer.data;
    const targetPos = event.container.data;

    if (initialPos === targetPos) return;

    if (this.board[targetPos]) {
      this.soundService.playCapture();
    } else {
      this.soundService.playMove();
    }

    const piece = this.board[initialPos];
    this.board[initialPos] = ""
    this.board[targetPos] = piece;
  }

  getCoord(index: number) {
    return { "row": 7 - Math.floor(index / 8 ), "column": index % 8 };
  }

  getColumLabel(column: number) {
    return String.fromCharCode(97 + column);
  }

  isBlack(index: number): boolean {
    let {row, column} = this.getCoord(index);
    return (row + column) % 2 === 0; // a square is black if the sum of row and column is odd
  }

}
