import RegexEngine from "./regex-engine";

test('should detect equal character literals', () => {
    const engine = new RegexEngine()
    const res = engine.test("string", "string")
    expect(res).toBeTruthy()
})

test('should detect character literals within string', () => {
    const engine = new RegexEngine()
    const res = engine.test("this-is-my-string", "string")
    expect(res).toBeTruthy()
})

test('should fail for character literal pattern longer than string', () => {
    const engine = new RegexEngine()
    const res = engine.test("my-string", "this-is-my-string")
    expect(res).toBeFalsy()
})

test('should detect match for character literals using greedy modifier *', () => {
    const engine = new RegexEngine()
    const res = engine.test("this-is-my-string", "my-s*")
    expect(res).toBeTruthy()
})

test('should detect match for character literals using greedy modifier +', () => {
    const engine = new RegexEngine()
    const res = engine.test("this-is-my-string", "my-s+")
    expect(res).toBeTruthy()
})

test.each([
    {value: "test", pattern: "t*st", shouldMatch: true},
    {value: "test", pattern: "x*st", shouldMatch: true},
    {value: "test", pattern: "x+st", shouldMatch: false},
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
]) ('should match: %s', ({value, pattern, shouldMatch}) => {
    const engine = new RegexEngine()
    const res = engine.test(value, pattern)
    expect(res).toEqual(shouldMatch)
})

test.each([
    {value: 'abc', pattern: '(a)', shouldMatch: true, expectedMatchGroups: ['a']},
    {value: 'abc', pattern: '(ad*)', shouldMatch: true, expectedMatchGroups: ['a']},
    {value: 'abc', pattern: '(ad+)', shouldMatch: false, expectedMatchGroups: []},
    {value: 'abc', pattern: '(ab+)c', shouldMatch: true, expectedMatchGroups: ['ab']},
    {value: 'abc', pattern: 'a(b+)c', shouldMatch: true, expectedMatchGroups: ['b']},
    {value: 'abc', pattern: 'a(d*)b', shouldMatch: false, expectedMatchGroups: []},
    {value: 'abc', pattern: 'a(d)*b', shouldMatch: true, expectedMatchGroups: []},
    {value: 'addb', pattern: 'a(d)*b', shouldMatch: true, expectedMatchGroups: ['d']},
]) ('should correctly match groups: %s', ({value, pattern, shouldMatch, expectedMatchGroups}) => {
    const engine = new RegexEngine()
    const res = engine.test(value, pattern)
    expect(res).toEqual(shouldMatch)
    expect(engine.matchGroups).toEqual(expectedMatchGroups)
})

