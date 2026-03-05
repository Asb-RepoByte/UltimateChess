import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DebugService } from '../../Services/debug.service';
import { LoggerService, LogLevel } from '../../Services/logger.service';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-side-bar',
  imports: [CommonModule],
  templateUrl: './side-bar.html',
  styleUrl: './side-bar.css',
})
export class SideBar {
  debugService = inject(DebugService);
  logger = inject(LoggerService);
  isProduction = environment.production;

  readonly LogLevel = LogLevel;

  onLogLevelChange(event: Event) {
    const select = event.target as HTMLSelectElement;
    this.logger.setLevel(Number(select.value) as LogLevel);
  }
}
