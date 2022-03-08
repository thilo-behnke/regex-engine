
export type MatchIteration = {
    matched: boolean; consumed: number
}

export const matchFailed = (): MatchIteration => {
    return {matched: false, consumed: 0}
}
