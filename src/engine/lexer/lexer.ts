import Tokenizer from "../tokenizer/tokenizer";
import {RegexToken} from "../../model/token/regex-token";
import {IndexedRegexToken} from "../../model/token/indexed-regex-token";

export class Lexer {
    private _tokenizer: Tokenizer

    private _tokens: IndexedRegexToken[]
    private _idx: number = 0

    constructor(tokenizer: Tokenizer = null) {
        this._tokenizer = tokenizer ?? new Tokenizer()
    }

    load(s: string): void {
        this.reset()
        this._tokens = this._tokenizer.tokenize(s).map((it, idx) => new IndexedRegexToken(it, idx))
    }

    reset(): void {
        this._idx = 0
    }

    hasNextToken(): boolean {
        return this._idx < this._tokens.length
    }

    getNextToken(): IndexedRegexToken {
        if (!this.hasNextToken()) {
            return null
        }
        const token = this._tokens[this._idx]
        this._idx++
        return token
    }

    lookahead(i: number = 0): RegexToken {
        return this.hasNextToken() ? this._tokens[this._idx + i] : null
    }
}
