type TTypeName = string;
type TValue = any;
type TName = string;
type TConfig = [TName, TValue, TTypeName];
type TPath = string;

export interface TLink {
    [key: string]: TPath[];
}

export interface THostPort {
    host: string,
    port: number
}

export interface THost {
    [key: string]: THostPort;
}

export type TCfg = [string, any, string];

export interface TTask {
    id: string,
    hostPort: THostPort,
    nodeName: string,
    cfg: TCfg[],
    in?: {},
    out?: {},
}

export interface TTaskList {
    [key: string]: TTask
}


export type TMessageType = 'log' | 'node-status'

export interface TMessage {
    type?: TMessageType;
    data?: any;
}

export type TState = 'run' | 'stop' | 'error';

export interface TStatus {
    state: TState;
    id: string;
    hostPort: THostPort;
}
