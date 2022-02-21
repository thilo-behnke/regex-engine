import Token from "./token";

export default interface Character {
    test(s: string, previous: string = null, next: string = null, isZeroPosMatch = false): boolean
    cursorOnly(): boolean
}
