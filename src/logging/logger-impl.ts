import {LogMessage} from "./log-message";

export interface LoggerImpl {
    log(msg: LogMessage): void
}
