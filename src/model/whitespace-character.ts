import Character from "./character";
import {IndexedToken, isWhitespace} from "../utils/string-utils";

export class WhitespaceCharacter implements Character {
    cursorOnly(): boolean {
        return false;
    }

    test(s: IndexedToken): boolean {
        return isWhitespace(s.value);
    }
}
