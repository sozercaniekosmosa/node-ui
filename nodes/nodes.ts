import Value from "./value";
import Sum from "./sum";

interface ConfigOption {
    name: string;
    type: string;
    val: string | number;
    title: string;
    arrOption: any[];
}

interface Config {
    [key: string]: ConfigOption[];
}

export interface NodeConfig {
    ver: string;
    nodeName: string;
    color: string;
    widthEmpty: number;
    arrIn: string[];
    arrOut: string[];
    cfg: Config;
    icon: string;
    components?: any
}

const arrNode = [
    Value,
    Sum,
]


export interface Node {
    nodeName: string;
    components: NodeConfig
}

export const listNode: { [key: string]: NodeConfig } = {};

for (let i = 0; i < arrNode.length; i++) {
    const it = arrNode[i];
    //@ts-ignore
    listNode[it.nodeName] = it;
}
