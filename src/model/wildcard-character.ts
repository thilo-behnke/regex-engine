import Character from "./character";

export default class WildcardCharacter implements Character {
    test(s: string): boolean {
        return s !== null && s !== undefined
    }
    cursorOnly(): boolean {
        return false;
    }
}
