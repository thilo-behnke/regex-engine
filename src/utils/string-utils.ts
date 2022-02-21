import CharacterFactory from "../model/factory/character-factory";
import {range} from "./array-utils";

const explode = (s: string) => {
    return s.split('');
}

const explodeWithEscapes = (s: string) => {
    const chars = explode(s)
    const res: string[] = []
    for (let i = 0; i < chars.length; i++) {
        const val = chars[i]

        if (val !== "\\") {
            res.push(val)
            continue
        }

        const next = i + 1 < chars.length ? chars[i + 1] : null
        if (next && next !== " ") {
            res.push("\\" + next)
            i++
        }
    }
    return res
}

const explodeToCharacters = (s: string) => {
    const factory = new CharacterFactory()
    return explodeWithEscapes(s).map(it => factory.create(it));
}

// TODO: Should also support line breaks and tabs.
const isWord = (s: string) => {
    if (!s) return false
    return explode(s).every(it => it != " ")
}

const isWhitespace = (s: string) => {
    if (!s) return false
    return explode(s).every(it => it == " ")
}

const isDigit = (s: string) => {
    if (s.length > 1) {
        return false
    }
    const zeroPos = "0".charCodeAt(0)
    const sCharCode = s.charCodeAt(0)
    return range(zeroPos, zeroPos + 9).some(it => it === sCharCode)
}

export {
    explode,
    explodeWithEscapes,
    explodeToCharacters,
    isWord,
    isWhitespace,
    isDigit
}
