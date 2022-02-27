import {getCharRange, isDigit} from "./string-utils";

test.each([
    {value: "0", expected: true},
    {value: "9", expected: true},
    {value: "w", expected: false},
    {value: "9399", expected: false},
])('should identify single digits', ({value, expected}) => {
    const res = isDigit(value)
    expect(res).toEqual(expected)
})

test.each([
    {from: 'a', to: 'c', expected: ['a', 'b', 'c']},
    {from: 'a', to: 'a', expected: ['a']},
])('should return char range', ({from, to, expected}) => {
    const res = getCharRange(from, to)
    expect(res).toEqual(expected)
})
