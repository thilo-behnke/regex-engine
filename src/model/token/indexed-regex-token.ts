import DefaultRegexToken, {RegexToken, RegexTokenType} from "./regex-token";

export class IndexedRegexToken implements RegexToken {
    private _token: DefaultRegexToken
    private _idx: number

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
