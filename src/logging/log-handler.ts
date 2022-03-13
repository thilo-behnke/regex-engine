import {Logger} from "./logger";
import {LogLevel} from "./log-level";

export interface LogHandler {
    setLogLevel(level: LogLevel): void
    setEntityLogLevel(...entityLevels: Array<[string, LogLevel]>): void

    for(entity: string): Logger
}
