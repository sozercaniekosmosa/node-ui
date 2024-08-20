import {readFromFile, writeToFile} from "../../utils";
import zlib from "node:zlib"

import {resolve} from "path";
import * as Buffer from "buffer";
import {InputType} from "zlib";

const pathRoot = process.cwd();
const pathHandling = (path: string) => resolve(pathRoot, ...path.split(/\\|\//));

export async function decompressGzip(buffer: Buffer): Promise<Buffer> {
    try {
        return new Promise((resolve, reject) => zlib.gunzip(<InputType>buffer, (err, result) => err ? reject(err) : resolve(result)));
    } catch (error) {
        throw error;
    }
}

export const readData = (path: string): any => {
    try {
        return readFromFile(pathHandling(path));
    } catch (error) {
        throw error;
    }
};

export const writeData = (path: string, data: any): any => {
    try {
        writeToFile(pathHandling(path), data);
    } catch (error) {
        throw error;
    }
};