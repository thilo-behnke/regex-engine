import {LogLevel} from "./log-level";

export type LogMessage = {
    msg: string,
    level: LogLevel,
    entity?: string
}
