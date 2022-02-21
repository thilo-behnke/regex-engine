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
            while(nextExpression.hasNext()) {
                const nextChar = toTest[stringIdx]
                const res = nextExpression.matchNext(nextChar, stringIdx + 1 < toTest.length ? toTest[stringIdx + 1] : null)
                if (res == false) {
                    return false
                }

                stringIdx++
                if (stringIdx >= toTest.length) {
                    break
                }
            }
            if (!nextExpression.isSuccessful()) {
                return false;
            }
        }
        return true
    }
}
