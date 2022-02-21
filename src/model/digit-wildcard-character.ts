import Character from "./character";

export default class DigitWildcardCharacter implements Character {
    test(s: string): boolean {
        return false;
    }
}
