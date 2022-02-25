
export enum ExpressionType {
    ANCHOR_START = "ANCHOR_START",
    ANCHOR_END = "ANCHOR_START",
    CHARACTER = 'CHARACTER',
    SPECIAL_CHARACTER = 'SPECIAL_CHARACTER',
    BRACKETS = 'BRACKETS',
    MODIFIER = 'MODIFIER'
}

export type ExpressionDescriptor = {
    type: ExpressionType.ANCHOR_END
        | ExpressionType.ANCHOR_START
} | {
    type: ExpressionType.CHARACTER
        | ExpressionType.SPECIAL_CHARACTER
        | ExpressionType.MODIFIER,
    value: string
} | {
    type: ExpressionType.BRACKETS,
    value: ExpressionDescriptor[]
}
