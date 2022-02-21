
const range = (from: number, to: number) => {
    return [...Array(to - from + 1).keys()].map(it => it + from)
}

export {
    range
}
