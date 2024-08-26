import fs, {promises as fsPromises} from "fs";
import path from "path";

// export const writeToFile = (path: string, data: any) => {
//     try {
//         fs.writeFileSync(path, data);
//         console.log(`Файл ${path} сохранен!`);
//     } catch (err) {
//         throw 'Ошибка записи файла: ' + path
//     }
// };
//
//
// export const readFromFile = (path: string): any => {
//     try {
//         return fs.readFileSync(path);
//     } catch (err) {
//         throw 'Ошибка чтения файла: ' + path
//     }
// };

export const readFileAsync = async (path: string, options?): Promise<any> => {
    try {
        const data = await fsPromises.readFile(path, options);
        return data;
    } catch (err) {
        throw 'Ошибка чтения файла: ' + path
    }
};

export const writeFileAsync = async (path: string, data: any): Promise<any> => {
    try {
        await fsPromises.writeFile(path, data);
    } catch (err) {
        throw 'Ошибка записи файла: ' + path
    }
};

export async function getDirectories(srcPath: string) {
    const files = await fsPromises.readdir(srcPath);
    const directories = [];
    try {
        for (const file of files) {
            const filePath = path.join(srcPath, file);
            const stat = await fsPromises.stat(filePath);
            if (stat.isDirectory()) {
                directories.push(file);
            }
        }
    } catch (error) {
        console.error(`Ошибка при получении директорий ${srcPath}: ${error.message}`);
    }
    return directories;
}

export async function getDataFromArrayPath(arrPaths: string[]) {
    const filesContent = [];

    for (const p of arrPaths) {
        try {
            const stat = await fsPromises.stat(p);
            if (stat.isFile()) {
                const content = await readFileAsync(p, 'utf-8'); // Чтение содержимого файла
                filesContent.push({path: p, content}); // Сохраняем путь и содержимое
            } else if (stat.isDirectory()) {
                // Если это директория, получаем все файлы внутри
                const dirFiles = await fsPromises.readdir(p);
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