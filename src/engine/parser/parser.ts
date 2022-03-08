import {Expression} from "../../model/expression";
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
import {GreedyGroupExpression} from "../../model/greedy-group-expression";
import {getCharRange} from "../../utils/string-utils";
import {rangeWithValue} from "../../utils/array-utils";
import {
    createGroupExpression,
    GroupExpressionType,
    isLookbehind,
    isMatchGroup
} from "../../model/parser/group-expression-type";
import {RegexTokenType} from "../../model/token/regex-token";
import {IndexedRegexToken} from "../../model/token/indexed-regex-token";
import {ParseError} from "../../exception/parse-error";
import {OptionalExpression} from "../../model/optional-expression";
import {isGroupExpression} from "../../model/group-expression";
import {OptionalGroupExpression} from "../../model/optional-group-expression";
import {DefaultGroupExpression} from "../../model/default-group-expression";

export default class Parser {
    private _lexer: Lexer

    private _expressions: Expression[]
    private _currentToken: IndexedRegexToken
    private _tokenHistory: IndexedRegexToken[] = []

    private _allowModifiers = true

    constructor(lexer: Lexer = null) {
        this._lexer = lexer ?? new Lexer();
    }

    parse(s: string): Expression {
        this._lexer.load(s)
        this._expressions = []
        this._currentToken = this._lexer.getNextToken()
        while (this._currentToken !== null) {
            const expressions = this.tryParseRegex()
            expressions.forEach(it => this._expressions.push(it))
        }
        return DefaultGroupExpression.nonCapturing(...this._expressions)
    }

    private tryParseRegex = (): Expression[] => {
        if (this._currentToken.type === RegexTokenType.ANCHOR_START) {
            this.consume(RegexTokenType.ANCHOR_START)
            return [new SimpleExpression(new AnchorStartCharacter())]
        }
        if (this._currentToken.type === RegexTokenType.ANCHOR_END) {
            this.consume(RegexTokenType.ANCHOR_END)
            return [new SimpleExpression(new AnchorEndCharacter())]
        }

        if (this._currentToken.type == RegexTokenType.SQUARE_BRACKET_OPEN) {
            const squareBracketExpression = this.consumeSquareBrackets()
            return [squareBracketExpression]
        }

        if (this._currentToken.type == RegexTokenType.BRACKET_OPEN) {
            const bracketExpression = this.consumeBrackets()
            return [bracketExpression]
        }

        if (this._currentToken.type === RegexTokenType.CHARACTER && this._currentToken.value === '.') {
            this.consume(RegexTokenType.CHARACTER)
            const expression = this.tryWrapInModifier(new SimpleExpression(new WildcardCharacter()))
            return [expression]
        }

        if (this._currentToken.type === RegexTokenType.CHARACTER) {
            const characterExpression = this.consumeCharacter()
            return [characterExpression]
        }

        if (this._currentToken.type == RegexTokenType.ESCAPED) {
            const escapedExpression = this.consumeEscaped()
            return [escapedExpression]
        }

        if (this._currentToken.type == RegexTokenType.MODIFIER) {
            this.throwParseError('Found orphaned modifier')
        }

        if (this._currentToken.type == RegexTokenType.SQUARE_BRACKET_CLOSE) {
            this.throwParseError('Found orphaned closing square bracket')
        }

        if (this._currentToken.type == RegexTokenType.BRACKET_CLOSE) {
            this.throwParseError('Found orphaned closing bracket')
        }

        if (this._currentToken.type == RegexTokenType.EOF) {
            this.consume(RegexTokenType.EOF)
            return []
        }

        this.throwParseError('Unexpected token')
    }

    private tryParseEscaped = () => {
        const next = this._currentToken
        if (!next) {
            this.throwParseError('Found escape sequence at end of string')
        }
        if (next.type !== RegexTokenType.CHARACTER) {
            this.throwParseError('Tried to escape invalid character')
        }
        this.consume(RegexTokenType.CHARACTER)
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
        if (next.value === "/") {
            return new SimpleExpression(new DefaultCharacter("/"))
        }
        // TODO: Only allowed in bracket expression
        if (next.value === "-") {
            return new SimpleExpression(new DefaultCharacter("-"))
        }
        // TODO: Only allowed in bracket expression
        if (next.value === ".") {
            return new SimpleExpression(new DefaultCharacter("."))
        }
        this.throwParseError('Found invalid escape sequence')
    }

    private consumeSquareBrackets(): Expression {
        this.consume(RegexTokenType.SQUARE_BRACKET_OPEN)
        let negated = this._currentToken.type === RegexTokenType.CHARACTER && this._currentToken.value === "^"
        if (negated) {
            this.consume(RegexTokenType.CHARACTER)
        }
        const expressions = []
        while(this._currentToken.type !== RegexTokenType.SQUARE_BRACKET_CLOSE) {
            const next = this._currentToken
            switch(next.type) {
                case RegexTokenType.ANCHOR_START:
                case RegexTokenType.ANCHOR_END:
                case RegexTokenType.SQUARE_BRACKET_OPEN:
                    this.throwParseError('Unexpected token in brackets')
                    return
                case RegexTokenType.EOF:
                    this.throwParseError(`Unexpected eof in brackets`)
                    return
                case RegexTokenType.CHARACTER:
                    const char = this._currentToken.value
                    this.consume(RegexTokenType.CHARACTER)
                    if (this._currentToken.value !== "-") {
                        const charExpression = new SimpleExpression(new DefaultCharacter(char))
                        expressions.push(charExpression)
                        break
                    }
                    this.consume(RegexTokenType.CHARACTER)
                    if (this._currentToken.type !== RegexTokenType.CHARACTER) {
                        this.throwParseError('Invalid range definition in brackets')
                    }
                    const charsInRange = getCharRange(char, this._currentToken.value).map(it => new SimpleExpression(new DefaultCharacter(it)))
                    charsInRange.forEach(it => expressions.push(it))
                    this.consume(RegexTokenType.CHARACTER)
                    break
                case RegexTokenType.ESCAPED:
                    this.consume(RegexTokenType.ESCAPED)
                    const escapedExpression = this.tryParseEscaped()
                    expressions.push(escapedExpression)
                    break
                case RegexTokenType.MODIFIER:
                    const token = this._currentToken
                    if (token.value === "?") {
                        this.consume(RegexTokenType.MODIFIER)
                        expressions.push(new SimpleExpression(new DefaultCharacter(token.value)))
                        break
                    }
                default:
                    this.throwParseError('Unknown token in brackets')
            }
        }
        this.consume(RegexTokenType.SQUARE_BRACKET_CLOSE)
        const bracketExpression = negated ? SquareBracketExpression.negated(...expressions) : new SquareBracketExpression(...expressions)
        return this.tryWrapInModifier(bracketExpression)
    }

    private consumeBrackets(): Expression {
        this.consume(RegexTokenType.BRACKET_OPEN)
        const groupType = this.tryConsumeBracketModifier()

        const expressions: Expression[] = []
        // Modifiers are not allowed within brackets.
        if (isLookbehind(groupType)) {
            this._allowModifiers = false
        }
        while(this._currentToken !== null && this._currentToken.type !== RegexTokenType.BRACKET_CLOSE) {
            const withinBrackets = this.tryParseRegex()
            withinBrackets.forEach(it => expressions.push(it))
        }
        if (isLookbehind(groupType)) {
            this._allowModifiers = true
        }

        this.consume(RegexTokenType.BRACKET_CLOSE)
        const groupExpression = createGroupExpression(groupType, ...expressions)
        if (!isMatchGroup(groupType)) {
            return groupExpression
        }
        return this.tryWrapInModifier(groupExpression)
    }

    private tryConsumeBracketModifier() {
        if (this.peekNonMatchingGroup()) {
            return GroupExpressionType.NON_CAPTURING
        } else if (this.peekPositiveLookahead()) {
            return GroupExpressionType.POSITIVE_LOOKAHEAD
        } else if (this.peekNegativeLookahead()) {
            return GroupExpressionType.NEGATIVE_LOOKAHEAD
        } else if (this.peekPositiveLookbehind()) {
            return GroupExpressionType.POSITIVE_LOOKBEHIND
        } else if (this.peekNegativeLookbehind()) {
            return GroupExpressionType.NEGATIVE_LOOKBEHIND
        }
        return GroupExpressionType.CAPTURING
    }

    private peekNonMatchingGroup() {
        if (this._currentToken.type === RegexTokenType.MODIFIER && this._currentToken.value === "?" && this._lexer.lookahead()?.type === RegexTokenType.CHARACTER && this._lexer.lookahead().value === ":") {
            this.consume(RegexTokenType.MODIFIER, RegexTokenType.CHARACTER)
            return true
        }
        return false
    }

    private peekPositiveLookahead() {
        if (this._currentToken.type === RegexTokenType.MODIFIER && this._currentToken.value === "?" && this._lexer.lookahead()?.type === RegexTokenType.CHARACTER && this._lexer.lookahead().value === "=") {
            this.consume(RegexTokenType.MODIFIER, RegexTokenType.CHARACTER)
            return true
        }
        return false
    }

    private peekNegativeLookahead() {
        if (this._currentToken.type === RegexTokenType.MODIFIER && this._currentToken.value === "?" && this._lexer.lookahead()?.type === RegexTokenType.CHARACTER && this._lexer.lookahead().value === "!") {
            this.consume(RegexTokenType.MODIFIER, RegexTokenType.CHARACTER)
            return true
        }
        return false
    }

    private peekPositiveLookbehind() {
        if (this._currentToken.type === RegexTokenType.MODIFIER && this._currentToken.value === "?" && this._lexer.lookahead()?.type === RegexTokenType.CHARACTER && this._lexer.lookahead().value === "<" && this._lexer.lookahead()?.type === RegexTokenType.CHARACTER && this._lexer.lookahead(1).value === "=") {
            this.consume(RegexTokenType.MODIFIER, RegexTokenType.CHARACTER, RegexTokenType.CHARACTER)
            return true
        }
        return false
    }

    private peekNegativeLookbehind() {
        if (this._currentToken.type === RegexTokenType.MODIFIER && this._currentToken.value === "?" && this._lexer.lookahead()?.type === RegexTokenType.CHARACTER && this._lexer.lookahead().value === "<" && this._lexer.lookahead()?.type === RegexTokenType.CHARACTER && this._lexer.lookahead(1).value === "!") {
            this.consume(RegexTokenType.MODIFIER, RegexTokenType.CHARACTER, RegexTokenType.CHARACTER)
            return true
        }
        return false
    }

    private consumeCharacter() {
        const charExpression = new SimpleExpression(new DefaultCharacter(this._currentToken.value))
        this.consume(RegexTokenType.CHARACTER)
        return this.tryWrapInModifier(charExpression)
    }

    private consumeEscaped() {
        this.consume(RegexTokenType.ESCAPED)
        const escapedExpression = this.tryParseEscaped()
        return this.tryWrapInModifier(escapedExpression)
    }

    private consumeMultiple(type: RegexTokenType, n: number) {
        this.consume(...rangeWithValue(n, type))
    }

    private consume(...types: RegexTokenType[]) {
        types.forEach(it => {
            if (it !== this._currentToken.type) {
                this.throwParseError('Unable to consume expected token')
            }
            this._tokenHistory.push(this._currentToken)
            this._currentToken = this._lexer.getNextToken()
        })
    }

    private tryWrapInModifier = (baseExpression: Expression) => {
        if (!this._currentToken || this._currentToken.type != RegexTokenType.MODIFIER) {
            return baseExpression
        } else if (this._currentToken.type == RegexTokenType.MODIFIER) {
            if (!this._allowModifiers) {
                this.throwParseError('Modifiers not allowed at current position')
            }
            if (this._currentToken.value === "*" || this._currentToken.value === "+") {
                const expression = isGroupExpression(baseExpression) ? new GreedyGroupExpression(baseExpression, this._currentToken.value === "*") : new GreedyExpression(baseExpression, this._currentToken.value === "*")
                this.consume(RegexTokenType.MODIFIER)
                return expression
            } else if (this._currentToken.value === "?") {
                const expression = isGroupExpression(baseExpression) ? new OptionalGroupExpression(baseExpression) : new OptionalExpression(baseExpression)
                this.consume(RegexTokenType.MODIFIER)
                return expression
            }
            this.throwParseError('Unknown modifier')
        } else {
            this.throwParseError('Expected modifier but received different token')
        }
    }

    /**
     * @throws {ParseError}
     * @param msg
     */
    private throwParseError = (msg: string): never => {
        throw new ParseError(msg, this._currentToken, ...this._tokenHistory.slice(-5))
    }
}
