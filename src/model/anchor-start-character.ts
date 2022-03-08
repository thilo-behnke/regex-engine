import Character from "./character";
import {IndexedToken} from "../utils/string-utils";

export default class AnchorStartCharacter implements Character {
    test(s: IndexedToken, last?: IndexedToken, next?: IndexedToken): boolean {
        return s.first;
    }
    cursorOnly(): boolean {
        return true;
    }
}
