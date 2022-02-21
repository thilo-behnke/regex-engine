import Character from "./character";

export interface Expression {
    hasNext: () => boolean
    matchNext(s: string, last: string = null, next: string = null, isZeroPosMatch = false): boolean
    lastMatchCharactersConsumed(): number
    canBacktrack(): boolean
    backtrack(): boolean
    isSuccessful: () => boolean
    reset(): void
}
