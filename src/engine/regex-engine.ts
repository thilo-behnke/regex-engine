import {explode} from "../utils/string-utils";
import Parser from "./parser/parser";
import {Expression} from "../model/expression";

export default class RegexEngine {
    private readonly _parser: Parser

    constructor(parser: Parser = new Parser()) {
        this._parser = parser;
    }

    test = (s: string, p: string): boolean => {
        const stringChars = explode(s)

        let stringIdx = 0;
        while(stringIdx < stringChars.length) {
            const regexChars = this._parser.parse(p)
            const res = this.tryTest(stringChars.slice(stringIdx), regexChars)
            if (res) {
                return true
            }
            stringIdx++;
        }

        return false
    }

    private tryTest = (toTest: string[], expressions: Expression[]): boolean => {
        let stringIdx = 0
        for(let i = 0; i < expressions.length; i++) {

            const nextExpression = expressions[i]
            let expressionRes = false
            while(nextExpression.hasNext()) {
                const nextChar = toTest[stringIdx]
                expressionRes = nextExpression.matchNext(nextChar, stringIdx + 1 < toTest.length ? toTest[stringIdx + 1] : null)
                if (!expressionRes) {
                    break
                }
                stringIdx++
            }
            expressionRes = nextExpression.isSuccessful()

            if (expressionRes) {
                continue
            }

            if (expressionRes == false && i > 0) {
                const previousExpression = expressions[i - 1]
                if (this.tryBacktrack(previousExpression)) {
                    stringIdx--
                    continue
                }
                return false
            } else if (expressionRes == false) {
                return false
            }
        }
        return true
    }

    private evaluateExpression = (expression: Expression, toTest: string, nextChar: string) => {
        while (expression.hasNext()) {
            const res = expression.matchNext(toTest, nextChar)
            if (!res) {
                return false
            }
        }

        return expression.isSuccessful()
    }

    private tryBacktrack = (expression: Expression) => {
        if (!expression.canBacktrack()) {
            return false
        }
        return expression.backtrack()
    }
}
