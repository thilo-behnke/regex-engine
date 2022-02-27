
export type RegexEngineOptions = {
    caseInsensitive: boolean
}

const defaultOptions = (): RegexEngineOptions => {
    return {caseInsensitive: false}
}

export default defaultOptions
