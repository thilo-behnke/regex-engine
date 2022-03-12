
export type BacktrackIteration = {
    successful: boolean; consumed: number
}

export const successfulBacktrack = () => {
    return {successful: true, consumed: 1}
}

export const backtrackFailed = () => {
    return {successful: false, consumed: 0}
}
