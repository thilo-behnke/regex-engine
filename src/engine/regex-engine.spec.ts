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
    expect(res).toBeTruthy()
})
