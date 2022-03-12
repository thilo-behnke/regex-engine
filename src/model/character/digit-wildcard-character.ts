import Character from "./character";
import {IndexedToken, isDigit} from "@utils/string-utils";

export default class DigitWildcardCharacter implements Character {
    test(s: IndexedToken): boolean {
        return isDigit(s?.value);
    }
    cursorOnly(): boolean {
        return false;
    }
}
