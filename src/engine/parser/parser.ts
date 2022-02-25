import {Expression} from "../../model/expression";
import Tokenizer from "../tokenizer/tokenizer";
import Token, {TokenType} from "../../model/token";
import {SimpleExpression} from "../../model/simple-expression";
import GreedyExpression from "../../model/greedy-expression";
import BracketExpression from "../../model/bracket-expression";
import DefaultCharacter from "../../model/default-character";
import WildcardCharacter from "../../model/wildcard-character";
import WordBoundaryCharacter from "../../model/word-boundary-character";
import WordWildcardCharacter from "../../model/word-wildcard-character";
import DigitWildcardCharacter from "../../model/digit-wildcard-character";
import AnchorStartCharacter from "../../model/anchor-start-character";
import AnchorEndCharacter from "../../model/anchor-end-character";
import {WhitespaceCharacter} from "../../model/whitespace-character";

export default class Parser {
    private _tokenizer: Tokenizer

    constructor(tokenizer: Tokenizer = new Tokenizer()) {
        this._tokenizer = tokenizer;
    }

    // TODO: Should detect errors in regex specification
    parse(s: string): Expression[] {
        const tokenized = this._tokenizer.tokenize(s)
        const expressions = []
        for (let i = 0; i < tokenized.length; i++) {
            const current = tokenized[i]

            if (current.type == TokenType.MODIFIER) {
                continue;
            }

            if (current.type == TokenType.BRACKET_CLOSE) {
                continue;
            }

            if (current.type == TokenType.BRACKET_OPEN) {
                const offset = i + 1
                const matchingBracketIdx = tokenized.slice(offset).findIndex(it => it.type == TokenType.BRACKET_CLOSE)
                const betweenBrackets = tokenized.slice(offset, matchingBracketIdx + offset).map(it => new SimpleExpression(new DefaultCharacter(it.value)))
                const bracketExpression = new BracketExpression(...betweenBrackets)
                const next = matchingBracketIdx + offset + 1 < tokenized.length ? tokenized[matchingBracketIdx + offset + 1] : null
                const completeExpression = this.tryWrapInGreedyModifier(next, bracketExpression)
                expressions.push(completeExpression)
                i = matchingBracketIdx + offset
                continue;
            }

            if (current.type === TokenType.ANCHOR_START) {
                expressions.push(new SimpleExpression(new AnchorStartCharacter()))
                continue;
            }
            if (current.type === TokenType.ANCHOR_END) {
                expressions.push(new SimpleExpression(new AnchorEndCharacter()))
                continue;
            }

            if (current.type === TokenType.CHARACTER && current.value === '.') {
                expressions.push(new SimpleExpression(new WildcardCharacter()))
                continue;
            }

            if (current.type == TokenType.ESCAPED) {
                const next = i + 1 < tokenized.length ? tokenized[i + 1] : null
                if (!next || next.value === " ") {
                    continue
                }
                if (next.value === "b") {
                    expressions.push(new SimpleExpression(new WordBoundaryCharacter()))
                    i++
                    continue
                }
                if (next.value === "w") {
                    expressions.push(new SimpleExpression(new WordWildcardCharacter()))
                    i++
                    continue
                }
                if (next.value === "d") {
                    expressions.push(new SimpleExpression(new DigitWildcardCharacter()))
                    i++
                    continue
                }
                if (next.value === "s") {
                    expressions.push(new SimpleExpression(new WhitespaceCharacter()))
                    i++
                    continue
                }
                continue
            }

            const baseExpression = new SimpleExpression(...DefaultCharacter.fromTokens(current))
            const next = i + 1 < tokenized.length ? tokenized[i + 1] : null
            expressions.push(this.tryWrapInGreedyModifier(next, baseExpression))
        }
        return expressions
    }

    private tryWrapInGreedyModifier = (token: Token, baseExpression: Expression) => {
        if (!token || token.type != TokenType.MODIFIER) {
            return baseExpression
        } else if (token.type == TokenType.MODIFIER && token.value == '*') {
            return new GreedyExpression(baseExpression)
        } else if (token.type == TokenType.MODIFIER && token.value == '+') {
            return new GreedyExpression(baseExpression, false)
        } else {
            throw new Error('Unknown modifier token encountered: ' + token.type + "/" + token.value)
        }
    }
}
