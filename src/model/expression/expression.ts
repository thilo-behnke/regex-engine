import {IndexedToken} from "@utils/string-utils";
import {MatchIteration} from "./match-iteration";
import {BacktrackIteration} from "./backtrack-iteration";

export interface Expression {
    /**
     * Returns true if the expression is in its initial state (e.g. before matchNext was executed or after reset).
     */
    isInitial: () => boolean

    /**
     * Returns true if another match can be attempted.
     * This is e.g. not the case if the expression is exhausted.
     */
    hasNext: () => boolean

    /**
     * Take the given token and check whether it matches the expression.
     * @param s token to check (nullable!)
     * @param last token before current (nullable!)
     * @param next token after current (nullable!)
     * @param toTest complete list of tokens to test (may include tokens that are not matched because of the cursor offset)
     * @return MatchIteration
     */
    matchNext(s: IndexedToken, last: IndexedToken, next: IndexedToken, toTest: IndexedToken[]): MatchIteration

    /**
     * Returns true if the expression is able to backtrack, i.e. check states before the latest match.
     */
    canBacktrack(): boolean

    /**
     * Execute backtrack (one token at a time) and return true if the updated state still matches.
     * @param toTest complete list of tokens to test (may include tokens that are not matched because of the cursor offset)
     */
    backtrack(toTest: IndexedToken[]): BacktrackIteration

    /**
     * Return the length of the shortest possible match.
     */
    get minimumLength(): number

    /**
     * Returns true if the expression in its current state matches.
     * This does not necessarily mean that the expression can't match any more tokens.
     */
    isSuccessful: () => boolean

    /**
     * Return the tokens currently matched by this expression.
     */
    currentMatch: () => IndexedToken[]

    /**
     * Reset the expression to its initial state.
     */
    reset(): void
}
