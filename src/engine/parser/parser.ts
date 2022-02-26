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
import BracketExpression from "../../model/bracket-expression";

export default class Parser {
    private _lexer: Lexer

    private _expressions: Expression[]
    private _currentToken: Token

    constructor(lexer: Lexer = null) {
        this._lexer = lexer ?? new Lexer();
    }

    // TODO: Should detect errors in regex specification
    parse(s: string): Expression[] {
        this._lexer.load(s)
        this._expressions = []
        this._currentToken = this._lexer.getNextToken()
        while (this._currentToken !== null) {
            if (this._currentToken.type == TokenType.SQUARE_BRACKET_OPEN) {
                this.consumeBrackets()
                continue;
            }

            if (this._currentToken.type === TokenType.ANCHOR_START) {
                this.consume(TokenType.ANCHOR_START)
                this._expressions.push(new SimpleExpression(new AnchorStartCharacter()))
                continue;
            }
            if (this._currentToken.type === TokenType.ANCHOR_END) {
                this.consume(TokenType.ANCHOR_END)
                this._expressions.push(new SimpleExpression(new AnchorEndCharacter()))
                continue;
            }

            if (this._currentToken.type === TokenType.CHARACTER && this._currentToken.value === '.') {
                this.consume(TokenType.CHARACTER)
                this._expressions.push(new SimpleExpression(new WildcardCharacter()))
                continue
            }

            if (this._currentToken.type === TokenType.CHARACTER) {
                this.consumeCharacter()
                continue
            }

            if (this._currentToken.type == TokenType.ESCAPED) {
                this.consumeEscaped()
                continue
            }

            if (this._currentToken.type == TokenType.MODIFIER) {
                throw new Error(`Found orphaned modifier: ${this._currentToken.value}`)
            }

            if (this._currentToken.type == TokenType.SQUARE_BRACKET_CLOSE) {
                throw new Error(`Found orphaned closing bracket`)
            }

            if (this._currentToken.type == TokenType.EOF) {
                return this._expressions
            }

            throw new Error(`Unknown token found: ${this._currentToken.value} (${this._currentToken.type})`)
        }

        throw new Error('Missing EOF token.')
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

    private consumeBrackets() {
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
                    const charExpression = new SimpleExpression(new DefaultCharacter(this._currentToken.value))
                    this.consume(TokenType.CHARACTER)
                    expressions.push(charExpression)
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
        const bracketExpression = negated ? BracketExpression.negated(...expressions) : new BracketExpression(...expressions)
        const expression = this.tryWrapInGreedyModifier(bracketExpression)
        this._expressions.push(expression)
    }

    private consumeCharacter() {
        const charExpression = new SimpleExpression(new DefaultCharacter(this._currentToken.value))
        this.consume(TokenType.CHARACTER)
        const expression = this.tryWrapInGreedyModifier(charExpression)
        this._expressions.push(expression)
    }

    private consumeEscaped() {
        this.consume(TokenType.ESCAPED)
        const escapedExpression = this.tryParseEscaped()
        const expression = this.tryWrapInGreedyModifier(escapedExpression)
        this._expressions.push(expression)
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
            const expression = new GreedyExpression(baseExpression, this._currentToken.value === "*")
            this.consume(TokenType.MODIFIER)
            return expression
        } else {
            throw new Error('Unknown modifier token encountered: ' + this._currentToken.type + "/" + this._currentToken.value)
        }
    }
}
