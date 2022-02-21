import Character from "../character";
import WildcardCharacter from "../wildcard-character";
import DefaultCharacter from "../default-character";
import WordBoundaryCharacter from "../word-boundary-character";

export default class CharacterFactory {
    create = (s: string): Character => {
        switch (s) {
            case '.':
                return new WildcardCharacter()
            case '\\b':
                return new WordBoundaryCharacter()
            default:
                return new DefaultCharacter(s)
        }
    }
}
