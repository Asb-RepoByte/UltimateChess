import { Injectable, signal } from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class DebugService {
    showSquareIndices = signal<boolean>(false);
    showThreatMap = signal<boolean>(false);
    showEnPassantTarget = signal<boolean>(false);

    constructor() { }

    toggleSquareIndices() {
        this.showSquareIndices.set(!this.showSquareIndices());
    }

    toggleThreatMap() {
        this.showThreatMap.set(!this.showThreatMap());
    }

    toggleEnPassantTarget() {
      this.showEnPassantTarget.set(!this.showEnPassantTarget());
    }
}
