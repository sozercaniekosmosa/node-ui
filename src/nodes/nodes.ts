import Value from "./value/value";
import Sum from "./sum/sum";

export type TCfg = Record<string, any>

export const arrNode = [
    new Value(),
    new Sum(),
]

export const listNode = {}

for (let i = 0; i < arrNode.length; i++) {
    const it = arrNode[i];
    listNode[it.name] = it;
}
