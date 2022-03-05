import DefaultRegexToken, {RegexToken, RegexTokenType} from "./regex-token";

export class IndexedRegexToken implements RegexToken {
    private readonly _token: DefaultRegexToken
    private readonly _idx: number

    constructor(token: DefaultRegexToken, idx: number) {
        this._token = token;
        this._idx = idx;
    }

    get type(): RegexTokenType {
        return this._token.type;
    }

    get value(): string {
        return this._token.value;
    }

    get idx(): number {
        return this._idx
    }
}
