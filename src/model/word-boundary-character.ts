import Character from "./character";
import {isWhitespace, isWord} from "../utils/string-utils";

export default class WordBoundaryCharacter implements Character {
    test(s: string, last: string = null, next: string = null): boolean {
        return isWord(last) && isWhitespace(s) || isWord(next) && isWhitespace(s)
    }
}
