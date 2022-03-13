import {LogHandler} from "./log-handler";
import {LogLevel} from "./log-level";
import {LoggerImpl} from "./logger-impl";
import {Logger} from "./logger";
import {DefaultLogger} from "./default-logger";

export class DefaultLogHandler implements LogHandler {
    private readonly _logger: LoggerImpl

    private _level: LogLevel = LogLevel.DEBUG
    private _entityLevels: {[entity: string]: LogLevel} = {}

    constructor(logger: LoggerImpl) {
        this._logger = logger;
    }

    setLogLevel(level: LogLevel): void {
        this._level = level
    }

    setEntityLogLevel(...entityLevels: Array<[string, LogLevel]>): void {
        this._entityLevels = Object.fromEntries(entityLevels)
    }

    for(entity: string): Logger {
        return new DefaultLogger(this._logger, this._level, entity);
    }
}
