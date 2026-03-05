import { Component, inject, input, OnInit } from '@angular/core';
import { Piece } from '../piece/piece';
import { CdkDragDrop, DragDropModule } from "@angular/cdk/drag-drop";
import { ChessUtils } from '../../utils/chess-utils';
import { GameStateService } from '../../Services/game-state-service';
import { DebugService } from '../../Services/debug.service';

@Component({
  selector: 'chess-board',
  imports: [Piece, DragDropModule,],
  templateUrl: './board.html',
  styleUrl: './board.css',
})
export class Board {
  startPos = input<string>("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq");
  game = inject(GameStateService);
  debugService = inject(DebugService);
  readonly Utils = ChessUtils;

  ngOnInit() {
    this.game.initGame(this.startPos());
    this.game.turnToPlay = 'b';
    this.game.updateThreatMap();
    this.game.turnToPlay = 'w';
  }

  onDragStart(index: number, main: boolean = false) {
    this.game.getMoves(index, main);
  }

  onUnSelect(index: number) {
    this.game.clearActiveMoves();
  }

  onDrop(event: CdkDragDrop<number>) {
    const src = event.previousContainer.data;
    const target = event.container.data;

    this.game.handleMove(src, target);
    this.game.clearActiveMoves();
  }
}

