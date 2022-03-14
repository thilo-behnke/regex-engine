import {Expression} from "@model/expression/expression";
import {SimpleExpression} from "@model/expression/simple-expression";
import GreedyExpression from "@model/expression/greedy-expression";
import WildcardCharacter from "@model/character/wildcard-character";
import WordBoundaryCharacter from "@model/character/word-boundary-character";
import WordWildcardCharacter from "@model/character/word-wildcard-character";
import DigitWildcardCharacter from "@model/character/digit-wildcard-character";
import AnchorStartCharacter from "@model/character/anchor-start-character";
import AnchorEndCharacter from "@model/character/anchor-end-character";
import {WhitespaceCharacter} from "@model/character/whitespace-character";
import {Lexer} from "../lexer/lexer";
import DefaultCharacter from "@model/character/default-character";
import SquareBracketExpression from "@model/expression/square-bracket-expression";
import {GreedyGroupExpression} from "@model/expression/greedy-group-expression";
import {getCharRange} from "@utils/string-utils";
import {RegexTokenType} from "@model/token/regex-token";
import {IndexedRegexToken} from "@model/token/indexed-regex-token";
import {ParseError} from "../../exception/parse-error";
import {OptionalExpression} from "@model/expression/optional-expression";
import {isGroupExpression} from "@model/expression/group-expression";
import {OptionalGroupExpression} from "@model/expression/optional-group-expression";
import AlternativeExpression from "@model/expression/alternative-expression";
import {DefaultGroupExpression} from "@model/expression/default-group-expression";
import {AssertionExpression} from "../../model/expression/assertion-expression";

export default class Parser {
    private readonly _lexer: Lexer

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
            const alternativeExpression = this.tryParseAlternatives(RegexTokenType.EOF)
            if (alternativeExpression) {
                const expression = alternativeExpression.length === 1 ? alternativeExpression[0] : DefaultGroupExpression.nonCapturing(...alternativeExpression)
                this._expressions.push(expression)
            }
        }
        if (!this._expressions.length) {
            return DefaultGroupExpression.nonCapturing()
        }
        if (this._expressions.length === 1) {
            return this._expressions[0]
        }
        return DefaultGroupExpression.nonCapturing(...this._expressions)
    }


    private tryParseAlternatives = (stopToken: RegexTokenType): Expression[] => {
        const alternatives: Expression[][] = []
        let currentAlternative: Expression[] = []
        while (this._currentToken !== null && this._currentToken.type !== stopToken) {
            if (this._currentToken.type === RegexTokenType.ALTERNATIVE) {
                this.consume(RegexTokenType.ALTERNATIVE)
                alternatives.push(currentAlternative)
                currentAlternative = []
            }
            const nextExpressions = this.tryParseRegex()
            nextExpressions.forEach(it => currentAlternative.push(it))
        }
        if (currentAlternative.length) {
            alternatives.push(currentAlternative)
        }

        this.consume(stopToken)

        if (!alternatives.length) {
            return null
        }
        if (alternatives.length === 1) {
            return alternatives[0]
        }

        return [new AlternativeExpression(...alternatives.map(it => it.length === 1 ? it[0] : DefaultGroupExpression.nonCapturing(...it)))]
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

        if (this._currentToken.type === RegexTokenType.CHARACTER_CLASS_START) {
            this.consume(RegexTokenType.CHARACTER_CLASS_START)
            const squareBracketExpression = this.consumeSquareBrackets()
            return [squareBracketExpression]
        }
        if (this._currentToken.type === RegexTokenType.CHARACTER_CLASS_NEGATED_START) {
            this.consume(RegexTokenType.CHARACTER_CLASS_NEGATED_START)
            const squareBracketExpression = this.consumeSquareBrackets(true)
            return [squareBracketExpression]
        }

        if (this._currentToken.type === RegexTokenType.GROUP_START) {
            this.consume(RegexTokenType.GROUP_START)
            const bracketContent = this.consumeBracketContent()
            const bracketExpression = new DefaultGroupExpression(...bracketContent)
            return [this.tryWrapInModifier(bracketExpression)]
        }
        if (this._currentToken.type === RegexTokenType.NON_CAPTURING_GROUP_START) {
            this.consume(RegexTokenType.NON_CAPTURING_GROUP_START)
            const bracketContent = this.consumeBracketContent()
            const bracketExpression = DefaultGroupExpression.nonCapturing(...bracketContent)
            return [this.tryWrapInModifier(bracketExpression)]
        }
        if (this._currentToken.type === RegexTokenType.LOOKAHEAD_GROUP_START) {
            this.consume(RegexTokenType.LOOKAHEAD_GROUP_START)
            const bracketContent = this.consumeBracketContent()
            const bracketExpression = AssertionExpression.positiveLookahead(...bracketContent)
            // @ts-ignore
            if (this._currentToken.type === RegexTokenType.MODIFIER) {
                this.consume(this._currentToken.type)
            }
            return [bracketExpression]
        }
        if (this._currentToken.type === RegexTokenType.LOOKAHEAD_NEGATIVE_GROUP_START) {
            this.consume(RegexTokenType.LOOKAHEAD_NEGATIVE_GROUP_START)
            const bracketContent = this.consumeBracketContent()
            const bracketExpression = AssertionExpression.negativeLookahead(...bracketContent)
            // @ts-ignore
            if (this._currentToken.type === RegexTokenType.MODIFIER) {
                this.consume(this._currentToken.type)
            }
            return [bracketExpression]
        }
        if (this._currentToken.type === RegexTokenType.LOOKBEHIND_GROUP_START) {
            this.consume(RegexTokenType.LOOKBEHIND_GROUP_START)
            this._allowModifiers = false
            const bracketContent = this.consumeBracketContent()
            const bracketExpression = AssertionExpression.positiveLookbehind(...bracketContent)
            this._allowModifiers = true
            // @ts-ignore
            if (this._currentToken.type === RegexTokenType.MODIFIER) {
                this.consume(this._currentToken.type)
            }
            return [bracketExpression]
        }
        if (this._currentToken.type === RegexTokenType.LOOKBEHIND_NEGATIVE_GROUP_START) {
            this.consume(RegexTokenType.LOOKBEHIND_NEGATIVE_GROUP_START)
            this._allowModifiers = false
            const bracketContent = this.consumeBracketContent()
            const bracketExpression = AssertionExpression.negativeLookbehind(...bracketContent)
            this._allowModifiers = true
            // @ts-ignore
            if (this._currentToken.type === RegexTokenType.MODIFIER) {
                this.consume(this._currentToken.type)
            }
            return [bracketExpression]
        }

        if (this._currentToken.type === RegexTokenType.CHARACTER && this._currentToken.lexem === '.') {
            this.consume(RegexTokenType.CHARACTER)
            const expression = this.tryWrapInModifier(new SimpleExpression(new WildcardCharacter()))
            return [expression]
        }

        if (this._currentToken.type === RegexTokenType.CHARACTER) {
            const characterExpression = this.consumeCharacter()
            return [characterExpression]
        }

        if (this._currentToken.type === RegexTokenType.ESCAPED) {
            const escapedExpression = this.consumeEscaped()
            return [escapedExpression]
        }

        if (this._currentToken.type === RegexTokenType.ALTERNATIVE) {
            return []
        }

        if (this._currentToken.type == RegexTokenType.MODIFIER) {
            this.throwParseError('Found orphaned modifier')
        }

        if (this._currentToken.type == RegexTokenType.CHARACTER_CLASS_END) {
            this.throwParseError('Found orphaned closing square bracket')
        }

        if (this._currentToken.type == RegexTokenType.GROUP_END) {
            this.throwParseError('Found orphaned closing bracket')
        }

        this.throwParseError('Unexpected token')
    }

    private tryParseEscaped = () => {
        const next = this._currentToken
        if (!next) {
            this.throwParseError('Found escape sequence at end of string')
        }
        if (next.type !== RegexTokenType.ESCAPED) {
            this.throwParseError('Unexpected token, expected ESCAPED')
        }
        this.consume(RegexTokenType.ESCAPED)
        if (next.lexem === "b") {
            return new SimpleExpression(new WordBoundaryCharacter())
        }
        if (next.lexem === "w") {
            return new SimpleExpression(new WordWildcardCharacter())
        }
        if (next.lexem === "d") {
            return new SimpleExpression(new DigitWildcardCharacter())
        }
        if (next.lexem === "s") {
            return new SimpleExpression(new WhitespaceCharacter())
        }
        if (next.lexem === "/") {
            return new SimpleExpression(new DefaultCharacter("/"))
        }
        // TODO: Only allowed in bracket expression
        if (next.lexem === "-") {
            return new SimpleExpression(new DefaultCharacter("-"))
        }
        // TODO: Only allowed in bracket expression
        if (next.lexem === ".") {
            return new SimpleExpression(new DefaultCharacter("."))
        }
        this.throwParseError('Found invalid escape sequence')
    }

    private consumeSquareBrackets(negated: boolean = false): Expression {
        const expressions = []
        while(this._currentToken.type !== RegexTokenType.CHARACTER_CLASS_END) {
            const next = this._currentToken
            switch(next.type) {
                case RegexTokenType.ANCHOR_START:
                case RegexTokenType.ANCHOR_END:
                case RegexTokenType.CHARACTER_CLASS_START:
                case RegexTokenType.CHARACTER_CLASS_NEGATED_START:
                    this.throwParseError('Unexpected token in brackets')
                    return
                case RegexTokenType.EOF:
                    this.throwParseError(`Unexpected eof in brackets`)
                    return
                case RegexTokenType.CHARACTER:
                    const char = this._currentToken.lexem
                    this.consume(RegexTokenType.CHARACTER)
                    if (this._currentToken.lexem !== "-") {
                        const charExpression = new SimpleExpression(new DefaultCharacter(char))
                        expressions.push(charExpression)
                        break
                    }
                    this.consume(RegexTokenType.CHARACTER)
                    if (this._currentToken.type !== RegexTokenType.CHARACTER) {
                        this.throwParseError('Invalid range definition in brackets')
                    }
                    const charsInRange = getCharRange(char, this._currentToken.lexem).map(it => new SimpleExpression(new DefaultCharacter(it)))
                    charsInRange.forEach(it => expressions.push(it))
                    this.consume(RegexTokenType.CHARACTER)
                    break
                case RegexTokenType.ESCAPED:
                    const escapedExpression = this.tryParseEscaped()
                    expressions.push(escapedExpression)
                    break
                case RegexTokenType.MODIFIER:
                    const token = this._currentToken
                    if (token.lexem === "?") {
                        this.consume(RegexTokenType.MODIFIER)
                        expressions.push(new SimpleExpression(new DefaultCharacter(token.lexem)))
                        break
                    }
                default:
                    this.throwParseError('Unknown token in brackets')
            }
        }
        this.consume(RegexTokenType.CHARACTER_CLASS_END)
        const bracketExpression = negated ? SquareBracketExpression.negated(...expressions) : new SquareBracketExpression(...expressions)
        return this.tryWrapInModifier(bracketExpression)
    }

    private consumeBracketContent(): Expression[] {
        const expressions: Expression[] = []
        const withinBrackets = this.tryParseAlternatives(RegexTokenType.GROUP_END)
        if (!withinBrackets) {
            this.throwParseError('Empty group')
        }
        withinBrackets.forEach(it => expressions.push(it))
        return expressions
    }

    private consumeCharacter() {
        const charExpression = new SimpleExpression(new DefaultCharacter(this._currentToken.lexem))
        this.consume(RegexTokenType.CHARACTER)
        return this.tryWrapInModifier(charExpression)
    }

    private consumeEscaped() {
        const escapedExpression = this.tryParseEscaped()
        return this.tryWrapInModifier(escapedExpression)
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
            if (this._currentToken.lexem === "*" || this._currentToken.lexem === "+") {
                const expression = isGroupExpression(baseExpression) ? new GreedyGroupExpression(baseExpression, this._currentToken.lexem === "*") : new GreedyExpression(baseExpression, this._currentToken.lexem === "*")
                this.consume(RegexTokenType.MODIFIER)
                return expression
            } else if (this._currentToken.lexem === "?") {
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
