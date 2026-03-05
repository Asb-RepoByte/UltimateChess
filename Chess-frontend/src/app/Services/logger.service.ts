import { Injectable, signal } from '@angular/core';
import { environment } from '../../environments/environment';

export enum LogLevel {
    DEBUG = 0,
    INFO = 1,
    WARN = 2,
    ERROR = 3,
    NONE = 4
}

@Injectable({
    providedIn: 'root'
})
export class LoggerService {
    currentLevel = signal<LogLevel>(environment.production ? LogLevel.NONE : LogLevel.INFO); // Default to INFO in dev, NONE in prod

    constructor() { }

    setLevel(level: LogLevel) {
        if (!environment.production) {
            this.currentLevel.set(level);
        }
    }

    debug(message: string, ...optionalParams: any[]) {
        if (this.currentLevel() <= LogLevel.DEBUG) {
            console.log(`[DEBUG] ${message}`, ...optionalParams);
        }
    }

    info(message: string, ...optionalParams: any[]) {
        if (this.currentLevel() <= LogLevel.INFO) {
            console.info(`[INFO] ${message}`, ...optionalParams);
        }
    }

    warn(message: string, ...optionalParams: any[]) {
        if (this.currentLevel() <= LogLevel.WARN) {
            console.warn(`[WARN] ${message}`, ...optionalParams);
        }
    }

    error(message: string, ...optionalParams: any[]) {
        if (this.currentLevel() <= LogLevel.ERROR) {
            console.error(`[ERROR] ${message}`, ...optionalParams);
        }
    }
}
