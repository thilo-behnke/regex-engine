import {range} from "./array-utils";
import Character from "../model/character";
import WildcardCharacter from "../model/wildcard-character";
import WordBoundaryCharacter from "../model/word-boundary-character";
import DefaultCharacter from "../model/default-character";

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

// TODO: Only used by tests, move to test utils
const explodeToCharacters = (s: string) => {
    const factory = new CharacterFactory()
    return explodeWithEscapes(s).map(it => factory.create(it));
}

class CharacterFactory {
    create = (s: string): Character => {
        switch (s) {
            case '.':
                return new WildcardCharacter()
            case '\\b':
                return new WordBoundaryCharacter()
            default:
                return new DefaultCharacter(s)
        }
    }
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
    if (s === null || s.length > 1) {
        return false
    }
    const zeroPos = "0".charCodeAt(0)
    const sCharCode = s.charCodeAt(0)
    return range(zeroPos, zeroPos + 9).some(it => it === sCharCode)
}

const getCharRange = (a: string, b: string): string[] => {
    if (a === null || a.length > 1 || b === null || b.length > 1) {
        return []
    }
    const posStart = a.charCodeAt(0)
    const posEnd = b.charCodeAt(0)
    if (posStart > posEnd) {
        throw new Error(`Invalid char range, a should be higher than b: a=${a}, b=${b}`)
    }

    return explode(String.fromCharCode(...range(posStart, posEnd)))
}

export {
    explode,
    explodeWithEscapes,
    explodeToCharacters,
    isWord,
    isWhitespace,
    isDigit,
    getCharRange
}
