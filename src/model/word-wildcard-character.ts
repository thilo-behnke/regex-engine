import Character from "./character";
import {isWord} from "../utils/string-utils";

export default class WordWildcardCharacter implements Character {
    test(s: string): boolean {
        return isWord(s)
    }

    cursorOnly(): boolean {
        return false;
    }
}
