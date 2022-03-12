import {Expression} from "../expression/expression";
import {AssertionExpression} from "../expression/assertion-expression";
import {DefaultGroupExpression} from "../expression/default-group-expression";

export enum GroupExpressionType {
    CAPTURING = 'CAPTURING',
    NON_CAPTURING = 'NON_CAPTURING',
    POSITIVE_LOOKAHEAD = 'POSITIVE_LOOKAHEAD',
    NEGATIVE_LOOKAHEAD = 'NEGATIVE_LOOKAHEAD',
    POSITIVE_LOOKBEHIND = 'POSITIVE_LOOKBEHIND',
    NEGATIVE_LOOKBEHIND = 'NEGATIVE_LOOKBEHIND',
}

export const isLookahead = (type: GroupExpressionType) => {
    return [GroupExpressionType.POSITIVE_LOOKAHEAD, GroupExpressionType.NEGATIVE_LOOKAHEAD].includes(type)
}

export const isLookbehind = (type: GroupExpressionType) => {
    return [GroupExpressionType.POSITIVE_LOOKBEHIND, GroupExpressionType.NEGATIVE_LOOKBEHIND].includes(type)
}

export const isMatchGroup = (type: GroupExpressionType) => {
    return [GroupExpressionType.CAPTURING, GroupExpressionType.NON_CAPTURING].includes(type)
}

export const createGroupExpression = (type: GroupExpressionType, ...expressions: Expression[]) => {
    switch(type) {
        case GroupExpressionType.CAPTURING:
            return new DefaultGroupExpression(...expressions)
        case GroupExpressionType.NON_CAPTURING:
            return DefaultGroupExpression.nonCapturing(...expressions)
        case GroupExpressionType.POSITIVE_LOOKAHEAD:
            return AssertionExpression.positiveLookahead(...expressions)
        case GroupExpressionType.NEGATIVE_LOOKAHEAD:
            return AssertionExpression.negativeLookahead(...expressions)
        case GroupExpressionType.POSITIVE_LOOKBEHIND:
            return AssertionExpression.positiveLookbehind(...expressions)
        case GroupExpressionType.NEGATIVE_LOOKBEHIND:
            return AssertionExpression.negativeLookbehind(...expressions)
    }
}
