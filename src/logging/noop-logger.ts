import {Logger} from "./logger";
import {LoggerImpl} from "./logger-impl";
import {LogMessage} from "./log-message";

export class NoopLogger implements LoggerImpl {
    log(msg: LogMessage): void {
    }
}
