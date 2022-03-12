import Character from "./character";
import {IndexedToken} from "@utils/string-utils";

export default class AnchorEndCharacter implements Character {
    test(s: IndexedToken, last: IndexedToken, next: IndexedToken): boolean {
        return last?.last
    }

    cursorOnly(): boolean {
        return true;
    }
}
