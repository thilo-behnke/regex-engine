
const range = (from: number, to: number) => {
    return [...Array(to - from + 1).keys()].map(it => it + from)
}

const rangeWithValue = <T>(n: number, v: T) => {
    return range(0, n - 1).map(() => v)
}

export {
    range,
    rangeWithValue
}
