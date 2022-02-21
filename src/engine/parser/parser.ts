import {Expression} from "../../model/expression";
import Tokenizer from "../tokenizer/tokenizer";
import {TokenType} from "../../model/token";
import {SimpleExpression} from "../../model/simple-expression";
import GreedyExpression from "../../model/greedy-expression";
import BracketExpression from "../../model/bracket-expression";
import DefaultCharacter from "../../model/default-character";
import WildcardCharacter from "../../model/wildcard-character";
import WordBoundaryCharacter from "../../model/word-boundary-character";

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
                expressions.push(bracketExpression)
                i = matchingBracketIdx + offset
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
                continue
            }

            const baseExpression = new SimpleExpression(...DefaultCharacter.fromTokens(current))
            const next = i + 1 < tokenized.length ? tokenized[i + 1] : null
            if (!next || next.type != TokenType.MODIFIER) {
                expressions.push(baseExpression)
            } else if (next.type == TokenType.MODIFIER && next.value == '*') {
                expressions.push(new GreedyExpression(baseExpression))
            } else if (next.type == TokenType.MODIFIER && next.value == '+') {
                expressions.push(new GreedyExpression(baseExpression, false))
            } else {
                throw new Error('Unknown modifier token encountered: ' + next.type + "/" + next.value)
            }
        }
        return expressions
    }
}
