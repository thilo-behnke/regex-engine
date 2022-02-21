export interface Expression {
    hasNext: () => boolean
    matchNext(s: string, next: string = null): boolean
    canBacktrack(): boolean
    backtrack(): boolean
    isSuccessful: () => boolean
    reset(): void
}
