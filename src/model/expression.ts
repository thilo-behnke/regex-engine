import Character from "./character";
import {IndexedToken} from "../utils/string-utils";

export interface Expression {
    hasNotMatched: () => boolean
    hasNext: () => boolean
    matchNext(s: IndexedToken, last: IndexedToken, next: IndexedToken): boolean
    lastMatchCharactersConsumed(): number
    canBacktrack(): boolean
    backtrack(): boolean
    get minimumLength(): number
    isSuccessful: () => boolean
    currentMatch: () => IndexedToken[]
    tracksMatch: () => boolean
    reset(): void
}
