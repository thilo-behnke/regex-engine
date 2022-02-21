import {explode} from "../utils/string-utils";

export default class RegexEngine {
    test = (s: string, p: string): boolean => {
        const stringChars = explode(s)
        const regexChars = explode(p)

        let stringIdx = 0;
        while(stringIdx < stringChars.length) {
            const res = this.tryTest(stringChars.slice(stringIdx), regexChars)
            if (res) {
                return true
            }
            stringIdx++;
        }

        return true
    }

    private tryTest = (toTest: string[], pattern: string[]): boolean => {
        if (pattern.length > toTest.length) {
            return false
        }

        for(let i = 0; i < pattern.length; i++) {
            const stringCharAtPos = toTest[i]
            if (stringCharAtPos != pattern[i]) {
                return false
            }
        }
        return true
    }
}
