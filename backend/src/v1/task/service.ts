import {readFromFile, writeToFile} from "../../utils";

import {resolve} from "path";

const pathRoot = process.cwd();
const pathTask = resolve(pathRoot, 'database', 'task.json');


const updateTask = (data: any): any => {
    try {
        return writeToFile(pathTask, JSON.stringify(data, null, 2));
    } catch (error) {
        throw error;
    }
};

export default {
    updateTask
};