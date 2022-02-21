import {Expression} from "../../model/expression";
import Tokenizer from "../tokenizer/tokenizer";
import {TokenType} from "../../model/token";
import {SimpleExpression} from "../../model/simple-expression";
import Character from "../../model/character";
import GreedyExpression from "../../model/greedy-expression";

export default class Parser {
    private _tokenizer: Tokenizer

    constructor(tokenizer: Tokenizer = new Tokenizer()) {
        this._tokenizer = tokenizer;
    }

    parse(s: string): Expression[] {
        const tokenized = this._tokenizer.tokenize(s)
        const expressions = []
        for (let i = 0; i < tokenized.length; i++) {
            const current = tokenized[i]
            if (current.type == TokenType.MODIFIER) {
                continue;
            }
            const baseExpression = new SimpleExpression(...Character.fromTokens(current))
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
