import Tokenizer from "../tokenizer/tokenizer";
import Token from "../../model/token";

export class Lexer {
    private _tokenizer: Tokenizer

    private _tokens: Token[]
    private _idx: number = 0

    constructor(tokenizer: Tokenizer = null) {
        this._tokenizer = tokenizer ?? new Tokenizer()
    }

    load(s: string): void {
        this.reset()
        this._tokens = this._tokenizer.tokenize(s)
    }

    reset(): void {
        this._idx = 0
    }

    hasNextToken(): boolean {
        return this._idx < this._tokens.length
    }

    getNextToken(): Token {
        if (!this.hasNextToken()) {
            return null
        }
        const token = this._tokens[this._idx]
        this._idx++
        return token
    }
}
