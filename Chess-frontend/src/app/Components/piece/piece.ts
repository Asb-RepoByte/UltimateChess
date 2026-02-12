import { Component, input, computed } from '@angular/core';

@Component({
  selector: 'chess-piece',
  imports: [],
  templateUrl: './piece.html',
  styleUrl: './piece.css',
})
export class Piece {

  fen = input.required<string>();
  src = computed(() => {
    const color = this.fen() === this.fen().toUpperCase() ? "w" : "b";
    const type = this.fen().toLowerCase();
    return `/pieces/graffiti/${color + type}.png`

  })

}
