import Character from "./character";
import {IndexedToken} from "@utils/string-utils";

export default class WildcardCharacter implements Character {
    test(s: IndexedToken): boolean {
        return s !== null && s !== undefined
    }

    cursorOnly(): boolean {
        return false;
    }
}
