import Character from "./character";
import {isWhitespace} from "../utils/string-utils";

export class WhitespaceCharacter implements Character {
    cursorOnly(): boolean {
        return false;
    }

    test(s: string, previous?: string, next?: string, isZeroPosMatch?: boolean): boolean {
        return isWhitespace(s);
    }
}
