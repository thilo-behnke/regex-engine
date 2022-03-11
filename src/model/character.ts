import {IndexedToken} from "../utils/string-utils";

export default interface Character {
    test(s?: IndexedToken, last?: IndexedToken, next?: IndexedToken): boolean
    cursorOnly(): boolean
}
