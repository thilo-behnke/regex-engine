import {explodeIndexed, IndexedToken} from "../utils/string-utils";
import Parser from "./parser/parser";
import {Expression} from "../model/expression";
import {isGroupExpression} from "../model/group-expression";
import {MatchGroup} from "../model/match/match-group";
import {AssertionExpression, AssertionType} from "../model/assertion-expression";

export default class RegexEngine {
    private readonly _parser: Parser
    private _matchOffset: number = 0
    private _match: string = null
    private _groups: MatchGroup[] = []

    constructor(parser: Parser = new Parser()) {
        this._parser = parser;
    }

    get groups(): MatchGroup[] {
        return this._groups
    }

    get matched(): string {
        return this._match
    }

    match = (s: string, p: string): boolean => {
        this._matchOffset = 0;
        this._groups = []
        this._match = null
        const tokens = explodeIndexed(s)

        while(this._matchOffset < tokens.length) {
            const expression = this._parser.parse(p)
            const res = RegexEngine.tryTestExpression(expression, tokens, this._matchOffset)
            let matchSuccessful = res.match
            let tokensConsumed = res.tokensConsumed
            while (!matchSuccessful && expression.canBacktrack()) {
                const backtrackRes = expression.backtrack(tokens)
                if (!backtrackRes) {
                    break
                }
                const  unmatchedTokenOffset = this._matchOffset + tokensConsumed
                if ( unmatchedTokenOffset >= tokens.length) {
                    matchSuccessful = true
                    break
                }
                const res = RegexEngine.tryTestExpression(expression, tokens, unmatchedTokenOffset)
                matchSuccessful = res.match
                tokensConsumed = res.tokensConsumed
            }
            if (matchSuccessful) {
                this._match = expression.currentMatch().map(it => it.value).join('')
                if (isGroupExpression(expression)) {
                    this._groups = expression.matchGroups
                }
                return true
            }
            this._matchOffset++;
        }

        return false
    }

    private static tryTestExpression = (expression: Expression, toTest: IndexedToken[], offset: number) => {
        let idx = offset
        while(expression.hasNext()) {
            const nextChar = idx < toTest.length ? toTest[idx] : null
            const previous = idx > 0 ? toTest[idx - 1] : null
            const next = idx + 1 < toTest.length ? toTest[idx + 1] : null
            const matchRes = expression.matchNext(nextChar, previous, next, toTest)
            idx += matchRes.consumed
            if (!matchRes.matched) {
                break
            }
        }
        return {match: expression.isSuccessful(), tokensConsumed: idx - offset, matched: expression.currentMatch().map(it => it.value)}
    }
}
