import fs from "fs";

export const writeToFile = (path: string, data: any) => {
    try {
        fs.writeFileSync(path, data);
        console.log(`Файл ${path} сохранен!`);
    } catch (err) {
        throw 'Ошибка записи файла: ' + path
    }
};


export const readFromFile = (path: string): any => {
    try {
        return fs.readFileSync(path);
    } catch (err) {
        throw 'Ошибка чтения файла: ' + path
    }
};