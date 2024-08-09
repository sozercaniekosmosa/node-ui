export class History {

    history = [];
    indexHistory = -1;

    constructor() {

        window['undoHistory'] = this.undoHistory;
        window['redoHistory'] = this.redoHistory;
        window['addHistory'] = this.addHistory;
    }

    initHistory(data) {
        this.history.push(['init', data]);
        this.indexHistory = this.history.length - 1;
    }

    undoHistory() {
        if (this.indexHistory <= 0) return null;
        this.indexHistory--;
        return this.history[this.indexHistory][1];
    }

    redoHistory() {
        if (this.history.length && this.indexHistory + 1 >= this.history.length) return null;
        this.indexHistory++;
        return this.history[this.indexHistory][1];
    }

    addHistory(name, data?) {
        if (this.indexHistory + 1 < this.history.length) this.history = this.history.splice(0, this.indexHistory + 1)
        this.history.push([name, data]);
        this.indexHistory = this.history.length - 1;
        // console.log('add:', this.history)
    }

}