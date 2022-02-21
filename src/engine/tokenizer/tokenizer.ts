import Token, {TokenType} from "../../model/token";
import {explode} from "../../utils/string-utils";

export default class Tokenizer {
    tokenize(s: string): Token[] {
        const chars = explode(s)
        return chars.map(it => {
            if (it === '*' || it === '+') {
                return Token.Modifier(it)
            }
            return Token.Character(it)
        })
    }
}
