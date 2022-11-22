import {Mode} from './types';
import * as Utils from './Utils';

class WordSplitter {
    private static state = {
        mode: Mode.character,
        currentWord: [] as string[],
        words: [] as string[],
    };

    private static blockLocations: Map<number, number>;

    private static prepare() {
        this.state = {
            mode: Mode.character,
            currentWord: [],
            words: [],
        };
        this.blockLocations = new Map();
    }

    public static convertHtmlToListOfWords(
        text: string,
        blockExpressions: RegExp[] = []
    ) {
        this.prepare();
        this.findBlocks(text, blockExpressions);

        const isBlockCheckRequired = !!this.blockLocations.size;
        let isGrouping = false;
        let groupingUntil = -1;

        for (let idx = 0; idx < text.length; idx++) {
            var character = text[idx];

            // Don't bother executing block checks if we don't have any blocks to check for!
            if (isBlockCheckRequired) {
                // Check if we have completed grouping a text sequence/block
                if (groupingUntil === idx) {
                    groupingUntil = -1;
                    isGrouping = false;
                }

                // Check if we need to group the next text sequence/block
                if (this.blockLocations.has(idx)) {
                    isGrouping = true;
                    groupingUntil = this.blockLocations.get(idx) || 0;
                }

                // if we are grouping, then we don't care about what type of character we have, it's going to be treated as a word
                if (isGrouping) {
                    this.state.currentWord.push(character);
                    this.state.mode = Mode.character;
                    continue;
                }
            }

            switch (this.state.mode) {
                case Mode.character:
                    if (Utils.isStartOfTag(character)) {
                        this.addClearWordSwitchMode('<', Mode.tag);
                    } else if (Utils.isStartOfEntity(character)) {
                        this.addClearWordSwitchMode(character, Mode.entity);
                    } else if (Utils.isWhiteSpace(character)) {
                        this.addClearWordSwitchMode(character, Mode.whitespace);
                    } else if (Utils.isNumber(character)) {
                        this.addClearWordSwitchMode(character, Mode.number);
                    } else if (
                        Utils.isWord(character) &&
                        (this.state.currentWord.length === 0 ||
                            Utils.isWord(
                                this.state.currentWord[
                                    this.state.currentWord.length - 1
                                ]
                            ))
                    ) {
                        this.state.currentWord.push(character);
                    } else {
                        this.addClearWordSwitchMode(character, Mode.character);
                    }

                    break;

                case Mode.tag:
                    if (Utils.isEndOfTag(character)) {
                        this.state.currentWord.push(character);
                        this.state.words.push(this.state.currentWord.join(''));

                        this.state.currentWord = [];
                        this.state.mode = Utils.isWhiteSpace(character)
                            ? Mode.whitespace
                            : Mode.character;
                    } else {
                        this.state.currentWord.push(character);
                    }

                    break;

                case Mode.number:
                    this.state.words.push(this.state.currentWord.join(''));
                    this.state.currentWord = [];

                    if (Utils.isStartOfTag(character)) {
                        this.addClearWordSwitchMode(character, Mode.tag);
                    } else if (Utils.isStartOfEntity(character)) {
                        this.addClearWordSwitchMode(character, Mode.entity);
                    } else if (Utils.isNumber(character)) {
                        this.addClearWordSwitchMode(character, Mode.number);
                    } else if (Utils.isWhiteSpace(character)) {
                        this.state.currentWord.push(character);
                    } else {
                        this.addClearWordSwitchMode(character, Mode.character);
                    }

                    break;

                case Mode.whitespace:
                    if (Utils.isStartOfTag(character)) {
                        this.addClearWordSwitchMode(character, Mode.tag);
                    } else if (Utils.isStartOfEntity(character)) {
                        this.addClearWordSwitchMode(character, Mode.entity);
                    } else if (Utils.isNumber(character)) {
                        this.addClearWordSwitchMode(character, Mode.number);
                    } else if (Utils.isWhiteSpace(character)) {
                        this.state.currentWord.push(character);
                    } else {
                        this.addClearWordSwitchMode(character, Mode.character);
                    }

                    break;

                case Mode.entity:
                    if (Utils.isStartOfTag(character)) {
                        this.addClearWordSwitchMode(character, Mode.tag);
                    } else if (Utils.isNumber(character)) {
                        this.addClearWordSwitchMode(character, Mode.number);
                    } else if (Utils.isWhiteSpace(character)) {
                        this.addClearWordSwitchMode(character, Mode.whitespace);
                    } else if (Utils.isEndOfEntity(character)) {
                        let switchToNextMode = true;
                        if (this.state.currentWord.length !== 0) {
                            this.state.currentWord.push(character);
                            this.state.words.push(
                                this.state.currentWord.join('')
                            );

                            //join &nbsp; entity with last whitespace
                            if (
                                this.state.words.length > 2 &&
                                Utils.isWhiteSpace(
                                    this.state.words[
                                        this.state.words.length - 2
                                    ]
                                ) &&
                                Utils.isWhiteSpace(
                                    this.state.words[
                                        this.state.words.length - 1
                                    ]
                                )
                            ) {
                                let w1 =
                                    this.state.words[
                                        this.state.words.length - 2
                                    ];
                                let w2 =
                                    this.state.words[
                                        this.state.words.length - 1
                                    ];
                                this.state.words.splice(
                                    this.state.words.length - 2,
                                    2
                                );
                                this.state.currentWord = [
                                    ...(w1 + w2).split(''),
                                ];
                                this.state.mode = Mode.whitespace;
                                switchToNextMode = false;
                            }
                        }

                        if (switchToNextMode) {
                            this.state.currentWord = [];
                            this.state.mode = Mode.character;
                        }
                    } else if (Utils.isWord(character)) {
                        this.state.currentWord.push(character);
                    } else {
                        this.addClearWordSwitchMode(character, Mode.character);
                    }

                    break;
            }
        }

        if (this.state.currentWord.length !== 0) {
            this.state.words.push(this.state.currentWord.join(''));
        }

        return this.state.words;
    }

    private static addClearWordSwitchMode(character: string, mode: Mode) {
        if (this.state.currentWord.length !== 0) {
            this.state.words.push(this.state.currentWord.join(''));
        }

        this.state.currentWord = [character];
        this.state.mode = mode;
    }

    private static findBlocks(text: string, blockExpressions: RegExp[]) {
        for (let exp of blockExpressions) {
            let m;
            while ((m = exp.exec(text)) !== null) {
                if (this.blockLocations.has(m.index)) {
                    throw new Error(
                        'One or more block expressions result in a text sequence that overlaps. Current expression: ' +
                            exp.toString()
                    );
                }

                this.blockLocations.set(m.index, m.index + m[0].length);
            }
        }
    }
}

export default WordSplitter;
