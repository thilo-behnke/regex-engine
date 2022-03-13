import RegexEngine from "./engine/regex-engine";
import {LoggerFactory} from "./logging/logger-factory";

const engine = new RegexEngine()
const res = engine.match("test", "t*(st)")
const logger = LoggerFactory.for('main')
logger.info("Result: " + JSON.stringify({res, groups: engine.groups, matched: engine.matched}))
