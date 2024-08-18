import {readFromFile, writeToFile} from "../../utils";

import {resolve} from "path";

const pathRoot = process.cwd();
const pathDB = resolve(pathRoot, 'database', 'project.db');


const getProject = (): any => {
    try {
        return readFromFile(pathDB);
    } catch (error) {
        throw error;
    }
};

const updateProject = (data: any): any => {
    try {
        return writeToFile(pathDB, data);
    } catch (error) {
        throw error;
    }
};

export default {
    getProject,
    updateProject
};