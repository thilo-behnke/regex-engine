import Character from "./character";

export default class WildcardCharacter implements Character {
    test(s: string): boolean {
        return true
    }
}
