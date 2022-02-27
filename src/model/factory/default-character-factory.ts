import CharacterFactory from "./character-factory";
import AnchorEndCharacter from "../anchor-end-character";
import AnchorStartCharacter from "../anchor-start-character";
import WordBoundaryCharacter from "../word-boundary-character";
import DefaultCharacter from "../default-character";
import DigitWildcardCharacter from "../digit-wildcard-character";
import {WhitespaceCharacter} from "../whitespace-character";
import WildcardCharacter from "../wildcard-character";
import WordWildcardCharacter from "../word-wildcard-character";

export default class DefaultCharacterFactory implements CharacterFactory {
    anchorEnd(): AnchorEndCharacter {
        return new AnchorEndCharacter();
    }

    anchorStart(): AnchorStartCharacter {
        return new AnchorStartCharacter();
    }

    boundary(): WordBoundaryCharacter {
        return new WordBoundaryCharacter();
    }

    default(s: string): DefaultCharacter {
        return new DefaultCharacter(s);
    }

    digitWildcard(): DigitWildcardCharacter {
        return new DigitWildcardCharacter();
    }

    whitespace(): WhitespaceCharacter {
        return new WhitespaceCharacter();
    }

    wildcard(): WildcardCharacter {
        return new WildcardCharacter();
    }

    wordWildcard(): WordWildcardCharacter {
        return new WordWildcardCharacter();
    }
}
