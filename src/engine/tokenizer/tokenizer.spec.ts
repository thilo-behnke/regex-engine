import Tokenizer from "./tokenizer";
import DefaultRegexToken from "../../model/token/regex-token";

test('should return empty array for empty string', () => {
    const tokenizer = new Tokenizer()
    const res = tokenizer.tokenize('')
    expect(res).toEqual([DefaultRegexToken.eof()])
})

test('should correctly detect characters vs modifiers', () => {
    const tokenizer = new Tokenizer()
    const res = tokenizer.tokenize('this+-is-m*')
    expect(res).toEqual([
        DefaultRegexToken.character('t'),
        DefaultRegexToken.character('h'),
        DefaultRegexToken.character('i'),
        DefaultRegexToken.character('s'),
        DefaultRegexToken.modifier('+'),
        DefaultRegexToken.character('-'),
        DefaultRegexToken.character('i'),
        DefaultRegexToken.character('s'),
        DefaultRegexToken.character('-'),
        DefaultRegexToken.character('m'),
        DefaultRegexToken.modifier('*'),
        DefaultRegexToken.eof()
    ])
})

test('should correctly detect square brackets', () => {
    const tokenizer = new Tokenizer()
    const res = tokenizer.tokenize('this-is-[abc]')
    expect(res).toEqual([
        DefaultRegexToken.character('t'),
        DefaultRegexToken.character('h'),
        DefaultRegexToken.character('i'),
        DefaultRegexToken.character('s'),
        DefaultRegexToken.character('-'),
        DefaultRegexToken.character('i'),
        DefaultRegexToken.character('s'),
        DefaultRegexToken.character('-'),
        DefaultRegexToken.squareBracketOpen(),
        DefaultRegexToken.character('a'),
        DefaultRegexToken.character('b'),
        DefaultRegexToken.character('c'),
        DefaultRegexToken.squareBracketClose(),
        DefaultRegexToken.eof()
    ])
})

test('should correctly detect brackets', () => {
    const tokenizer = new Tokenizer()
    const res = tokenizer.tokenize('this-is-(abc)')
    expect(res).toEqual([
        DefaultRegexToken.character('t'),
        DefaultRegexToken.character('h'),
        DefaultRegexToken.character('i'),
        DefaultRegexToken.character('s'),
        DefaultRegexToken.character('-'),
        DefaultRegexToken.character('i'),
        DefaultRegexToken.character('s'),
        DefaultRegexToken.character('-'),
        DefaultRegexToken.bracketOpen(),
        DefaultRegexToken.character('a'),
        DefaultRegexToken.character('b'),
        DefaultRegexToken.character('c'),
        DefaultRegexToken.bracketClose(),
        DefaultRegexToken.eof()
    ])
})
