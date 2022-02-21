import Tokenizer from "./tokenizer";
import Token from "../../model/token";

test('should return empty array for empty string', () => {
    const tokenizer = new Tokenizer()
    const res = tokenizer.tokenize('')
    expect(res).toEqual([])
})

test('should correctly detect characters vs modifiers', () => {
    const tokenizer = new Tokenizer()
    const res = tokenizer.tokenize('this+-is-m*')
    expect(res).toEqual([
        Token.Character('t'),
        Token.Character('h'),
        Token.Character('i'),
        Token.Character('s'),
        Token.Modifier('+'),
        Token.Character('-'),
        Token.Character('i'),
        Token.Character('s'),
        Token.Character('-'),
        Token.Character('m'),
        Token.Modifier('*'),
    ])
})
