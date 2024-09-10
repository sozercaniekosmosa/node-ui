import {config} from "dotenv";
import {getDataFromArrayPath, getDirectories, readData, writeData} from "../../../utils";
import zlib, {InputType} from "node:zlib"
import * as Buffer from "buffer";

const {parsed: {MAX_MESSAGE_TASK, TIME_MESSAGE_CYCLE}} = config();


export async function decompressGzip(buffer: Buffer): Promise<Buffer> {
    try {
        return new Promise((resolve, reject) => zlib.gunzip(<InputType>buffer, (err, result) => err ? reject(err) : resolve(result)));
    } catch (error) {
        throw error;
    }
}


export const getComponents = async () => {
    let arrDir = await getDirectories('./nodes/');
    // writeFileAsync(pathResolveRoot('./database/dirNamesPlugins.json'), JSON.stringify(arrDir))
    let arrPath = arrDir.map(dir => './nodes/' + dir + '/config.json');
    let arrFile = await getDataFromArrayPath(arrPath);
    let arrData = arrFile.map(file => JSON.parse(file.content));
    return arrData;
};