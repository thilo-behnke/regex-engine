import Character from "./character";

export default class AnchorStartCharacter implements Character {
    test(s: string, previous?: string, next?: string, isZeroPosMatch = false): boolean {
        return previous == null && isZeroPosMatch
    }
    cursorOnly(): boolean {
        return true;
    }
}
