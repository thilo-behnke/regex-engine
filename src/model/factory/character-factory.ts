import Character from "@model/character/character";
import WildcardCharacter from "@model/character/wildcard-character";
import DefaultCharacter from "@model/character/default-character";
import WordBoundaryCharacter from "@model/character/word-boundary-character";

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
