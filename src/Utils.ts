const tagRegex = /^\s*<\/?[^>]+>\s*$/;
const tagWordRegex = /<[^\s>]+/;
const whitespaceRegex = /^(\s|&nbsp;)+$/;
const wordRegex = /[\w\#@]+/;

const specialCaseWordTags = ['<img'];

function isTag(item: string) {
    if (specialCaseWordTags.some(re => item !== null && item.startsWith(re))) {
        return false;
    }

    return tagRegex.test(item);
}

function stripTagAttributes(word: string) {
    let tags = tagWordRegex.exec(word) || [''];
    word = tags[0] + (word.endsWith('/>') ? '/>' : '>');
    return word;
}

function wrapText(text: string, tagName: string, cssClass: string) {
    return [
        '<',
        tagName,
        ' class="',
        cssClass,
        '">',
        text,
        '</',
        tagName,
        '>',
    ].join('');
}

function isStartOfTag(val: string) {
    return val === '<';
}

function isEndOfTag(val: string) {
    return val === '>';
}

function isStartOfEntity(val: string) {
    return val === '&';
}

function isEndOfEntity(val: string) {
    return val === ';';
}

function isWhiteSpace(value: string) {
    return whitespaceRegex.test(value);
}

function stripAnyAttributes(word: string) {
    if (isTag(word)) {
        return stripTagAttributes(word);
    }

    return word;
}

function isNumber(text: string) {
    return /^\d$/.test(text);
}

function isWord(text: string) {
    return wordRegex.test(text);
}

export {
    isTag,
    stripTagAttributes,
    wrapText,
    isStartOfTag,
    isEndOfTag,
    isStartOfEntity,
    isEndOfEntity,
    isWhiteSpace,
    stripAnyAttributes,
    isWord,
    isNumber,
};
