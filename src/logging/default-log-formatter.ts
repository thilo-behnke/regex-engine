import {LogFormatter} from "./log-formatter";
import {LogLevel} from "./log-level";
import {LogMessage} from "./log-message";
import {max, range, rangeWithValue} from "../utils/array-utils";

export class DefaultLogFormatter implements LogFormatter {
    format(msg: LogMessage): string {
        const maxLogLevelLength = max(Object.keys(LogLevel).map(it => it.length))
        const thisLevel = LogLevel[msg.level]
        const padding = rangeWithValue(maxLogLevelLength - thisLevel.length + 1, ' ').join('')
        return `[${thisLevel}]${padding}: ${msg.msg}`
    }
}
