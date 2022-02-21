export interface Expression {
    hasNext: () => boolean
    matchNext(s: string): boolean
    isSuccessful: () => boolean
    reset(): void
}
