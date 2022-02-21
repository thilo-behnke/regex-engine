import CharacterFactory from "../model/factory/character-factory";

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

export {
    explode,
    explodeWithEscapes,
    explodeToCharacters,
    isWord,
    isWhitespace
}
