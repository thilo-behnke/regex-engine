import Character from "./character";

export interface Expression {
    hasNotMatched: () => boolean
    hasNext: () => boolean
    matchNext(s: string, last: string, next: string, isZeroPosMatch: boolean): boolean
    lastMatchCharactersConsumed(): number
    canBacktrack(): boolean
    backtrack(): boolean
    isSuccessful: () => boolean
    currentMatch: () => string[]
    tracksMatch: () => boolean
    reset(): void
}
