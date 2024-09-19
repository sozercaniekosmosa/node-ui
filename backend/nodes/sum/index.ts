// In src/index.js
import Node from "../action/Node";

let a = 0, b = 0;
const update = (task, data) => {
    a = data?.a ?? a;
    b = data?.b ?? b;
    return a + b;
};

await Node(update)