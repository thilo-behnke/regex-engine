export interface Expression {
    hasNext: () => boolean
    matchNext(s: string, next: string = null): boolean
    isSuccessful: () => boolean
    reset(): void
}
