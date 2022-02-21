import RegexEngine from "./regex-engine";

test('should detect equal character literals', () => {
    const engine = new RegexEngine()
    const res = engine.test("string", "string")
    expect(res).toBeTruthy()
})
