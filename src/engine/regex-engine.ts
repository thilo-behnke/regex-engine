import {explodeIndexed, IndexedToken} from "../utils/string-utils";
import Parser from "./parser/parser";
import {Expression} from "@model/expression/expression";
import {isGroupExpression} from "@model/expression/group-expression";
import {MatchGroup} from "../model/match/match-group";
import {Logger} from "../logging/logger";
import {LoggerFactory} from "../logging/logger-factory";

export default class RegexEngine {
    private readonly _parser: Parser
    private readonly _logger: Logger = LoggerFactory.for(this.constructor.name)
    private _matchOffset: number = 0
    private _match: string = null
    private _groups: MatchGroup[] = []

    constructor(parser: Parser = null) {
        this._parser = parser ?? new Parser()
    }

    get groups(): MatchGroup[] {
        return this._groups
    }

    get matched(): string {
        return this._match
    }

    match = (s: string, p: string): boolean => {
        this._logger.info(`Regex engine called to match pattern > ${p} < against string > ${s} <`)
        this._matchOffset = 0;
        this._groups = []
        this._match = null
        const tokens = explodeIndexed(s)

        while(this._matchOffset < tokens.length) {
            this._logger.info(`Start match for offset ${this._matchOffset}: > ${tokens.slice(this._matchOffset).map(it => it.value).join('')} <`)
            const expression = this._parser.parse(p)
            const res = this.tryTestExpression(expression, tokens, this._matchOffset)
            let matchSuccessful = res.match
            let tokensConsumed = res.tokensConsumed
            while (!matchSuccessful && expression.canBacktrack()) {
                this._logger.info(`Match failed, will now try to backtrack`)
                const backtrackRes = expression.backtrack(tokens)
                if (!backtrackRes.successful) {
                    break
                }
                const unmatchedTokenOffset = this._matchOffset + tokensConsumed - backtrackRes.consumed
                if (unmatchedTokenOffset >= tokens.length) {
                    matchSuccessful = true
                    this._logger.info(`Backtrack successful`)
                    break
                }
                const res = this.tryTestExpression(expression, tokens, unmatchedTokenOffset)
                matchSuccessful = res.match
                tokensConsumed = res.tokensConsumed
                if (matchSuccessful) {
                    this._logger.info(`Match after backtrack successful`)
                } else {
                    if (expression.canBacktrack()) {
                        this._logger.info(`Match after backtrack failed, will try to backtrack further`)
                    } else {
                        this._logger.info(`Backtrack exhausted`)
                    }
                }
            }
            if (matchSuccessful) {
                this._match = expression.currentMatch().map(it => it.value).join('')
                if (isGroupExpression(expression)) {
                    this._groups = expression.matchGroups
                }
                this._logger.info(`Match successful for offset ${this._matchOffset}`)
                return true
            }
            this._logger.info(`Match failed for offset ${this._matchOffset}`)
            this._matchOffset++;
        }

        return false
    }

    private tryTestExpression = (expression: Expression, toTest: IndexedToken[], offset: number) => {
        let idx = offset
        while(expression.hasNext()) {
            const nextChar = idx < toTest.length ? toTest[idx] : null
            const previous = idx > 0 ? toTest[idx - 1] : null
            const next = idx + 1 < toTest.length ? toTest[idx + 1] : null
            this._logger.debug(`Now matching token ${nextChar.value} at ${idx} with ${expression.constructor.name}`)
            const matchRes = expression.matchNext(nextChar, previous, next, toTest)
            idx += matchRes.consumed
            if (!matchRes.matched) {
                this._logger.debug(`Match failed for token ${nextChar.value} at ${idx}`)
                break
            }
            this._logger.debug(`Match successful for token ${nextChar.value} at ${idx}`)
        }
        return {match: expression.isSuccessful(), tokensConsumed: idx - offset, matched: expression.currentMatch().map(it => it.value)}
    }
}
