import Character from "./character";
import {isWhitespace, isWord, isWordBoundary} from "../utils/string-utils";

export default class WordBoundaryCharacter implements Character {
    test(s: string, last: string = null, next: string = null): boolean {
        return isWord(s) && (isWordBoundary(last) || isWordBoundary(next)) || isWordBoundary(s) && (isWord(last) || isWord(next))
    }
    cursorOnly(): boolean {
        return true;
    }
}
