import {DefaultLogHandler} from "./default-log-handler";
import {ConsoleLogger} from "./console-logger";
import {DefaultLogFormatter} from "./default-log-formatter";
import {Logger} from "./logger";
import {LogHandler} from "./log-handler";

export class LoggerFactory {
    private static _handler: LogHandler = this.getConsole()

    public static console() {
        this._handler = this.getConsole()
    }

    private static getConsole() {
        return new DefaultLogHandler(new ConsoleLogger(new DefaultLogFormatter()))
    }

    public static for(entity: string) {
        return this._handler.for(entity)
    }
}
