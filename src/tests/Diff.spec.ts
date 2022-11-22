import Diff from '../Diff';

describe('WordSplitter', () => {
    it('findMatch`', () => {
        const diff = Diff.execute('this is old text', 'this is new staff');
        console.log(diff);
    });
});
