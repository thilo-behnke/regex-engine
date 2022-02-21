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
]) ('should match', ({value, pattern, shouldMatch}) => {
    const engine = new RegexEngine()
    const res = engine.test(value, pattern)
    expect(res).toEqual(shouldMatch)
})
