export function camelToKebab(camelCaseString: string): string {
    return camelCaseString.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase()
}

// EventBus.dispatchEvent('evb-key', {event, combine, nodeFocus}))
class EventBus {
    private bus: HTMLElement;

    constructor() {
        this.bus = document.createElement('eventbus');
    }

    addEventListener(event, callback) {
        this.bus.addEventListener(event, e => callback(...e.detail));
    }

    removeEventListener(event, callback) {
        this.bus.removeEventListener(event, callback);
    }

    dispatchEvent(event, ...data) {
        this.bus.dispatchEvent(new CustomEvent(event, {detail: data}));
    }
}

//@ts-ignore
export const eventBus = window.EventBus = new EventBus;

export const toBase64 = (value: string) => window.btoa(encodeURI(encodeURIComponent(value)));
export const base64to = (value: string) => decodeURIComponent(decodeURI(window.atob(value)));

export const compressString = (value: string) => {
    return LZString.compressToBase64(value);
};
export const decompressString = (value: string) => {
    return LZString.decompressFromBase64(value);
};

export const compress = (string: string, encoding: string = "gzip"): Promise<ArrayBuffer> => {
    const byteArray: Uint8Array = new TextEncoder().encode(string);
    const cs: CompressionStream = new CompressionStream(<"deflate" | "deflate-raw" | "gzip">encoding);
    const writer = cs.writable.getWriter()
    writer.write(byteArray)
    writer.close()
    return new Response(cs.readable).arrayBuffer();
}

export const decompress = (byteArray: Uint8Array, encoding: string = "gzip"): Promise<string> => {
    const cs: DecompressionStream = new DecompressionStream(<"deflate" | "deflate-raw" | "gzip">encoding);
    const writer = cs.writable.getWriter()
    writer.write(byteArray)
    writer.close()
    return new Response(cs.readable).arrayBuffer().then((arrayBuffer: ArrayBuffer) => new TextDecoder().decode(arrayBuffer));
}

export const LZString = (function () {
    var f = String.fromCharCode;
    var keyStrBase64 = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
    var keyStrUriSafe = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+-$";
    var baseReverseDic = {};

    function getBaseValue(alphabet, character) {
        if (!baseReverseDic[alphabet]) {
            baseReverseDic[alphabet] = {};
            for (var i = 0; i < alphabet.length; i++) {
                baseReverseDic[alphabet][alphabet.charAt(i)] = i;
            }
        }
        return baseReverseDic[alphabet][character];
    }

    var LZString = {
        compressToBase64: function (input) {
            if (input == null) return "";
            var res = LZString._compress(input, 6, function (a) {
                return keyStrBase64.charAt(a);
            });
            switch (res.length % 4) { // To produce valid Base64
                default: // When could this happen ?
                case 0 :
                    return res;
                case 1 :
                    return res + "===";
                case 2 :
                    return res + "==";
                case 3 :
                    return res + "=";
            }
        },

        decompressFromBase64: function (input) {
            if (input == null) return "";
            if (input == "") return null;
            return LZString._decompress(input.length, 32, function (index) {
                return getBaseValue(keyStrBase64, input.charAt(index));
            });
        },

        compressToUTF16: function (input) {
            if (input == null) return "";
            return LZString._compress(input, 15, function (a) {
                return f(a + 32);
            }) + " ";
        },

        decompressFromUTF16: function (compressed) {
            if (compressed == null) return "";
            if (compressed == "") return null;
            return LZString._decompress(compressed.length, 16384, function (index) {
                return compressed.charCodeAt(index) - 32;
            });
        },

        //compress into uint8array (UCS-2 big endian format)
        compressToUint8Array: function (uncompressed) {
            var compressed = LZString.compress(uncompressed);
            var buf = new Uint8Array(compressed.length * 2); // 2 bytes per character

            for (var i = 0, TotalLen = compressed.length; i < TotalLen; i++) {
                var current_value = compressed.charCodeAt(i);
                buf[i * 2] = current_value >>> 8;
                buf[i * 2 + 1] = current_value % 256;
            }
            return buf;
        },

        //decompress from uint8array (UCS-2 big endian format)
        decompressFromUint8Array: function (compressed) {
            if (compressed === null || compressed === undefined) {
                return LZString.decompress(compressed);
            } else {
                var buf = new Array(compressed.length / 2); // 2 bytes per character
                for (var i = 0, TotalLen = buf.length; i < TotalLen; i++) {
                    buf[i] = compressed[i * 2] * 256 + compressed[i * 2 + 1];
                }

                var result = [];
                buf.forEach(function (c) {
                    result.push(f(c));
                });
                return LZString.decompress(result.join(''));

            }

        },


        //compress into a string that is already URI encoded
        compressToEncodedURIComponent: function (input) {
            if (input == null) return "";
            return LZString._compress(input, 6, function (a) {
                return keyStrUriSafe.charAt(a);
            });
        },

        //decompress from an output of compressToEncodedURIComponent
        decompressFromEncodedURIComponent: function (input) {
            if (input == null) return "";
            if (input == "") return null;
            input = input.replace(/ /g, "+");
            return LZString._decompress(input.length, 32, function (index) {
                return getBaseValue(keyStrUriSafe, input.charAt(index));
            });
        },

        compress: function (uncompressed) {
            return LZString._compress(uncompressed, 16, function (a) {
                return f(a);
            });
        },
        _compress: function (uncompressed, bitsPerChar, getCharFromInt) {
            if (uncompressed == null) return "";
            var i, value,
                context_dictionary = {},
                context_dictionaryToCreate = {},
                context_c = "",
                context_wc = "",
                context_w = "",
                context_enlargeIn = 2, // Compensate for the first entry which should not count
                context_dictSize = 3,
                context_numBits = 2,
                context_data = [],
                context_data_val = 0,
                context_data_position = 0,
                ii;

            for (ii = 0; ii < uncompressed.length; ii += 1) {
                context_c = uncompressed.charAt(ii);
                if (!Object.prototype.hasOwnProperty.call(context_dictionary, context_c)) {
                    context_dictionary[context_c] = context_dictSize++;
                    context_dictionaryToCreate[context_c] = true;
                }

                context_wc = context_w + context_c;
                if (Object.prototype.hasOwnProperty.call(context_dictionary, context_wc)) {
                    context_w = context_wc;
                } else {
                    if (Object.prototype.hasOwnProperty.call(context_dictionaryToCreate, context_w)) {
                        if (context_w.charCodeAt(0) < 256) {
                            for (i = 0; i < context_numBits; i++) {
                                context_data_val = (context_data_val << 1);
                                if (context_data_position == bitsPerChar - 1) {
                                    context_data_position = 0;
                                    context_data.push(getCharFromInt(context_data_val));
                                    context_data_val = 0;
                                } else {
                                    context_data_position++;
                                }
                            }
                            value = context_w.charCodeAt(0);
                            for (i = 0; i < 8; i++) {
                                context_data_val = (context_data_val << 1) | (value & 1);
                                if (context_data_position == bitsPerChar - 1) {
                                    context_data_position = 0;
                                    context_data.push(getCharFromInt(context_data_val));
                                    context_data_val = 0;
                                } else {
                                    context_data_position++;
                                }
                                value = value >> 1;
                            }
                        } else {
                            value = 1;
                            for (i = 0; i < context_numBits; i++) {
                                context_data_val = (context_data_val << 1) | value;
                                if (context_data_position == bitsPerChar - 1) {
                                    context_data_position = 0;
                                    context_data.push(getCharFromInt(context_data_val));
                                    context_data_val = 0;
                                } else {
                                    context_data_position++;
                                }
                                value = 0;
                            }
                            value = context_w.charCodeAt(0);
                            for (i = 0; i < 16; i++) {
                                context_data_val = (context_data_val << 1) | (value & 1);
                                if (context_data_position == bitsPerChar - 1) {
                                    context_data_position = 0;
                                    context_data.push(getCharFromInt(context_data_val));
                                    context_data_val = 0;
                                } else {
                                    context_data_position++;
                                }
                                value = value >> 1;
                            }
                        }
                        context_enlargeIn--;
                        if (context_enlargeIn == 0) {
                            context_enlargeIn = Math.pow(2, context_numBits);
                            context_numBits++;
                        }
                        delete context_dictionaryToCreate[context_w];
                    } else {
                        value = context_dictionary[context_w];
                        for (i = 0; i < context_numBits; i++) {
                            context_data_val = (context_data_val << 1) | (value & 1);
                            if (context_data_position == bitsPerChar - 1) {
                                context_data_position = 0;
                                context_data.push(getCharFromInt(context_data_val));
                                context_data_val = 0;
                            } else {
                                context_data_position++;
                            }
                            value = value >> 1;
                        }


                    }
                    context_enlargeIn--;
                    if (context_enlargeIn == 0) {
                        context_enlargeIn = Math.pow(2, context_numBits);
                        context_numBits++;
                    }
                    // Add wc to the dictionary.
                    context_dictionary[context_wc] = context_dictSize++;
                    context_w = String(context_c);
                }
            }

            // Output the code for w.
            if (context_w !== "") {
                if (Object.prototype.hasOwnProperty.call(context_dictionaryToCreate, context_w)) {
                    if (context_w.charCodeAt(0) < 256) {
                        for (i = 0; i < context_numBits; i++) {
                            context_data_val = (context_data_val << 1);
                            if (context_data_position == bitsPerChar - 1) {
                                context_data_position = 0;
                                context_data.push(getCharFromInt(context_data_val));
                                context_data_val = 0;
                            } else {
                                context_data_position++;
                            }
                        }
                        value = context_w.charCodeAt(0);
                        for (i = 0; i < 8; i++) {
                            context_data_val = (context_data_val << 1) | (value & 1);
                            if (context_data_position == bitsPerChar - 1) {
                                context_data_position = 0;
                                context_data.push(getCharFromInt(context_data_val));
                                context_data_val = 0;
                            } else {
                                context_data_position++;
                            }
                            value = value >> 1;
                        }
                    } else {
                        value = 1;
                        for (i = 0; i < context_numBits; i++) {
                            context_data_val = (context_data_val << 1) | value;
                            if (context_data_position == bitsPerChar - 1) {
                                context_data_position = 0;
                                context_data.push(getCharFromInt(context_data_val));
                                context_data_val = 0;
                            } else {
                                context_data_position++;
                            }
                            value = 0;
                        }
                        value = context_w.charCodeAt(0);
                        for (i = 0; i < 16; i++) {
                            context_data_val = (context_data_val << 1) | (value & 1);
                            if (context_data_position == bitsPerChar - 1) {
                                context_data_position = 0;
                                context_data.push(getCharFromInt(context_data_val));
                                context_data_val = 0;
                            } else {
                                context_data_position++;
                            }
                            value = value >> 1;
                        }
                    }
                    context_enlargeIn--;
                    if (context_enlargeIn == 0) {
                        context_enlargeIn = Math.pow(2, context_numBits);
                        context_numBits++;
                    }
                    delete context_dictionaryToCreate[context_w];
                } else {
                    value = context_dictionary[context_w];
                    for (i = 0; i < context_numBits; i++) {
                        context_data_val = (context_data_val << 1) | (value & 1);
                        if (context_data_position == bitsPerChar - 1) {
                            context_data_position = 0;
                            context_data.push(getCharFromInt(context_data_val));
                            context_data_val = 0;
                        } else {
                            context_data_position++;
                        }
                        value = value >> 1;
                    }


                }
                context_enlargeIn--;
                if (context_enlargeIn == 0) {
                    context_enlargeIn = Math.pow(2, context_numBits);
                    context_numBits++;
                }
            }

            // Mark the end of the stream
            value = 2;
            for (i = 0; i < context_numBits; i++) {
                context_data_val = (context_data_val << 1) | (value & 1);
                if (context_data_position == bitsPerChar - 1) {
                    context_data_position = 0;
                    context_data.push(getCharFromInt(context_data_val));
                    context_data_val = 0;
                } else {
                    context_data_position++;
                }
                value = value >> 1;
            }

            // Flush the last char
            while (true) {
                context_data_val = (context_data_val << 1);
                if (context_data_position == bitsPerChar - 1) {
                    context_data.push(getCharFromInt(context_data_val));
                    break;
                } else context_data_position++;
            }
            return context_data.join('');
        },

        decompress: function (compressed) {
            if (compressed == null) return "";
            if (compressed == "") return null;
            return LZString._decompress(compressed.length, 32768, function (index) {
                return compressed.charCodeAt(index);
            });
        },

        _decompress: function (length, resetValue, getNextValue) {
            var dictionary = [],
                next,
                enlargeIn = 4,
                dictSize = 4,
                numBits = 3,
                entry = "",
                result = [],
                i,
                w,
                bits, resb, maxpower, power,
                c,
                data = {val: getNextValue(0), position: resetValue, index: 1};

            for (i = 0; i < 3; i += 1) {
                dictionary[i] = i;
            }

            bits = 0;
            maxpower = Math.pow(2, 2);
            power = 1;
            while (power != maxpower) {
                resb = data.val & data.position;
                data.position >>= 1;
                if (data.position == 0) {
                    data.position = resetValue;
                    data.val = getNextValue(data.index++);
                }
                bits |= (resb > 0 ? 1 : 0) * power;
                power <<= 1;
            }

            switch (next = bits) {
                case 0:
                    bits = 0;
                    maxpower = Math.pow(2, 8);
                    power = 1;
                    while (power != maxpower) {
                        resb = data.val & data.position;
                        data.position >>= 1;
                        if (data.position == 0) {
                            data.position = resetValue;
                            data.val = getNextValue(data.index++);
                        }
                        bits |= (resb > 0 ? 1 : 0) * power;
                        power <<= 1;
                    }
                    c = f(bits);
                    break;
                case 1:
                    bits = 0;
                    maxpower = Math.pow(2, 16);
                    power = 1;
                    while (power != maxpower) {
                        resb = data.val & data.position;
                        data.position >>= 1;
                        if (data.position == 0) {
                            data.position = resetValue;
                            data.val = getNextValue(data.index++);
                        }
                        bits |= (resb > 0 ? 1 : 0) * power;
                        power <<= 1;
                    }
                    c = f(bits);
                    break;
                case 2:
                    return "";
            }
            dictionary[3] = c;
            w = c;
            result.push(c);
            while (true) {
                if (data.index > length) {
                    return "";
                }

                bits = 0;
                maxpower = Math.pow(2, numBits);
                power = 1;
                while (power != maxpower) {
                    resb = data.val & data.position;
                    data.position >>= 1;
                    if (data.position == 0) {
                        data.position = resetValue;
                        data.val = getNextValue(data.index++);
                    }
                    bits |= (resb > 0 ? 1 : 0) * power;
                    power <<= 1;
                }

                switch (c = bits) {
                    case 0:
                        bits = 0;
                        maxpower = Math.pow(2, 8);
                        power = 1;
                        while (power != maxpower) {
                            resb = data.val & data.position;
                            data.position >>= 1;
                            if (data.position == 0) {
                                data.position = resetValue;
                                data.val = getNextValue(data.index++);
                            }
                            bits |= (resb > 0 ? 1 : 0) * power;
                            power <<= 1;
                        }

                        dictionary[dictSize++] = f(bits);
                        c = dictSize - 1;
                        enlargeIn--;
                        break;
                    case 1:
                        bits = 0;
                        maxpower = Math.pow(2, 16);
                        power = 1;
                        while (power != maxpower) {
                            resb = data.val & data.position;
                            data.position >>= 1;
                            if (data.position == 0) {
                                data.position = resetValue;
                                data.val = getNextValue(data.index++);
                            }
                            bits |= (resb > 0 ? 1 : 0) * power;
                            power <<= 1;
                        }
                        dictionary[dictSize++] = f(bits);
                        c = dictSize - 1;
                        enlargeIn--;
                        break;
                    case 2:
                        return result.join('');
                }

                if (enlargeIn == 0) {
                    enlargeIn = Math.pow(2, numBits);
                    numBits++;
                }

                if (dictionary[c]) {
                    entry = dictionary[c];
                } else {
                    if (c === dictSize) {
                        entry = w + w.charAt(0);
                    } else {
                        return null;
                    }
                }
                result.push(entry);

                // Add w+entry[0] to the dictionary.
                dictionary[dictSize++] = w + entry.charAt(0);
                enlargeIn--;

                w = entry;

                if (enlargeIn == 0) {
                    enlargeIn = Math.pow(2, numBits);
                    numBits++;
                }

            }
        }
    };
    return LZString;
})();

//@ts-ignore
window.LZString = LZString;

//How to use
// const storage = new IndexedDBStorage('myDB', 'myStore');
// storage.set('myKey', 'myValue').then(() => {
//      storage.get('myKey').then(console.log);  // Выведет: 'myValue'
// });

export class IndexedDBStorage {
    private dbName: string;
    private storeName: string;

    constructor(dbName, storeName) {
        this.dbName = dbName;
        this.storeName = storeName;
    }

    async openDB() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.dbName);
            request.onerror = () => reject(request.error);
            request.onsuccess = () => resolve(request.result);
            request.onupgradeneeded = (event: any) => {
                const db = event.target.result;
                db.createObjectStore(this.storeName);
            };
        });
    }

    async get(key) {
        const db = await this.openDB();
        return new Promise((resolve, reject) => {
            //@ts-ignore
            const transaction = db.transaction(this.storeName, 'readonly');
            const store = transaction.objectStore(this.storeName);
            const request = store.get(key);
            request.onerror = () => reject(request.error);
            request.onsuccess = () => resolve(request.result);
        });
    }

    async set(key, value) {
        const db = await this.openDB();
        return new Promise((resolve, reject) => {
            //@ts-ignore
            const transaction = db.transaction(this.storeName, 'readwrite');
            const store = transaction.objectStore(this.storeName);
            const request = store.put(value, key);
            request.onerror = () => reject(request.error);
            request.onsuccess = () => resolve(request.result);
        });
    }
}

export function getCookie(name) {
    let matches = document.cookie.match(new RegExp(
        '(?:^|; )' + name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + '=([^;]*)'
    ));
    return matches ? decodeURIComponent(matches[1]) : undefined;
}

/**
 * Создает worker на лету:
 * // demo
 * const add = (...nums) => nums.reduce((a, b) => a + b);
 * // call
 * console.log('result: ', await add.callAsWorker(null, 1, 2, 3));
 *
 * @param args of function
 * @returns {Promise<unknown>}
 */
Function.prototype["callAsWorker"] = function (...args: any[]) {
    return new Promise((resolve, reject) => {
        const code = `self.onmessage = e => self.postMessage((${this.toString()}).call(...e.data));`;
        const blob = new Blob([code], {type: "text/javascript"});
        const worker = new Worker(window["URL"].createObjectURL(blob));
        worker.onmessage = e => (resolve(e.data), worker.terminate());
        worker.onerror = e => (reject(e.message), worker.terminate());
        worker.postMessage(args);
    });
}

let lastX = 0, lastY = 0, deltaX, deltaY;
document.addEventListener('mousemove', function (event) {
    deltaX = event.clientX - lastX;
    deltaY = event.clientY - lastY;
    // console.log(`Delta X: ${deltaX}, Delta Y: ${deltaY}`);
    lastX = event.clientX;
    lastY = event.clientY;
});

export let getDeltaMouseMove = () => ({0: deltaX, 1: deltaY, x: deltaX, y: deltaY});

export const lerp = (x, y, a) => x * (1 - a) + y * a;
export const clamp = (a, min = 0, max = 1) => Math.min(max, Math.max(min, a));
export const invlerp = (x, y, a) => clamp((a - x) / (y - x));
export const range = (a1, b1, a2, b2, val) => lerp(a2, b2, invlerp(a1, b1, val)); // range(0,20000, 0,100, 50) // 10000

export function saveTextAsFile(text, filename) {
    const blob = new Blob([text], {type: "text/plain;charset=utf-8"});
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.download = filename;
    link.href = url;
    link.click();
}

export async function loadBinary(url) {
    const resp = await fetch(url);
    return await resp.arrayBuffer();
}

export async function loadText(url) {
    const resp = await fetch(url);
    return await resp.text();
}

export async function loadJSON(url) {
    const resp = await fetch(url);
    return await resp.json();
}

export function utf8ToAscii(str) {
    //@ts-ignore
    const enc = new TextEncoder('utf-8');
    const u8s = enc.encode(str);

    return Array.from(u8s).map(v => String.fromCharCode(v)).join('');
}

export function saveUnitArrayAsFile(filename, encoded) {
    // var uriEncoded = encodeURIComponent(String.fromCharCode.apply(null, encoded));
    var hexStr = "";
    for (var i = 0; i < encoded.length; i++) {
        var s = encoded[i].toString(16);
        if (s.length == 1) s = '0' + s;
        hexStr += '%' + s;
    }
    var uriContent = 'data:application/octet-stream,' + hexStr;
    var pom = document.createElement('a');
    pom.setAttribute('href', uriContent);
    pom.setAttribute('download', filename);
    document.body.appendChild(pom);
    pom.click();
    document.body.removeChild(pom);
}

export const createTable = (cols, rows, clb, classTable) => {
    // Создаем div для таблицы
    let table = document.createElement('div');
    classTable && table.classList.add(classTable)
    table.style.display = 'table';

    for (var i = 0; i < rows; i++) {
        // Создаем div для строки
        var row = document.createElement('div');
        row.style.display = 'table-row';

        for (var j = 0; j < cols; j++) {
            var cell = document.createElement('div');
            cell.style.display = 'table-cell';
            clb({table, row, cell, x: i, y: j, index: i * cols + j});

            row.appendChild(cell);
        }
        table.appendChild(row);
    }
    return table;
}

export const setStyle = (strStyle, cssObjectID = generateUID('st')) => {
    let destNode = document.head;
    let node = destNode.querySelector('.' + cssObjectID);
    strStyle = strStyle.replaceAll(/[\r\n]| {2}/g, '')
    if (!node)
        destNode.append(getHtmlStr(`<style class='${cssObjectID}'>${strStyle}</style>`)[0]);
    else
        node.innerHTML = strStyle;

    return node;
}

export function getHtmlStr(html) {
    const template = document.createElement('template'), content = template.content;
    html = html.trim(); // Never return a text node of whitespace as the result
    template.innerHTML = html;
    return content.childNodes.length ? content.childNodes : [content.firstChild];
}

/**
 * Вызывает callback на каждй новой точке (Алгоритм Брезенхема)
 * @param x1
 * @param y1
 * @param x2
 * @param y2
 * @param callback(x,y)
 * @returns {*}
 */
export function getLinePoints(x1, y1, x2, y2, callback) {
    var dx = Math.abs(x2 - x1);
    var dy = Math.abs(y2 - y1);
    var sx = (x1 < x2) ? 1 : -1;
    var sy = (y1 < y2) ? 1 : -1;
    var err = dx - dy;

    while (true) {
        callback(x1, y1)

        if (x1 === x2 && y1 === y2) break;
        var e2 = 2 * err;
        if (e2 > -dy) {
            err -= dy;
            x1 += sx;
        }
        if (e2 < dx) {
            err += dx;
            y1 += sy;
        }
    }
}

const base64Language = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
const toShortString = (value, language = base64Language) => {
    const len = language.length;
    let acc = "";
    while (value > 0) {
        const index = value % len;
        acc += language.charAt(index);
        value /= len;
    }
    return acc.split('').reverse().join('').replace(/^0+/g, '');
};
let __id = 0;
export const generateUID = (pre = '') => pre + toShortString((new Date().getTime()) + Math.ceil(Math.random() * 100) + (__id++))

export const getHashCyrb53 = function (str, seed = 0) {
    let h1 = 0xdeadbeef ^ seed, h2 = 0x41c6ce57 ^ seed;
    for (let i = 0, ch; i < str.length; i++) {
        ch = str.charCodeAt(i);
        h1 = Math.imul(h1 ^ ch, 2654435761);
        h2 = Math.imul(h2 ^ ch, 1597334677);
    }
    h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507);
    h1 ^= Math.imul(h2 ^ (h2 >>> 13), 3266489909);
    h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507);
    h2 ^= Math.imul(h1 ^ (h1 >>> 13), 3266489909);

    return 4294967296 * (2097151 & h2) + (h1 >>> 0);
}

export const getHashCyrb53Arr = function (arr, seed = 0) {
    let h1 = 0xdeadbeef ^ seed, h2 = 0x41c6ce57 ^ seed;
    for (let i = 0, ch; i < arr.length; i++) {
        ch = arr[i];
        h1 = Math.imul(h1 ^ ch, 2654435761);
        h2 = Math.imul(h2 ^ ch, 1597334677);
    }
    h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507);
    h1 ^= Math.imul(h2 ^ (h2 >>> 13), 3266489909);
    h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507);
    h2 ^= Math.imul(h1 ^ (h1 >>> 13), 3266489909);

    return 4294967296 * (2097151 & h2) + (h1 >>> 0);
}

let revokes = new WeakMap();

export const removeProxy = function (obj) {
    let [originalObj, revoke] = revokes.get(obj);
    revoke();
    return originalObj;
}


export const onProxy = function (obj, clb) {
    const makeHandler = (path = '') => ({
        get(target, key) {
            return typeof target[key] === 'object' && target[key] !== null
                //@ts-ignore
                ? new Proxy(target[key], makeHandler(path + (Array.isArray(target) ? `[${key}]` : '.' + key)))
                //@ts-ignore
                : Reflect.get(...arguments);
            // return Reflect.get(...arguments);
        },
        set(target, key, val) {
            if (target[key] === val) return false;
            clb && clb(target, key, val, path);
            //@ts-ignore
            return Reflect.set(...arguments);
        }
    });

    let {proxy, revoke} = Proxy.revocable(obj, makeHandler());
    revokes.set(proxy, [obj, revoke]);
    return proxy;
}

export const isEmpty = obj => Object.keys(obj).length === 0;

export const meval = function (js, scope) {
    return new Function(`with (this) { return (${js}); }`).call(scope);
}

let __counter = 0;
export const getID = (): string => toShortString((new Date()).getTime() + __counter++)


export const isFunction = functionToCheck => functionToCheck && {}.toString.call(functionToCheck) === '[object Function]';

export const addYear = (y) => new Date(new Date().setFullYear(new Date().getFullYear() + y));
export const addMonth = (m) => new Date(new Date().setMonth(new Date().getMonth() + m));
export const addDay = (d) => new Date(new Date().setDate(new Date().getDate() + d));
export const addHour = (h) => new Date(new Date().setHours(new Date().getHours() + h));
export const addMinute = (m) => new Date(new Date().setMinutes(new Date().getMinutes() + m));
export const addSecond = (s) => new Date(new Date().setSeconds(new Date().getSeconds() + s));

const addZero = (numb) => numb < 10 ? '0' + numb : numb

export const formatTime = (date) => {
    let hh = addZero(date.getHours());
    let min = addZero(date.getMinutes());
    let ss = addZero(date.getSeconds());
    let fff = date.getMilliseconds();

    return `${hh}:${min}:${ss}${fff !== 0 ? '.' + fff : ''}`;
}

export const formatDate = (date) => {
    let dd = addZero(date.getDate());
    let mm = addZero(date.getMonth() + 1);
    let yyyy = date.getFullYear();

    return `${dd}.${mm}.${yyyy}`;
}
export const formatDateTime = (date = new Date(), dateTimeFormat = 'dd.mm.yyyy hh:MM:ss') => {

    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Месяцы начинаются с 0
    const year = date.getFullYear();

    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');

    const formatMap = {
        'dd': day,
        'mm': month,
        'yyyy': year,
        'hh': hours,
        'MM': minutes,
        'ss': seconds
    };

    return dateTimeFormat.replace(/dd|mm|yyyy|hh|MM|ss/g, match => formatMap[match]);
}


export const getRandomRange = (min, max, fix = 2) => {
    return (Math.random() * (max - min) + min).toFixed(fix);
}

/**
 * Wrapper для функции (clb), которая будет вызвана не раньше чем через ms мс. после
 * последнего вызова если в момент тишины с момента последнего вызова будет произведен
 * еще вызов то реальный вызов будет не раньше чем через ms мс. после него
 * @param clb
 * @param ms
 * @returns {(function(): void)|*}
 */
export const debounce = (func, ms) => {
    let timeout;
    return function () {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, arguments), ms);
    };
};

/**
 * Wrapper для функции (clb), которую нельзя вызвать чаще чем tm
 * @param clb
 * @param ms
 * @returns {(function(...[*]): void)|*}
 */
export const throttle = (clb, ms) => {

    let isThrottled = false,
        savedArgs,
        savedThis;

    function wrapper(...arg: any) {

        if (isThrottled) { // (2)
            savedArgs = arguments;
            savedThis = this;
            return;
        }

        clb.apply(this, arguments); // (1)

        isThrottled = true;

        setTimeout(function () {
            isThrottled = false; // (3)
            if (savedArgs) {
                wrapper.apply(savedThis, savedArgs);
                savedArgs = savedThis = null;
            }
        }, ms);
    }

    return wrapper;
}


export const sendRequest = async (req) => await fetch(req);
export const sendRequestJSON = async (strData) => {
    try {
        let data = await fetch(strData);
        const obj = await data.json();
        return obj;
    } catch (e) {
        console.log(e);
    }
}

export function sendPostReq(method, data, clb) {
    const request = new XMLHttpRequest();
    request.open('POST', '/rpc');
    request.send(JSON.stringify({method, data}));
    request.onload = () => clb(request.response);
}

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

export type ContentType =
    | 'text/plain'
    | 'text/html'
    | 'application/json'
    | 'multipart/form-data'
    | 'application/x-www-form-urlencoded'
    | 'application/octet-stream'

export interface ApiRequestOptions {
    method?: HttpMethod;
    body?: any; // Можно уточнить тип в зависимости от ожидаемого формата
    headers?: Record<string, string>;
    contentType?: ContentType; // Добавляем поле для Content-Type
}

export async function apiRequest<T>(
    url: string,
    {method = 'GET', body = null, headers = {}, contentType}: ApiRequestOptions = {}
): Promise<T> {

    const options: RequestInit = ({
        method, headers: new Headers({...(contentType ? {'Content-Type': contentType} : {}), ...headers,}),
    } as RequestInit);

    if (body) {
        switch (contentType) {
            case 'text/plain':
            case 'text/html':
            case 'application/octet-stream':
                options.body = body;
                break;
            case 'application/json':
            case 'multipart/form-data':
            case 'application/x-www-form-urlencoded':
                options.body = JSON.stringify(body);
                break;
            default:
                options.body = JSON.stringify(body);
        }

    }

    try {
        const response = await fetch(url, options);

        if (!response.ok) throw new Error(`Error: ${response.status} ${response.statusText}`);

        const data: T = await response.json();
        return data;
    } catch (error) {
        console.error('API request error:', error);
        throw error; // Пробрасываем ошибку дальше
    }
}