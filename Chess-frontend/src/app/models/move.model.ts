export class Move {
  constructor(
    public src: number,
    public target: number,
    public piece: string,
    public isCapture: boolean = false,
    public promotion?: string,
    public isCastling: boolean = false,
    public enPassant: boolean = false
  ) {}

}
