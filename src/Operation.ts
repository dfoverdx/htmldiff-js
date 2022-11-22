import {Action} from './types';

type Props = {
    action: Action;
    startInOld: number;
    endInOld: number;
    startInNew: number;
    endInNew: number;
};

export default class Operation {
    public action: Action;
    public startInOld: number;
    public endInOld: number;
    public startInNew: number;
    public endInNew: number;

    constructor({action, startInOld, endInOld, startInNew, endInNew}: Props) {
        this.action = action;
        this.startInOld = startInOld;
        this.endInOld = endInOld;
        this.startInNew = startInNew;
        this.endInNew = endInNew;
    }
}
