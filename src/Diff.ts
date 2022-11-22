import {Action} from './types';
import Match from './Match';
import MatchFinder from './MatchFinder';
import Operation from './Operation';
import MatchOptions from './MatchOptions';
import WordSplitter from './WordSplitter';
import * as Utils from './Utils';

// This value defines balance between speed and memory utilization. The higher it is the faster it works and more memory consumes.
const MatchGranuarityMaximum = 4;

const specialCaseClosingTags = new Map([
    ['</strong>', 0],
    ['</em>', 0],
    ['</b>', 0],
    ['</i>', 0],
    ['</big>', 0],
    ['</small>', 0],
    ['</u>', 0],
    ['</sub>', 0],
    ['</strike>', 0],
    ['</s>', 0],
    ['</dfn>', 0],
]);

const specialCaseOpeningTagRegex =
    /<((strong)|(b)|(i)|(dfn)|(em)|(big)|(small)|(u)|(sub)|(sup)|(strike)|(s))[\>\s]+/gi;

type FindMathProps = {
    startInOld: number;
    endInOld: number;
    startInNew: number;
    endInNew: number;
};

class HtmlDiff {
    private content: string[];
    private newText: string;
    private oldText: string;

    private specialTagDiffStack: string[];
    private newWords: string[];
    private oldWords: string[];

    private matchGranularity: number;
    private blockExpressions: RegExp[];

    private repeatingWordsAccuracy: number;
    private ignoreWhiteSpaceDifferences: boolean;
    private orphanMatchThreshold: number;

    constructor(oldText: string, newText: string) {
        this.content = [];
        this.newText = newText;
        this.oldText = oldText;

        this.specialTagDiffStack = [];
        this.newWords = [];
        this.oldWords = [];
        this.matchGranularity = 0;
        this.blockExpressions = [];

        this.repeatingWordsAccuracy = 1.0;
        this.ignoreWhiteSpaceDifferences = false;
        this.orphanMatchThreshold = 0.0;
    }

    public static execute(oldText: string, newText: string) {
        return new HtmlDiff(oldText, newText).build();
    }

    build() {
        if (this.oldText === this.newText) {
            return this.newText;
        }

        this.splitInputsIntoWords();

        this.matchGranularity = Math.min(
            MatchGranuarityMaximum,
            this.oldWords.length,
            this.newWords.length
        );
        let operations = this.operations();

        for (let item of operations) {
            this.performOperation(item);
        }

        return this.content.join('');
    }

    addBlockExpression(exp: RegExp) {
        this.blockExpressions.push(exp);
    }

    splitInputsIntoWords() {
        this.oldWords = WordSplitter.convertHtmlToListOfWords(
            this.oldText,
            this.blockExpressions
        );

        //free memory, allow it for GC
        this.oldText = '';

        this.newWords = WordSplitter.convertHtmlToListOfWords(
            this.newText,
            this.blockExpressions
        );

        //free memory, allow it for GC
        this.newText = '';
    }

    performOperation(opp: Operation) {
        switch (opp.action) {
            case Action.equal:
                this.processEqualOperation(opp);
                break;
            case Action.delete:
                this.processDeleteOperation(opp, 'diffdel');
                break;
            case Action.insert:
                this.processInsertOperation(opp, 'diffins');
                break;
            case Action.none:
                break;
            case Action.replace:
                this.processReplaceOperation(opp);
                break;
        }
    }

    processReplaceOperation(opp: Operation) {
        this.processDeleteOperation(opp, 'diffmod');
        this.processInsertOperation(opp, 'diffmod');
    }

    processInsertOperation(opp: Operation, cssClass: string) {
        let text = this.newWords.filter(
            (s, pos) => pos >= opp.startInNew && pos < opp.endInNew
        );
        this.insertTag('ins', cssClass, text);
    }

    processDeleteOperation(opp: Operation, cssClass: string) {
        let text = this.oldWords.filter(
            (s, pos) => pos >= opp.startInOld && pos < opp.endInOld
        );
        this.insertTag('del', cssClass, text);
    }

    processEqualOperation(opp: Operation) {
        let result = this.newWords.filter(
            (s, pos) => pos >= opp.startInNew && pos < opp.endInNew
        );
        this.content.push(result.join(''));
    }

    insertTag(tag: string, cssClass: string, words: string[]) {
        while (words.length) {
            let nonTags = this.extractConsecutiveWords(
                words,
                x => !Utils.isTag(x)
            );

            let specialCaseTagInjection = '';
            let specialCaseTagInjectionIsbefore = false;

            if (nonTags.length !== 0) {
                let text = Utils.wrapText(nonTags.join(''), tag, cssClass);
                this.content.push(text);
            } else {
                if (specialCaseOpeningTagRegex.test(words[0])) {
                    let matchedTag = words[0].match(specialCaseOpeningTagRegex);
                    if (matchedTag) {
                        const result =
                            '<' + matchedTag[0].replace(/(<|>| )/g, '') + '>';
                        this.specialTagDiffStack.push(result);
                    }
                    specialCaseTagInjection = '<ins class="mod">';
                    if (tag === 'del') {
                        words.shift();

                        while (
                            words.length > 0 &&
                            specialCaseOpeningTagRegex.test(words[0])
                        ) {
                            words.shift();
                        }
                    }
                } else if (specialCaseClosingTags.has(words[0])) {
                    let openingTag =
                        this.specialTagDiffStack.length === 0
                            ? null
                            : this.specialTagDiffStack.pop();

                    if (
                        !(
                            openingTag === null ||
                            openingTag !== words[0].replace(/\//g, '')
                        )
                    ) {
                        specialCaseTagInjection = '</ins>';
                        specialCaseTagInjectionIsbefore = true;
                    }

                    if (tag === 'del') {
                        words.shift();

                        while (
                            words.length > 0 &&
                            specialCaseClosingTags.has(words[0])
                        ) {
                            words.shift();
                        }
                    }
                }

                if (
                    words.length === 0 &&
                    specialCaseTagInjection.length === 0
                ) {
                    break;
                }

                if (specialCaseTagInjectionIsbefore) {
                    this.content.push(
                        specialCaseTagInjection +
                            this.extractConsecutiveWords(
                                words,
                                Utils.isTag
                            ).join('')
                    );
                } else {
                    this.content.push(
                        this.extractConsecutiveWords(words, Utils.isTag).join(
                            ''
                        ) + specialCaseTagInjection
                    );
                }
            }
        }
    }

    extractConsecutiveWords(
        words: string[],
        condition: (word: string) => boolean
    ) {
        let indexOfFirstTag: number | null = null;

        for (let i = 0; i < words.length; i++) {
            let word = words[i];

            if (i === 0 && word === ' ') {
                words[i] = '&nbsp;';
            }

            if (!condition(word)) {
                indexOfFirstTag = i;
                break;
            }
        }

        if (indexOfFirstTag !== null) {
            let items = words.filter(
                (_s, pos) => pos >= 0 && pos < (indexOfFirstTag || 0)
            );
            if (indexOfFirstTag > 0) {
                words.splice(0, indexOfFirstTag);
            }

            return items;
        } else {
            let items = words.filter(
                (_s, pos) => pos >= 0 && pos < words.length
            );
            words.splice(0, words.length);
            return items;
        }
    }

    operations() {
        let positionInOld = 0;
        let positionInNew = 0;
        let operations: Operation[] = [];

        let matches = this.matchingBlocks();
        matches.push(new Match(this.oldWords.length, this.newWords.length, 0));

        let matchesWithoutOrphans = this.removeOrphans(matches);

        for (let match of matchesWithoutOrphans) {
            let matchStartsAtCurrentPositionInOld =
                positionInOld === match.startInOld;
            let matchStartsAtCurrentPositionInNew =
                positionInNew === match.startInNew;

            let action;

            if (
                !matchStartsAtCurrentPositionInOld &&
                !matchStartsAtCurrentPositionInNew
            ) {
                action = Action.replace;
            } else if (
                matchStartsAtCurrentPositionInOld &&
                !matchStartsAtCurrentPositionInNew
            ) {
                action = Action.insert;
            } else if (!matchStartsAtCurrentPositionInOld) {
                action = Action.delete;
            } else {
                action = Action.none;
            }

            if (action !== Action.none) {
                operations.push(
                    new Operation({
                        action,
                        startInOld: positionInOld,
                        endInOld: match.startInOld,
                        startInNew: positionInNew,
                        endInNew: match.startInNew,
                    })
                );
            }

            if (match.size !== 0) {
                operations.push(
                    new Operation({
                        action: Action.equal,
                        startInOld: match.startInOld,
                        endInOld: match.endInOld,
                        startInNew: match.startInNew,
                        endInNew: match.endInNew,
                    })
                );
            }

            positionInOld = match.endInOld;
            positionInNew = match.endInNew;
        }

        return operations;
    }

    *removeOrphans(matches: Match[]) {
        let prev = null! as Match;
        let curr = null! as Match;

        for (let next of matches) {
            if (curr === null) {
                prev = new Match(0, 0, 0);
                curr = next;
                continue;
            }

            if (
                (prev?.endInOld === curr.startInOld &&
                    prev.endInNew === curr.startInNew) ||
                (curr.endInOld === next.startInOld &&
                    curr.endInNew === next.startInNew)
            ) {
                yield curr;
                curr = next;
                continue;
            }

            let sumLength = (t: number, n: string) => t + n.length;

            let oldDistanceInChars = this.oldWords
                .slice(prev?.endInOld, next.startInOld)
                .reduce(sumLength, 0);
            let newDistanceInChars = this.newWords
                .slice(prev?.endInNew, next.startInNew)
                .reduce(sumLength, 0);
            let currMatchLengthInChars = this.newWords
                .slice(curr.startInNew, curr.endInNew)
                .reduce(sumLength, 0);
            if (
                currMatchLengthInChars >
                Math.max(oldDistanceInChars, newDistanceInChars) *
                    this.orphanMatchThreshold
            ) {
                yield curr;
            }

            prev = curr;
            curr = next;
        }

        yield curr;
    }

    matchingBlocks() {
        let matchingBlocks = [] as Match[];
        this.findMatchingBlocks({
            startInOld: 0,
            endInOld: this.oldWords.length,
            startInNew: 0,
            endInNew: this.newWords.length,
            matchingBlocks,
        });
        return matchingBlocks;
    }

    findMatchingBlocks({
        startInOld,
        endInOld,
        startInNew,
        endInNew,
        matchingBlocks,
    }: FindMathProps & {matchingBlocks: Match[]}) {
        let match = this.findMatch({
            startInOld,
            endInOld,
            startInNew,
            endInNew,
        });

        if (match !== null) {
            if (
                startInOld < match.startInOld &&
                startInNew < match.startInNew
            ) {
                this.findMatchingBlocks({
                    startInOld,
                    endInOld: match.startInOld,
                    startInNew,
                    endInNew: match.startInNew,
                    matchingBlocks,
                });
            }

            matchingBlocks.push(match);

            if (match.endInOld < endInOld && match.endInNew < endInNew) {
                this.findMatchingBlocks({
                    startInOld: match.endInOld,
                    endInOld,
                    startInNew: match.endInNew,
                    endInNew,
                    matchingBlocks,
                });
            }
        }
    }

    findMatch({startInOld, endInOld, startInNew, endInNew}: FindMathProps) {
        for (let i = this.matchGranularity; i > 0; i--) {
            let options = MatchOptions;
            options.blockSize = i;
            options.repeatingWordsAccuracy = this.repeatingWordsAccuracy;
            options.ignoreWhitespaceDifferences =
                this.ignoreWhiteSpaceDifferences;

            let finder = new MatchFinder({
                oldWords: this.oldWords,
                newWords: this.newWords,
                startInOld,
                endInOld,
                startInNew,
                endInNew,
                options,
            });
            let match = finder.findMatch();
            if (match !== null) {
                return match;
            }
        }

        return null;
    }
}

export default HtmlDiff;
