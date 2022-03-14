import DefaultRegexToken, {RegexToken, RegexTokenType} from "./regex-token";

export class IndexedRegexToken implements RegexToken {
    private readonly _token: DefaultRegexToken
    private readonly _idxFrom: number
    private readonly _idxTo: number

    constructor(token: DefaultRegexToken, idxFrom: number, idxTo: number = null) {
        this._token = token;
        this._idxFrom = idxFrom;
        this._idxTo = idxTo ?? idxFrom;
    }

    get type(): RegexTokenType {
        return this._token.type;
    }

    get lexem(): string {
        return this._token.lexem;
    }

    get idxFrom(): number {
        return this._idxFrom
    }

    get idxTo(): number {
        return this._idxTo
    }
}
