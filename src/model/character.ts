import Token from "./token";

export default interface Character {
    test(s: string, previous: string, next: string, isZeroPosMatch: boolean): boolean
    cursorOnly(): boolean
}
