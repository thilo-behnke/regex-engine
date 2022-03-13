import {LogMessage} from "./log-message";

export interface LogFormatter {
    format(msg: LogMessage): string
}
