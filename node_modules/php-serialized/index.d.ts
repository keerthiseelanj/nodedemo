export type Node = any

/** Parse an AST from the serialized input */
export const parse: (input: string, raw?: boolean | ((nodes: Node[]) => any)) => Node

/** Serialize the given value */
export const serialize: (value: any) => string

/** Parse an actual value from the serialized input */
export const unserialize: (input: string, onArray?: ((nodes: Node[]) => any)) => any

/** Materialize an AST into an actual value */
export const reduce: (ast: Node | Node[]) => any
