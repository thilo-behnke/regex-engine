import RegexEngine from "./engine/regex-engine";

const engine = new RegexEngine()
const res = engine.match("test", "t*(st)")
console.log({res, groups: engine.groups})
