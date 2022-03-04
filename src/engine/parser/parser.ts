import {Expression} from "../../model/expression";
import Token, {TokenType} from "../../model/token";
import {SimpleExpression} from "../../model/simple-expression";
import GreedyExpression from "../../model/greedy-expression";
import WildcardCharacter from "../../model/wildcard-character";
import WordBoundaryCharacter from "../../model/word-boundary-character";
import WordWildcardCharacter from "../../model/word-wildcard-character";
import DigitWildcardCharacter from "../../model/digit-wildcard-character";
import AnchorStartCharacter from "../../model/anchor-start-character";
import AnchorEndCharacter from "../../model/anchor-end-character";
import {WhitespaceCharacter} from "../../model/whitespace-character";
import {Lexer} from "../lexer/lexer";
import DefaultCharacter from "../../model/default-character";
import SquareBracketExpression from "../../model/square-bracket-expression";
import {GroupExpression} from "../../model/group-expression";
import {GreedyGroupExpression} from "../../model/greedy-group-expression";
import {getCharRange} from "../../utils/string-utils";
import {LookAheadExpression} from "../../model/look-ahead-expression";

export default class Parser {
    private _lexer: Lexer

    private _expressions: Expression[]
    private _currentToken: Token

    constructor(lexer: Lexer = null) {
        this._lexer = lexer ?? new Lexer()
    }

    parse(s: string): Expression[] {
        this._lexer.load(s)
        this._expressions = []
        this._currentToken = this._lexer.getNextToken()
        while (this._currentToken !== null) {
            const expressions = this.tryParseRegex()
            expressions.forEach(it => this._expressions.push(it))
        }
        return this._expressions
    }

    private tryParseRegex = (): Expression[] => {
        if (this._currentToken.type === TokenType.ANCHOR_START) {
            this.consume(TokenType.ANCHOR_START)
            return [new SimpleExpression(new AnchorStartCharacter())]
        }
        if (this._currentToken.type === TokenType.ANCHOR_END) {
            this.consume(TokenType.ANCHOR_END)
            return [new SimpleExpression(new AnchorEndCharacter())]
        }

        if (this._currentToken.type == TokenType.SQUARE_BRACKET_OPEN) {
            const squareBracketExpression = this.consumeSquareBrackets()
            return [squareBracketExpression]
        }

        if (this._currentToken.type == TokenType.BRACKET_OPEN) {
            const bracketExpression = this.consumeBrackets()
            return [bracketExpression]
        }

        if (this._currentToken.type === TokenType.CHARACTER && this._currentToken.value === '.') {
            this.consume(TokenType.CHARACTER)
            return [new SimpleExpression(new WildcardCharacter())]
        }

        if (this._currentToken.type === TokenType.CHARACTER) {
            const characterExpression = this.consumeCharacter()
            return [characterExpression]
        }

        if (this._currentToken.type == TokenType.ESCAPED) {
            const escapedExpression = this.consumeEscaped()
            return [escapedExpression]
        }

        if (this._currentToken.type == TokenType.MODIFIER) {
            throw new Error(`Found orphaned modifier: ${this._currentToken.value}`)
        }

        if (this._currentToken.type == TokenType.SQUARE_BRACKET_CLOSE) {
            throw new Error(`Found orphaned closing square bracket`)
        }

        if (this._currentToken.type == TokenType.BRACKET_CLOSE) {
            throw new Error(`Found orphaned closing bracket`)
        }

        if (this._currentToken.type == TokenType.EOF) {
            this.consume(TokenType.EOF)
            return []
        }

        throw new Error(`Unexpected token found: ${this._currentToken.value} (${this._currentToken.type})`)
    }

    private tryParseEscaped = () => {
        const next = this._currentToken
        if (!next) {
            throw new Error("Found escape sequence at end of string.")
        }
        if (next.type !== TokenType.CHARACTER) {
            throw new Error(`Tried to escape invalid character: ${next.value} (${next.type})`)
        }
        this.consume(TokenType.CHARACTER)
        if (next.value === "b") {
            return new SimpleExpression(new WordBoundaryCharacter())
        }
        if (next.value === "w") {
            return new SimpleExpression(new WordWildcardCharacter())
        }
        if (next.value === "d") {
            return new SimpleExpression(new DigitWildcardCharacter())
        }
        if (next.value === "s") {
            return new SimpleExpression(new WhitespaceCharacter())
        }
        throw new Error(`Found invalid escape sequence: ${TokenType.ESCAPED}/${next.type}`)
    }

    private consumeSquareBrackets(): Expression {
        this.consume(TokenType.SQUARE_BRACKET_OPEN)
        let negated = this._currentToken.type === TokenType.CHARACTER && this._currentToken.value === "^"
        if (negated) {
            this.consume(TokenType.CHARACTER)
        }
        const expressions = []
        while(this._currentToken.type !== TokenType.SQUARE_BRACKET_CLOSE) {
            const next = this._currentToken
            switch(next.type) {
                case TokenType.ANCHOR_START:
                case TokenType.ANCHOR_END:
                case TokenType.SQUARE_BRACKET_OPEN:
                    throw new Error(`Unexpected token in brackets: ${next.value} (${next.type})`)
                case TokenType.EOF:
                    throw new Error(`Unexpected eof in brackets`)
                case TokenType.CHARACTER:
                    const char = this._currentToken.value
                    this.consume(TokenType.CHARACTER)
                    if (this._currentToken.value !== "-") {
                        const charExpression = new SimpleExpression(new DefaultCharacter(char))
                        expressions.push(charExpression)
                        break
                    }
                    this.consume(TokenType.CHARACTER)
                    if (this._currentToken.type !== TokenType.CHARACTER) {
                        throw new Error(`Invalid range definition in brackets: ${char}-${this._currentToken.value}`)
                    }
                    const charsInRange = getCharRange(char, this._currentToken.value).map(it => new SimpleExpression(new DefaultCharacter(it)))
                    charsInRange.forEach(it => expressions.push(it))
                    this.consume(TokenType.CHARACTER)
                    break
                case TokenType.ESCAPED:
                    this.consume(TokenType.ESCAPED)
                    const escapedExpression = this.tryParseEscaped()
                    expressions.push(escapedExpression)
                    break
                default:
                    throw new Error(`Unknown token in brackets: ${next.value} (${next.type})`)
            }
        }
        this.consume(TokenType.SQUARE_BRACKET_CLOSE)
        const bracketExpression = negated ? SquareBracketExpression.negated(...expressions) : new SquareBracketExpression(...expressions)
        return this.tryWrapInGreedyModifier(bracketExpression)
    }

    private consumeBrackets(): Expression {
        this.consume(TokenType.BRACKET_OPEN)
        let isNonCapturing = false
        let isPositiveLookahead = false
        let isNegativeLookahead = false
        if (this._currentToken.type === TokenType.CHARACTER) {
            if (this._currentToken.value === "?" && this._lexer.lookahead()?.type === TokenType.CHARACTER && this._lexer.lookahead().value === ":") {
                this.consume(TokenType.CHARACTER)
                this.consume(TokenType.CHARACTER)
                isNonCapturing = true
            } else if (this._currentToken.value === "?" && this._lexer.lookahead()?.type === TokenType.CHARACTER && this._lexer.lookahead().value === "=") {
                this.consume(TokenType.CHARACTER)
                this.consume(TokenType.CHARACTER)
                isPositiveLookahead = true
            } else if (this._currentToken.value === "?" && this._lexer.lookahead()?.type === TokenType.CHARACTER && this._lexer.lookahead().value === "!") {
                this.consume(TokenType.CHARACTER)
                this.consume(TokenType.CHARACTER)
                isNegativeLookahead = true
            }
        }
        const expressions: Expression[] = []
        while(this._currentToken !== null && this._currentToken.type !== TokenType.BRACKET_CLOSE) {
            const withinBrackets = this.tryParseRegex()
            withinBrackets.forEach(it => expressions.push(it))
        }
        this.consume(TokenType.BRACKET_CLOSE)
        if (!isPositiveLookahead && !isNegativeLookahead) {
            const bracketExpression = isNonCapturing ? GroupExpression.nonCapturing(...expressions) : new GroupExpression(...expressions)
            return this.tryWrapInGreedyModifier(bracketExpression)
        }
        if (isPositiveLookahead) {
            return LookAheadExpression.positive(...expressions)
        }
        if (isNegativeLookahead) {
            return LookAheadExpression.negative(...expressions)
        }
        throw new Error('Invalid bracket expression, is neither group nor lookahead.')
    }

    private consumeCharacter() {
        const charExpression = new SimpleExpression(new DefaultCharacter(this._currentToken.value))
        this.consume(TokenType.CHARACTER)
        return this.tryWrapInGreedyModifier(charExpression)
    }

    private consumeEscaped() {
        this.consume(TokenType.ESCAPED)
        const escapedExpression = this.tryParseEscaped()
        return this.tryWrapInGreedyModifier(escapedExpression)
    }

    private consume(type: TokenType) {
        if (this._currentToken.type === type) {
            this._currentToken = this._lexer.getNextToken()
            return
        }
        throw new Error(`Unable to consume expected token ${type}, found type: ${this._currentToken.type}`)
    }

    private tryWrapInGreedyModifier = (baseExpression: Expression) => {
        if (!this._currentToken || this._currentToken.type != TokenType.MODIFIER) {
            return baseExpression
        } else if (this._currentToken.type == TokenType.MODIFIER) {
            const expression = baseExpression instanceof GroupExpression ? new GreedyGroupExpression(baseExpression, this._currentToken.value === "*") : new GreedyExpression(baseExpression, this._currentToken.value === "*")
            this.consume(TokenType.MODIFIER)
            return expression
        } else {
            throw new Error('Unknown modifier token encountered: ' + this._currentToken.type + "/" + this._currentToken.value)
        }
    }
}
