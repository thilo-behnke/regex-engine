import {Expression} from "../../model/expression";
import Tokenizer from "../tokenizer/tokenizer";
import Token, {TokenType} from "../../model/token";
import {SimpleExpression} from "../../model/simple-expression";
import GreedyExpression from "../../model/greedy-expression";
import DefaultCharacter from "../../model/default-character";
import WordBoundaryCharacter from "../../model/word-boundary-character";
import WordWildcardCharacter from "../../model/word-wildcard-character";
import DigitWildcardCharacter from "../../model/digit-wildcard-character";
import AnchorStartCharacter from "../../model/anchor-start-character";
import AnchorEndCharacter from "../../model/anchor-end-character";
import {WhitespaceCharacter} from "../../model/whitespace-character";
import {ExpressionDescriptor, ExpressionType} from "./expression/expression-type";
import BracketExpression from "../../model/bracket-expression";

export default class Parser {
    private _tokenizer: Tokenizer

    constructor(tokenizer: Tokenizer = new Tokenizer()) {
        this._tokenizer = tokenizer;
    }

    // TODO: Should detect errors in regex specification
    parse(s: string): Expression[] {
        const tokenized = this._tokenizer.tokenize(s)
        const preprocessedExpressions = this.preprocessTokens(tokenized)

        const expressions = []
        for (let i = 0; i < preprocessedExpressions.length; i++) {
            const current = preprocessedExpressions[i]
            const next = i + 1 < preprocessedExpressions.length ? preprocessedExpressions[i + 1] : null

            if (current.type === ExpressionType.CHARACTER) {
                const expression = new SimpleExpression(new DefaultCharacter(current.value))
                const wrapped = this.tryWrapInGreedyModifier(next, expression)
                expressions.push(wrapped)
                continue
            }

            // TODO: This means illegal modifiers are just skipped atm.
            if (current.type === ExpressionType.MODIFIER) {
                continue
            }

            if (current.type === ExpressionType.ANCHOR_START) {
                expressions.push(new SimpleExpression(new AnchorStartCharacter()))
                continue;
            }

            if (current.type === ExpressionType.ANCHOR_END) {
                expressions.push(new SimpleExpression(new AnchorEndCharacter()))
                continue;
            }

            if (current.type === ExpressionType.SPECIAL_CHARACTER) {
                const expression = this.tryParseSpecialCharacter(current as {type: ExpressionType.SPECIAL_CHARACTER, value: string})
                const next = i + 1 < preprocessedExpressions.length ? preprocessedExpressions[i + 1] : null
                const wrapped = this.tryWrapInGreedyModifier(next, expression)
                expressions.push(wrapped)
                continue;
            }

            if (current.type === ExpressionType.BRACKETS) {

            }
        }
        return expressions
    }

    private preprocessTokens = (tokenized: Token[]): ExpressionDescriptor[] => {
        const expressionStack: ExpressionDescriptor[] = []
        for (let i = 0; i < tokenized.length; i++) {
            const current = tokenized[i]

            switch (current.type) {
                case TokenType.CHARACTER:
                    expressionStack.unshift({type: ExpressionType.CHARACTER, value: current.value})
                    break
                case TokenType.ANCHOR_START:
                    expressionStack.unshift({type: ExpressionType.ANCHOR_START})
                    break
                case TokenType.ANCHOR_END:
                    expressionStack.unshift({type: ExpressionType.ANCHOR_END})
                    break
                case TokenType.ESCAPED:
                    const nextToken = i + 1 < tokenized.length ? tokenized[i + 1] : null
                    if (!nextToken) {
                        throw new Error("Found escape sequence at last index of string.")
                    }
                    const parsedToken = this.tryParseEscapedCharacter(nextToken)
                    if (parsedToken === null) {
                        throw new Error("Tried to escape illegal token: " + nextToken.value)
                    }
                    expressionStack.unshift()
                    break
                case TokenType.MODIFIER:
                    expressionStack.unshift({type: ExpressionType.MODIFIER, value: current.value})
                    break
                case TokenType.BRACKET_OPEN:
                    const matchingBrackets = tokenized.findIndex(it => it.type === TokenType.BRACKET_CLOSE)
                    if (matchingBrackets === -1) {
                        throw new Error("Failed to parse expression: expected to find opening brackets")
                    }
                    const offset = i + 1
                    const matchingBracketIdx = tokenized.slice(offset).findIndex(it => it.type == TokenType.BRACKET_CLOSE)
                    const betweenBrackets = tokenized.slice(offset, matchingBracketIdx + offset)
                    const preprocessed = this.preprocessTokens(betweenBrackets)
                    if (preprocessed.some(it => it.type !== ExpressionType.CHARACTER && it.type !== ExpressionType.SPECIAL_CHARACTER)) {
                        throw new Error("Unable to parse bracket contents, found forbidden characters")
                    }
                    const bracketExpression = {type: ExpressionType.BRACKETS, value: preprocessed} as {type: ExpressionType.BRACKETS, value: ExpressionDescriptor[]}
                    expressionStack.push(bracketExpression)
                    i = matchingBracketIdx + offset
                    break
                case TokenType.BRACKET_CLOSE:
                    throw new Error("Found unmatched closing bracket.")
            }
        }

        return [...expressionStack].reverse()
    }

    private parseExpression = (expression: ExpressionDescriptor, next: ExpressionDescriptor) => {
        if (expression.type === ExpressionType.CHARACTER) {
            const charExpression = new SimpleExpression(new DefaultCharacter((expression as {type: ExpressionType.CHARACTER, value: string}).value))
            const wrapped = this.tryWrapInGreedyModifier(next, charExpression)
            return wrapped
        }

        if (expression.type === ExpressionType.MODIFIER) {
            throw new Error("Found orphaned modifier: " + expression.value)
        }

        if (expression.type === ExpressionType.ANCHOR_START) {
            return new SimpleExpression(new AnchorStartCharacter())
        }
        if (expression.type === ExpressionType.ANCHOR_END) {
            return new SimpleExpression(new AnchorEndCharacter())
        }

        if (expression.type === ExpressionType.SPECIAL_CHARACTER) {
            const specialCharExpression = this.tryParseSpecialCharacter(expression as {type: ExpressionType.SPECIAL_CHARACTER, value: string})
            const wrapped = this.tryWrapInGreedyModifier(next, specialCharExpression)
            return wrapped
        }

        if (expression.type === ExpressionType.BRACKETS) {
            const parsed = []
            for (let i = 0; i < expression.value.length; i++) {
                const next = i + 1 < expression.value.length ? expression.value[i + 1] : null
                parsed.push(this.parseExpression(expression.value[i], next))
            }
            const bracketExpression = new BracketExpression(...parsed)
            const wrapped = this.tryWrapInGreedyModifier(next, bracketExpression)
            return wrapped
        }
    }

    private tryWrapInGreedyModifier = (expressionDescriptor: ExpressionDescriptor, baseExpression: Expression) => {
        if (!expressionDescriptor || expressionDescriptor.type != ExpressionType.MODIFIER) {
            return baseExpression
        } else if (expressionDescriptor.type === ExpressionType.MODIFIER && expressionDescriptor.value === '*') {
            return new GreedyExpression(baseExpression)
        } else if (expressionDescriptor.type === ExpressionType.MODIFIER && expressionDescriptor.value === '+') {
            return new GreedyExpression(baseExpression, false)
        } else {
            throw new Error('Unknown modifier expression encountered: ' + expressionDescriptor.type + "/" + expressionDescriptor.value)
        }
    }

    private tryParseEscapedCharacter = (token: Token): ExpressionDescriptor => {
        if (!token) {
            return null
        }
        if (["b", "w", "d", "s"].includes(token.value)) {
            return {type: ExpressionType.SPECIAL_CHARACTER, value: token.value}
        }
        if (["."].includes(token.value)) {
            return {type: ExpressionType.CHARACTER, value: token.value}
        }
        return null
    }

    private tryParseSpecialCharacter(descriptor: {type: ExpressionType.SPECIAL_CHARACTER, value: string}) {
        if (descriptor.value === "b") {
            return new SimpleExpression(new WordBoundaryCharacter())
        }
        if (descriptor.value === "w") {
            return new SimpleExpression(new WordWildcardCharacter())
        }
        if (descriptor.value === "d") {
            return new SimpleExpression(new DigitWildcardCharacter())
        }
        if (descriptor.value === "s") {
            return new SimpleExpression(new WhitespaceCharacter())
        }
        return null
    }
}
