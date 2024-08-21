import {defineConfig} from 'vite'
import react from '@vitejs/plugin-react-swc'

import {fileURLToPath} from "node:url";

const filesNeedToExclude = ["../nodes/sum/index.tsx", "../nodes/value/index.tsx"];

const filesPathToExclude = filesNeedToExclude.map((src) => {
    debugger
    return fileURLToPath(new URL(src, import.meta.url));
});

debugger
console.log(import.meta.url)

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [react()],
})
