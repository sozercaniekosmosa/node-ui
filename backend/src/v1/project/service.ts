import {readFromFile, writeToFile} from "../../utils";

import {resolve} from "path";

const pathRoot = process.cwd();
const pathProject = resolve(pathRoot, 'database', 'project');


const getProject = (): any => {
    try {
        return readFromFile(pathProject);
    } catch (error) {
        throw error;
    }
};

const updateProject = (data: any): any => {
    try {
        return writeToFile(pathProject, data);
    } catch (error) {
        throw error;
    }
};

export default {
    getProject,
    updateProject
};