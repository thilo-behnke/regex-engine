import Character from "./character";

export default class AnchorEndCharacter implements Character {
    test(s: string, previous: string = null, next: string = null, isZeroPosMatch = false): boolean {
        return next == null
    }

    cursorOnly(): boolean {
        return true;
    }
}
