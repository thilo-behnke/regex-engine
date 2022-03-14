import {DefaultLogHandler} from "./default-log-handler";
import {ConsoleLogger} from "./console-logger";
import {DefaultLogFormatter} from "./default-log-formatter";
import {Logger} from "./logger";
import {LogHandler} from "./log-handler";
import {NoopLogger} from "./noop-logger";

export class LoggerFactory {
    private static _handler: LogHandler = this.getConsole()

    public static console() {
        this._handler = this.getConsole()
    }

    public static noop() {
        this._handler = this.getNoop()
    }

    private static getConsole() {
        return new DefaultLogHandler(new ConsoleLogger(new DefaultLogFormatter()))
    }

    private static getNoop() {
        return new DefaultLogHandler(new NoopLogger())
    }

    public static for(entity: string) {
        return this._handler.for(entity)
    }
}
