import { Component, inject, input, OnInit } from '@angular/core';
import { Piece } from '../piece/piece';
import { CdkDragDrop, DragDropModule } from "@angular/cdk/drag-drop";
import { ChessUtils } from '../../utils/chess-utils';
import { GameStateService } from '../../Services/game-state-service';

@Component({
  selector: 'chess-board',
  imports: [Piece, DragDropModule,],
  templateUrl: './board.html',
  styleUrl: './board.css',
})
export class Board {
  startPos = input<string>("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR");
  game = inject(GameStateService);
  readonly Utils = ChessUtils;

  ngOnInit() {
    this.game.initGame(this.startPos());
  }

  onDragStart(index: number) {
    console.log(this.game.getMoves(index));
  }

  onDrop(event: CdkDragDrop<number>) {
    const src = event.previousContainer.data;
    const target = event.container.data;

    this.game.handleMove(src, target);
    this.game.clearActiveMoves();
  }
}

