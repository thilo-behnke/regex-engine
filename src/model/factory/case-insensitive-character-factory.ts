import DefaultCharacterFactory from "./default-character-factory";
import DefaultCharacter from "../default-character";

export class CaseInsensitiveCharacterFactory extends DefaultCharacterFactory {
    default(s: string): DefaultCharacter {
        return super.default(s.toLowerCase());
    }
}
