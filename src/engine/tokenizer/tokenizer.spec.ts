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
        Token.character('t'),
        Token.character('h'),
        Token.character('i'),
        Token.character('s'),
        Token.modifier('+'),
        Token.character('-'),
        Token.character('i'),
        Token.character('s'),
        Token.character('-'),
        Token.character('m'),
        Token.modifier('*'),
    ])
})

test('should correctly detect brackets', () => {
    const tokenizer = new Tokenizer()
    const res = tokenizer.tokenize('this-is-[abc]')
    expect(res).toEqual([
        Token.character('t'),
        Token.character('h'),
        Token.character('i'),
        Token.character('s'),
        Token.character('-'),
        Token.character('i'),
        Token.character('s'),
        Token.character('-'),
        Token.bracketOpen(),
        Token.character('a'),
        Token.character('b'),
        Token.character('c'),
        Token.bracketClose(),
    ])
})
