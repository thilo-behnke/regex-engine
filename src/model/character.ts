import Token from "./token";

export default interface Character {
    test(s: string, last: string = null, next: string = null): boolean
}
