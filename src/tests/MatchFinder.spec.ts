import MatchFinder from '../MatchFinder';
import MatchOptions from '../MatchOptions';

describe('WordSplitter', () => {
    it('findMatch`', () => {
        const finder = new MatchFinder({
            oldWords: ['word', 'another', 'blob'],
            newWords: ['word', 'year', 'hello'],
            startInOld: 0,
            endInOld: 3,
            startInNew: 0,
            endInNew: 3,
            options: {
                blockSize: 3,
                ignoreWhitespaceDifferences: false,
                repeatingWordsAccuracy: 1.0,
            },
        });

        const match = finder.findMatch();
        console.log(match);
    });
});
