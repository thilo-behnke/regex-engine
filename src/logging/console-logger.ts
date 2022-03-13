import {LoggerImpl} from "./logger-impl";
import {LogMessage} from "./log-message";
import {LogLevel} from "./log-level";
import {LogFormatter} from "./log-formatter";

export class ConsoleLogger implements LoggerImpl {
    private readonly _logFormatter: LogFormatter

    constructor(logFormatter: LogFormatter) {
        this._logFormatter = logFormatter;
    }

    log(msg: LogMessage): void {
        const message = this._logFormatter.format(msg)
        switch(msg.level) {
            case LogLevel.DEBUG:
                console.debug(message)
                break
            case LogLevel.INFO:
                console.log(message);
                break
            case LogLevel.WARN:
                console.warn(message)
                break
            case LogLevel.ERROR:
                console.error(message)
                break
        }
    }
}
