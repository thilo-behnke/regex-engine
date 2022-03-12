
const range = (from: number, to: number) => {
    return [...Array(to - from + 1).keys()].map(it => it + from)
}

const rangeWithValue = <T>(n: number, v: T) => {
    return range(0, n - 1).map(() => v)
}

const last = <T>(arr: T[]): T => {
    return arr[arr.length - 1] ?? null
}

const max = <T>(arr: T[]): T => {
    if (!arr.length) {
        return null
    }
    return arr.reduce((acc, it) => it > acc ? it : acc)
}

const min = <T>(arr: T[]): T => {
    if (!arr.length) {
        return null
    }
    return arr.reduce((acc, it) => it < acc ? it : acc)
}

export {
    range,
    rangeWithValue,
    last,
    max,
    min
}
