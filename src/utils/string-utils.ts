import CharacterFactory from "../model/factory/character-factory";
import {range} from "./array-utils";

const explode = (s: string) => {
    return s.split('').map(it => it === "" ? " " : it);
}

const explodeIndexed = (s: string): IndexedToken[] => {
    return explode(s).map((value, idx, arr) => ({value, idx, first: idx === 0, last: idx === arr.length - 1}))
}

export type IndexedToken = {
    idx: number, value: string, first: boolean, last: boolean
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
    return explode(s).every(it => !isWordBoundary(s))
}

const isWhitespace = (s: string) => {
    if (!s) return false
    return explode(s).every(it => [' ', '\\t'].includes(it))
}

const isWordBoundary = (s: string) => {
    return !s || ['-', '/', '\\'].includes(s) || isWhitespace(s)
}

const isDigit = (s: string) => {
    if (!s || s.length > 1) {
        return false
    }
    const zeroPos = "0".charCodeAt(0)
    const sCharCode = s.charCodeAt(0)
    return range(zeroPos, zeroPos + 9).some(it => it === sCharCode)
}

const getCharRange = (a: string, b: string): string[] => {
    if (!a || a.length > 1 || !b || b.length > 1) {
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
    explodeIndexed,
    explodeWithEscapes,
    explodeToCharacters,
    isWord,
    isWhitespace,
    isDigit,
    getCharRange,
    isWordBoundary
}
