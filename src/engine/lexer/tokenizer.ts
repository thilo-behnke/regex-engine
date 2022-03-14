import {explode} from "../../utils/string-utils";
import DefaultRegexToken from "../../model/token/regex-token";
import {IndexedRegexToken} from "../../model/token/indexed-regex-token";

export default class Tokenizer {
    private chars: string[]

    private _idx: number = 0;
    private _current: string
    private tokens: IndexedRegexToken[] = []

    tokenize(s: string): IndexedRegexToken[] {
        this.chars = explode(s)

        this._current = this.chars[this._idx]
        while(this._current) {
            if (this._current === '^' && this._idx === 0) {
                this.tokens.push(new IndexedRegexToken(DefaultRegexToken.anchorStart(), this._idx, this._idx))
                this.consume(this._current)
                continue;
            }
            if (this._current === '*' || this._current === '+' || this._current === '?') {
                this.tokens.push(new IndexedRegexToken(DefaultRegexToken.modifier(this._current), this._idx, this._idx))
                this.consume(this._current)
                continue;
            }
            if (this._current === '|') {
                this.tokens.push(new IndexedRegexToken(DefaultRegexToken.alternative(), this._idx, this._idx))
                this.consume(this._current)
                continue;
            }
            if (this._current === '\\') {
                const idxStart = this._idx
                this.consume(this._current)
                this.tokens.push(new IndexedRegexToken(DefaultRegexToken.escaped(this._current), idxStart, this._idx))
                this.consume(this._current)
                continue;
            }
            if (this._current === '(') {
                this.consumeGroup()
                continue;
            }
            if (this._current === ')') {
                this.tokens.push(new IndexedRegexToken(DefaultRegexToken.groupEnd(), this._idx, this._idx))
                this.consume(this._current)
                continue;
            }
            if (this._current === '[') {
                this.consumeCharacterClass()
                continue;
            }
            if (this._current === ']') {
                this.tokens.push(new IndexedRegexToken(DefaultRegexToken.characterClassEnd(), this._idx, this._idx))
                this.consume(this._current)
                continue;
            }
            if (this._current === '$' && this._idx === this.chars.length - 1) {
                this.tokens.push(new IndexedRegexToken(DefaultRegexToken.anchorEnd(), this._idx, this._idx))
                this.consume(this._current)
                continue;
            }

            const startIdx = this._idx
            const fromCharacter = this._current
            this.consume(this._current)
            if (this._current === '-') {
                this.consume(this._current)
                const toCharacter = this._current
                this.tokens.push(new IndexedRegexToken(DefaultRegexToken.characterRange(`${fromCharacter}-${toCharacter}`), startIdx, this._idx))
                this.consume(this._current)
                continue;
            }
            this.tokens.push(new IndexedRegexToken(DefaultRegexToken.character(fromCharacter), startIdx))
        }
        return [
            ...this.tokens,
            new IndexedRegexToken(DefaultRegexToken.eof(), this._idx, this._idx)
        ]
    }

    private consumeGroup() {
        const idxStart = this._idx
        this.consume('(')
        if (this._current !== '?') {
            this.tokens.push(new IndexedRegexToken(DefaultRegexToken.groupStart(), idxStart))
            return
        }
        this.consume('?')
        // @ts-ignore
        if (this._current === ':') {
            this.tokens.push(new IndexedRegexToken(DefaultRegexToken.nonCapturingGroupStart(), idxStart, this._idx))
            this.consume(this._current)
            return
        }
        // @ts-ignore
        if (this._current === '=') {
            this.tokens.push(new IndexedRegexToken(DefaultRegexToken.lookaheadGroupStart(), idxStart, this._idx))
            this.consume(this._current)
            return
        }
        // @ts-ignore
        if (this._current === '!') {
            this.tokens.push(new IndexedRegexToken(DefaultRegexToken.lookaheadGroupStart(true), idxStart, this._idx))
            this.consume(this._current)
            return
        }
        // @ts-ignore
        if (this._current === '<') {
            this.consume(this._current)
            // @ts-ignore
            if (this._current === '=') {
                this.tokens.push(new IndexedRegexToken(DefaultRegexToken.lookbehindGroupStart(), idxStart, this._idx))
                this.consume(this._current)
                return
            }
            // @ts-ignore
            if (this._current === '!') {
                this.tokens.push(new IndexedRegexToken(DefaultRegexToken.lookbehindGroupStart(true), idxStart, this._idx))
                this.consume(this._current)
                return
            }
            throw new Error(`Unknown token sequence found at ${idxStart}-${this._idx}: ?<${this._current}`)
        }
        throw new Error(`Unknown token sequence found at at ${idxStart}-${this._idx}: (${this._current}`)
    }

    private consumeCharacterClass() {
        const idxStart = this._idx
        this.consume('[')
        if (this._current === '^') {
            this.tokens.push(new IndexedRegexToken(DefaultRegexToken.characterClassStart(true), idxStart))
            this.consume(this._current)
            return
        }
        this.tokens.push(new IndexedRegexToken(DefaultRegexToken.characterClassStart(), idxStart))
    }

    private consume(token: string): void {
        if (token !== this._current) {
            throw new Error(`Expected token ${token} but found ${this._current} at index ${this._idx}`)
        }
        this._idx++
        this._current = this.chars[this._idx]
    }
}
