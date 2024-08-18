import fs from "fs";

export const writeToFile = (path: string, data: any) => {
    try {
        fs.writeFileSync(path, data);
        console.log(`Файл ${path} сохранен!`);
    } catch (err) {
        console.error('Ошибка при записи файла:', err);
    }
};


export const readFromFile = (path: string): any => {
    return fs.readFileSync(path);
};