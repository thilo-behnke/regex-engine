import {IndexedRegexToken} from "../model/token/indexed-regex-token";

export class ParseError extends Error {
    constructor(baseMsg: string, token: IndexedRegexToken, ...lastTokens: IndexedRegexToken[]) {
        let error = `[ParseError] ${baseMsg} at ${token.idx}`
        if (lastTokens.length) {
            error += ` --> ${[...lastTokens, token].map(it => it.value).join('')} <--`;
        }
        error += `: ${token.value} (${token.type})`
        super(error);
    }
}
