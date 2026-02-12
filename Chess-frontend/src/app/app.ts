import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Board } from './Components/board/board';
import { SideBar } from './Components/side-bar/side-bar';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Board, SideBar],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('Chess-frontend');
}
