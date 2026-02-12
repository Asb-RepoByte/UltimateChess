import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class SoundService {

  private moveSound = new Audio("/sounds/move-self.mp3");
  private captureSound = new Audio("/sounds/capture.mp3")
  private checkSound = new Audio("/sounds/move-check.mp3")

  playMove() {
    this.moveSound.currentTime = 0;
    this.moveSound.play();
  }

  playCapture() {
    this.captureSound.currentTime = 0;
    this.captureSound.play();
  }

  playCheck() {
    this.checkSound.currentTime = 0;
    this.checkSound.play();
  }

}
