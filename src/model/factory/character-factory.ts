import Character from "../character";
import WildcardCharacter from "../wildcard-character";
import DefaultCharacter from "../default-character";
import WordBoundaryCharacter from "../word-boundary-character";
import AnchorStartCharacter from "../anchor-start-character";
import AnchorEndCharacter from "../anchor-end-character";
import {WhitespaceCharacter} from "../whitespace-character";
import DigitWildcardCharacter from "../digit-wildcard-character";
import WordWildcardCharacter from "../word-wildcard-character";

export default interface CharacterFactory {
    anchorStart(): AnchorStartCharacter
    anchorEnd(): AnchorEndCharacter
    default(s: string): DefaultCharacter
    whitespace(): WhitespaceCharacter
    boundary(): WordBoundaryCharacter
    wildcard(): WildcardCharacter
    digitWildcard(): DigitWildcardCharacter
    wordWildcard(): WordWildcardCharacter
}
