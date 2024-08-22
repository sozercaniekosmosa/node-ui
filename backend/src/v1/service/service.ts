import {readFromFile, writeToFile} from "../../utils";
import zlib from "node:zlib"
import path, {resolve} from "path";
import * as Buffer from "buffer";
import {InputType} from "zlib";
import {promises as fs} from "fs";

const pathRoot = process.cwd();

const pathHandling = (path: string) => resolve(pathRoot, ...path.split(/\\|\//));


export async function getDirectories(srcPath: string) {
    const files = await fs.readdir(srcPath);
    const directories = [];
    try {
        for (const file of files) {
            const filePath = path.join(srcPath, file);
            const stat = await fs.stat(filePath);
            if (stat.isDirectory()) {
                directories.push(file);
            }
        }
    } catch (error) {
        console.error(`Ошибка при получении директорий ${srcPath}: ${error.message}`);
    }
    return directories;
}

export async function getDataFromArrayPath(arrPaths) {
    const filesContent = [];

    for (const p of arrPaths) {
        try {
            const stat = await fs.stat(p);
            if (stat.isFile()) {
                const content = await fs.readFile(p, 'utf-8'); // Чтение содержимого файла
                filesContent.push({path: p, content}); // Сохраняем путь и содержимое
            } else if (stat.isDirectory()) {
                // Если это директория, получаем все файлы внутри
                const dirFiles = await fs.readdir(p);
                const fullPaths = dirFiles.map(file => path.join(p, file));
                const nestedContent = await getDataFromArrayPath(fullPaths); // Рекурсивно получаем содержимое файлов из поддиректорий
                filesContent.push(...nestedContent);
            }
        } catch (error) {
            console.error(`Ошибка при обработке пути ${p}: ${error.message}`);
        }
    }

    return filesContent;
}

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