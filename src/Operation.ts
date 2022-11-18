import Action from './Action';

export default class Operation {
    public action: typeof Action;
    public startInOld: number;
    public endInOld: number;
    public startInNew: number;
    public endInNew: number;

    constructor(action, startInOld, endInOld, startInNew, endInNew) {
        this.action = action;
        this.startInOld = startInOld;
        this.endInOld = endInOld;
        this.startInNew = startInNew;
        this.endInNew = endInNew;
    }
}
