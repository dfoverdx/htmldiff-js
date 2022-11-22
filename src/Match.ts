export default class Match {
    startInOld: number;
    startInNew: number;
    size: number;

    constructor(startInOld: number, startInNew: number, size: number) {
        this.startInOld = startInOld;
        this.startInNew = startInNew;
        this.size = size;
    }

    get endInOld() {
        return this.startInOld + this.size;
    }

    get endInNew() {
        return this.startInNew + this.size;
    }
}
