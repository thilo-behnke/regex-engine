import Character from "./character";
import {IndexedToken, isWord} from "@utils/string-utils";

export default class WordWildcardCharacter implements Character {
    test(s: IndexedToken): boolean {
        return isWord(s?.value)
    }

    cursorOnly(): boolean {
        return false;
    }
}
