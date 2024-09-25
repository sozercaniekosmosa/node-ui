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

export type TCfg = { [key: string]: [any, string] };

export interface TTask {
    id: string,
    hostPort: THostPort,
    nodeName: string,
    cfg: TCfg,
    in?: {},
    out?: {},
}

export interface TTaskList {
    [key: string]: TTask
}


export type TMessageType = 'log' | 'node-status' | 'node-log' | 'server-init' | 'list-run'

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

export interface TRunningList {
    [key: string]: TStatus;
}

export interface TChangeProps {
    name: any;
    val: any;
    title: any;
    key: any;
    onChange: (name, val) => void;
    node: any;
}

export interface TInitData {
    task: TTask;
    hosts: THost
}

export interface TCallback {
    (task: TTask, data: { [key: string]: any }): any
}