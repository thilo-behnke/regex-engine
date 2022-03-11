import Character from "./character";
import {IndexedToken, isWhitespace, isWord, isWordBoundary} from "../utils/string-utils";

export default class WordBoundaryCharacter implements Character {
    test(s: IndexedToken, last: IndexedToken = null, next: IndexedToken = null): boolean {
        return isWord(s?.value) && (isWordBoundary(last?.value) || isWordBoundary(next?.value)) || isWordBoundary(s?.value) && (isWord(last?.value) || isWord(next?.value))
    }
    cursorOnly(): boolean {
        return true;
    }
}
