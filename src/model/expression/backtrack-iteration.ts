
export type BacktrackIteration = {
    successful: boolean; consumed: number
}

export const successfulBacktrack = (consumed = 1) => {
    return {successful: true, consumed}
}

export const backtrackFailed = () => {
    return {successful: false, consumed: 0}
}
