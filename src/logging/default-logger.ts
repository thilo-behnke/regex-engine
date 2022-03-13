import {Logger} from "./logger";
import {LogLevel} from "./log-level";
import {LoggerImpl} from "./logger-impl";

export class DefaultLogger implements Logger {
    private readonly _logger: LoggerImpl
    private readonly _level: LogLevel
    private readonly _entity?: string

    constructor(logger: LoggerImpl, level: LogLevel, entity?: string) {
        this._logger = logger;
        this._level = level;
        this._entity = entity;
    }

    debug(msg: string): void {
        if (this._level > LogLevel.DEBUG) {
            return
        }
        this._logger.log({msg, level: LogLevel.DEBUG})
    }

    error(msg: string): void {
        if (this._level > LogLevel.ERROR) {
            return
        }
        this._logger.log({msg, level: LogLevel.ERROR})
    }

    info(msg: string): void {
        if (this._level > LogLevel.INFO) {
            return
        }
        this._logger.log({msg, level: LogLevel.INFO})
    }

    warn(msg: string): void {
        if (this._level > LogLevel.WARN) {
            return
        }
        this._logger.log({msg, level: LogLevel.WARN})
    }
}
