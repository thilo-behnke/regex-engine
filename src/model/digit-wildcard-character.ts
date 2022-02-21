import Character from "./character";
import {isDigit} from "../utils/string-utils";

export default class DigitWildcardCharacter implements Character {
    test(s: string): boolean {
        return isDigit(s);
    }
}
