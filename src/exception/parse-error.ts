import {IndexedRegexToken} from "../model/token/indexed-regex-token";

export class ParseError extends Error {
    constructor(baseMsg: string, token: IndexedRegexToken, ...lastTokens: IndexedRegexToken[]) {
        let error = `[ParseError] ${baseMsg} at ${token.idxFrom}`
        if (lastTokens.length) {
            error += ` --> ${[...lastTokens, token].map(it => it.lexem).join('')} <--`;
        }
        error += `: ${token.lexem} (${token.type})`
        super(error);
    }
}
