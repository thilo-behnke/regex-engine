import {range} from "./array-utils";

test.each([
    {from: 2, to: 4, expected: [2, 3, 4]}
])("should correctly create range", ({from, to, expected}) => {
    const res = range(from, to)
    expect(res).toEqual(expected)
})
