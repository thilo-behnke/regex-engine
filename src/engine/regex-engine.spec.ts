import RegexEngine from "./regex-engine";

test('should detect equal character literals', () => {
    const engine = new RegexEngine()
    const res = engine.match("string", "string")
    expect(res).toBeTruthy()
})

test('should detect character literals within string', () => {
    const engine = new RegexEngine()
    const res = engine.match("this-is-my-string", "string")
    expect(res).toBeTruthy()
})

test('should fail for character literal pattern longer than string', () => {
    const engine = new RegexEngine()
    const res = engine.match("my-string", "this-is-my-string")
    expect(res).toBeFalsy()
})

test('should detect match for character literals using greedy modifier *', () => {
    const engine = new RegexEngine()
    const res = engine.match("this-is-my-string", "my-s*")
    expect(res).toBeTruthy()
})

test('should detect match for character literals using greedy modifier +', () => {
    const engine = new RegexEngine()
    const res = engine.match("this-is-my-string", "my-s+")
    expect(res).toBeTruthy()
})

test.each([
    {value: "test", pattern: "t*st", shouldMatch: true},
    {value: "test", pattern: "x*st", shouldMatch: true},
    {value: "test", pattern: "x+st", shouldMatch: false},
    {value: "abctestdef", pattern: "test", shouldMatch: true},
    {value: "ttsseet", pattern: "[test]+", shouldMatch: true},
    {value: "ttsseetxxy", pattern: "[test]+[xyz]+", shouldMatch: true},
    {value: "testing", pattern: "test[iyz]n.", shouldMatch: true},
    {value: "testing", pattern: "test[wyz]n.", shouldMatch: false},
    {value: "this is not a drill in nottingham", pattern: "\\bnot\\b", shouldMatch: true},
    {value: "this is not a drill in nottingham", pattern: "\\bdrills\\b", shouldMatch: false},
    {value: "many words", pattern: "\\w+", shouldMatch: true},
    {value: " ", pattern: "\\w+", shouldMatch: false},
    {value: "092934", pattern: "\\d+", shouldMatch: true},
    {value: "word", pattern: "\\d", shouldMatch: false},
    {value: "testtttest", pattern: "test+test", shouldMatch: true},
    {value: "testest", pattern: "test+test", shouldMatch: false},
    {value: "test", pattern: "^test$", shouldMatch: true},
    {value: "test-word", pattern: "^test$", shouldMatch: false},
    {value: "another-test-word", pattern: "^test", shouldMatch: false},
    {value: "anchor-textabcabc", pattern: "^anchor-text[abc]+$", shouldMatch: true},
    {value: "anchor-textabcabcxxx", pattern: "^anchor-text[abc]+$", shouldMatch: false},
    {value: "abcd", pattern: "^abc[c]*[d]*cd$", shouldMatch: false},
    {value: "abccd", pattern: "^abc[c]*[d]*cd$", shouldMatch: true},
    {value: "abccccccd", pattern: "^abc[c]*[d]*cd$", shouldMatch: true},
    {value: "abcd", pattern: "^ab[c]*[d]*cd$", shouldMatch: true},
    {value: "abcd test", pattern: "abcd\\stest", shouldMatch: true},
    {value: "a", pattern: "[^abc]", shouldMatch: false},
    {value: "x", pattern: "[^abc]", shouldMatch: true},
    {value: "a", pattern: "[^abc]+", shouldMatch: false},
    {value: "x", pattern: "[^abc]+", shouldMatch: true},
    {value: "ax", pattern: "[^abc]+", shouldMatch: true},
    {value: "ax", pattern: "^[^abc]+", shouldMatch: false},
    {value: "X", pattern: "[A-Z]", shouldMatch: true},
    {value: "Y9c", pattern: "[A-Y][7-9]c", shouldMatch: true},
    {value: "atest", pattern: "^te*est$", shouldMatch: false},
    {value: "test", pattern: "(.*)", shouldMatch: true},
]) ('should match: %s', ({value, pattern, shouldMatch}) => {
    const engine = new RegexEngine()
    const res = engine.match(value, pattern)
    expect(res).toEqual(shouldMatch)
})

test.each([
    {value: 'abc', pattern: '(a)', shouldMatch: true, expectedMatch: 'a', expectedMatchGroups: [{match: 'a', from: 0, to: 1}]},
    {value: 'abc', pattern: '(ad*)', shouldMatch: true, expectedMatch: 'a', expectedMatchGroups: [{match: 'a', from: 0, to: 1}]},
    {value: 'abc', pattern: '(ad+)', shouldMatch: false, expectedMatch: null, expectedMatchGroups: []},
    {value: 'abc', pattern: '(ab+)c', shouldMatch: true, expectedMatch: 'abc', expectedMatchGroups: [{match: 'ab', from: 0, to: 2}]},
    {value: 'abc', pattern: 'a(b+)c', shouldMatch: true, expectedMatch: 'abc', expectedMatchGroups: [{match: 'b', from: 1, to: 2}]},
    {value: 'abc', pattern: 'a(d*)b', shouldMatch: true, expectedMatch: 'ab', expectedMatchGroups: []},
    {value: 'abc', pattern: 'a(d+)b', shouldMatch: false, expectedMatch: null, expectedMatchGroups: []},
    {value: 'abc', pattern: 'a(d)*b', shouldMatch: true, expectedMatch: 'ab', expectedMatchGroups: []},
    {value: 'addb', pattern: 'a(d)*b', shouldMatch: true, expectedMatch: 'addb', expectedMatchGroups: [{match: 'd', from: 2, to: 3}]},
    {value: 'abc', pattern: 'a(?:bc)', shouldMatch: true, expectedMatch: 'abc', expectedMatchGroups: []},
    {value: 'abcde', pattern: 'a(?:bc)(de)', shouldMatch: true, expectedMatch: 'abcde', expectedMatchGroups: [{match: 'de', from: 3, to: 5}]},
    {value: 'abcdddef', pattern: 'abcd*(de)f', shouldMatch: true, expectedMatch: 'abcdddef', expectedMatchGroups: [{match: 'de', from: 5, to: 7}]},
    {value: 'abcddde', pattern: 'abc(d*)de', shouldMatch: true, expectedMatch: 'abcddde', expectedMatchGroups: [{match: 'dd', from: 3, to: 5}]},
    {value: 'test', pattern: 't*(st)', shouldMatch: true, expectedMatch: 'st', expectedMatchGroups: [{match: 'st', from: 2, to: 4}]},
    {value: 'test', pattern: 't*st', shouldMatch: true, expectedMatch: 'st', expectedMatchGroups: []},
    {value: 'abc', pattern: '(a(b(c)))', shouldMatch: true, expectedMatch: 'abc', expectedMatchGroups: [{match: 'abc', from: 0, to: 3}, {match: 'bc', from: 1, to: 3}, {match: 'c', from: 2, to: 3}]},
]) ('should correctly match groups: %s', ({value, pattern, shouldMatch, expectedMatch, expectedMatchGroups}) => {
    const engine = new RegexEngine()
    const res = engine.match(value, pattern)
    expect(res).toEqual(shouldMatch)
    expect(engine.matched).toEqual(expectedMatch)
    expect(engine.groups).toEqual(expectedMatchGroups)
})

test.each([
    {value: 'ab', pattern: 'a(?=b)', shouldMatch: true, expectedMatchGroups: [], expectedMatch: 'a'},
    {value: 'b', pattern: '(?=b)', shouldMatch: true, expectedMatchGroups: [], expectedMatch: ''},
    {value: 'b', pattern: '(?!b)', shouldMatch: false, expectedMatchGroups: [], expectedMatch: null},
    {value: 'test', pattern: 'test(?!b)', shouldMatch: true, expectedMatchGroups: [], expectedMatch: 'test'},
    {value: 'a', pattern: '(?!b)a', shouldMatch: true, expectedMatchGroups: [], expectedMatch: 'a'},
    {value: 'ba', pattern: '(?=b)ba', shouldMatch: true, expectedMatchGroups: [], expectedMatch: 'ba'},
    {value: 'bac', pattern: '(?=b)(?:b)(a)(?=c)', shouldMatch: true, expectedMatchGroups: [{match: 'a', from: 1, to: 2}], expectedMatch: 'ba'},
    {value: 'bac', pattern: '(?=(b))(?:b)(a)(?=c)', shouldMatch: true, expectedMatchGroups: [{match: 'b', from: 0, to: 1}, {match: 'a', from: 1, to: 2}], expectedMatch: 'ba'},
]) ('should correctly handle lookahead: %s', ({value, pattern, shouldMatch, expectedMatchGroups, expectedMatch}) => {
    const engine = new RegexEngine()
    const res = engine.match(value, pattern)
    expect(res).toEqual(shouldMatch)
    expect(engine.groups).toEqual(expectedMatchGroups)
    expect(engine.matched).toEqual(expectedMatch)
})

test.each([
    {value: 'ab', pattern: '(?<=a)b', shouldMatch: true, expectedMatchGroups: [], expectedMatch: 'b'},
    {value: 'ab', pattern: 'a(?<=a)b', shouldMatch: true, expectedMatchGroups: [], expectedMatch: 'ab'},
    {value: 'abctestabc', pattern: '(?<!d)test', shouldMatch: true, expectedMatchGroups: [], expectedMatch: 'test'},
    {value: 'ab', pattern: 'a(?<=(a))b', shouldMatch: true, expectedMatchGroups: [{match: 'a', from: 0, to: 1}], expectedMatch: 'ab'},
    {value: 'abcdef', pattern: 'abc(?<!x)d(?<=d)ef', shouldMatch: true, expectedMatchGroups: [], expectedMatch: 'abcdef'},
    {value: 'xyzabcdef', pattern: '(?<=abc)def', shouldMatch: true, expectedMatchGroups: [], expectedMatch: 'def'},
]) ('should correctly handle lookbehind: %s', ({value, pattern, shouldMatch, expectedMatchGroups, expectedMatch}) => {
    const engine = new RegexEngine()
    const res = engine.match(value, pattern)
    expect(res).toEqual(shouldMatch)
    expect(engine.groups).toEqual(expectedMatchGroups)
    expect(engine.matched).toEqual(expectedMatch)
})

test.each([
    {value: 'abc', pattern: 'a?bc', shouldMatch: true, expectedMatchGroups: [], expectedMatch: 'abc'},
    {value: 'abc', pattern: '(a?)bc', shouldMatch: true, expectedMatchGroups: [{match: 'a', from: 0, to: 1}], expectedMatch: 'abc'},
    {value: 'xbc', pattern: '[a-z]?bc', shouldMatch: true, expectedMatchGroups: [], expectedMatch: 'xbc'},
    {value: 'abc', pattern: '(a)?bc', shouldMatch: true, expectedMatchGroups: [{match: 'a', from: 0, to: 1}], expectedMatch: 'abc'},
    {value: 'abc', pattern: '(a*)?abc', shouldMatch: true, expectedMatchGroups: [], expectedMatch: 'abc'},
    {value: 'ab', pattern: '^a(b(c)?)$', shouldMatch: true, expectedMatchGroups: [{match: 'b', from: 1, to: 2}], expectedMatch: 'ab'},
    {value: 'abcd', pattern: 'a[b]?cd', shouldMatch: true, expectedMatchGroups: [], expectedMatch: 'abcd'},
]) ('should correctly match optional modifier: %s', ({value, pattern, shouldMatch, expectedMatchGroups, expectedMatch}) => {
    const engine = new RegexEngine()
    const res = engine.match(value, pattern)
    expect(res).toEqual(shouldMatch)
    expect(engine.groups).toEqual(expectedMatchGroups)
    expect(engine.matched).toEqual(expectedMatch)
})

test.each([
    // {value: 'a', pattern: 'a|b', shouldMatch: true, expectedMatchGroups: [], expectedMatch: 'a'},
    // {value: 'b', pattern: 'a|b', shouldMatch: true, expectedMatchGroups: [], expectedMatch: 'b'},
    // {value: 'c', pattern: 'a|b', shouldMatch: false, expectedMatchGroups: [], expectedMatch: null},
    // {value: 'abcd', pattern: '(ab[c]?|xyz)d', shouldMatch: true, expectedMatchGroups: [{match: 'abc', from: 0, to: 3}], expectedMatch: 'abcd'},
    {value: 'ab', pattern: '(ab+|a)b', shouldMatch: false, expectedMatchGroups: [{match: 'a', from: 0, to: 1}], expectedMatch: ['a', 'b']},
]) ('should correctly match alternatives: %s', ({value, pattern, shouldMatch, expectedMatchGroups, expectedMatch}) => {
    const engine = new RegexEngine()
    const res = engine.match(value, pattern)
    expect(res).toEqual(shouldMatch)
    expect(engine.groups).toEqual(expectedMatchGroups)
    expect(engine.matched).toEqual(expectedMatch)
})

// TODO: Fix.
// test.each([
//     // url regex
//     // https://stackoverflow.com/a/27755
//     {value: 'https://www.google.com', pattern: '^((http[s]?|ftp):\\/)?\\/?([^:\\/\\s]+)((\\/\\w+)*\\/)([\\w\\-\\.]+[^#?\\s]+)(.*)?(#[\\w\\-]+)?$', shouldMatch: true, expectedMatchGroups: [], expectedMatch: 'b'},
// ]) ('should correctly handle real world examples', ({value, pattern, shouldMatch, expectedMatchGroups, expectedMatch}) => {
//     const engine = new RegexEngine()
//     const res = engine.match(value, pattern)
//     expect(res).toEqual(shouldMatch)
//     expect(engine.groups).toEqual(expectedMatchGroups)
//     expect(engine.matched).toEqual(expectedMatch)
// })
