import WordSplitter from '../WordSplitter';

describe('WordSplitter', () => {
    it('has `convertHtmlToListOfWords()`', () => {
        expect(typeof WordSplitter.convertHtmlToListOfWords).toBe('function');
    });

    describe('convertHtmlToListOfWords', () => {
        it('accept string as first parameter and returns array', () => {
            expect(
                Array.isArray(WordSplitter.convertHtmlToListOfWords(''))
            ).toBe(true);
        });

        it('returns words', () => {
            const string = 'this is words';
            const expectedWords = ['this', 'is', 'words'];
            expect(WordSplitter.convertHtmlToListOfWords(string)).toEqual(
                expect.arrayContaining(expectedWords)
            );
        });

        it('devide numbers', () => {
            const string = '12345';
            const expectedWords = ['1', '2', '3', '4', '5'];
            expect(WordSplitter.convertHtmlToListOfWords(string)).toEqual(
                expect.arrayContaining(expectedWords)
            );
        });

        it('numbers and tags', () => {
            const string = '12345<img src="123" />';
            const expectedWords = [
                '1',
                '2',
                '3',
                '4',
                '5',
                '<img src="123" />',
            ];
            expect(WordSplitter.convertHtmlToListOfWords(string)).toEqual(
                expect.arrayContaining(expectedWords)
            );
        });

        it('numbers and entities', () => {
            const string = '123@entity';
            const expectedWords = ['1', '2', '3', '@entity'];
            expect(WordSplitter.convertHtmlToListOfWords(string)).toEqual(
                expect.arrayContaining(expectedWords)
            );
        });

        it('numbers and characters and whitespaces', () => {
            const string = '123[] 123 ';
            const expectedWords = [
                '1',
                '2',
                '3',
                ' ',
                '[',
                ']',
                ' ',
                '1',
                '2',
                '3',
                ' ',
            ];
            expect(WordSplitter.convertHtmlToListOfWords(string)).toEqual(
                expect.arrayContaining(expectedWords)
            );
        });

        it('returns spaces', () => {
            const string = 'this is words'; // 2 spaces
            const expectedWords = [' ', ' '];
            expect(WordSplitter.convertHtmlToListOfWords(string)).toEqual(
                expect.arrayContaining(expectedWords)
            );
        });

        it('returns elements in original order', () => {
            const string = 'this is words';
            const expectedWords = ['this', ' ', 'is', ' ', 'words'];
            expect(WordSplitter.convertHtmlToListOfWords(string)).toEqual(
                expect.arrayContaining(expectedWords)
            );
        });

        it('returns punctuation', () => {
            const string = 'text; words.?,';
            const expectedWords = [';', '.', '?', ','];
            expect(WordSplitter.convertHtmlToListOfWords(string)).toEqual(
                expect.arrayContaining(expectedWords)
            );
        });

        it('returns characters', () => {
            const string = '[text]';
            const expectedWords = ['[', 'text', ']'];
            expect(WordSplitter.convertHtmlToListOfWords(string)).toEqual(
                expect.arrayContaining(expectedWords)
            );
        });

        it('returns opening and closing tags', () => {
            const string = '<tag>some text </tag>';
            const expectedWords = ['<tag>', '</tag>'];
            expect(WordSplitter.convertHtmlToListOfWords(string)).toEqual(
                expect.arrayContaining(expectedWords)
            );
        });

        it('returns singletone tags', () => {
            const string = '<audio /> <video /> ';
            const expectedWords = ['<audio />', '<video />'];
            expect(WordSplitter.convertHtmlToListOfWords(string)).toEqual(
                expect.arrayContaining(expectedWords)
            );
        });

        it('returns tags with atributes ', () => {
            const string = '<tag atribute="value1" >some text </tag>';
            const expectedWords = ['<tag atribute="value1" >', '</tag>'];

            expect(WordSplitter.convertHtmlToListOfWords(string)).toEqual(
                expect.arrayContaining(expectedWords)
            );

            const hardString =
                '<tag style="font-weight: 500; @font-face:"Roboto";" >some text </tag>';
            const expectedWords2 = [
                '<tag style="font-weight: 500; @font-face:"Roboto";" >',
                '</tag>',
            ];

            expect(WordSplitter.convertHtmlToListOfWords(hardString)).toEqual(
                expect.arrayContaining(expectedWords2)
            );
        });

        it('returns entities ', () => {
            const string = '@entity; @otherentity';
            const expectedWords = ['@entity', '@otherentity'];
            expect(WordSplitter.convertHtmlToListOfWords(string)).toEqual(
                expect.arrayContaining(expectedWords)
            );
        });

        it('returns entities with right borders (delimiter - ";")', () => {
            const string = '@entity;notEntityPart';
            const expectedWords = ['@entity'];
            expect(WordSplitter.convertHtmlToListOfWords(string)).toEqual(
                expect.arrayContaining(expectedWords)
            );
        });

        it('works with blockExpressions', () => {
            const stringWithDate = '19.02.2022 and other words';
            const blockExp = /\d\d.\d\d.\d\d\d\d/gm;
            const expectedDates = ['19.02.2022'];
            expect(
                WordSplitter.convertHtmlToListOfWords(stringWithDate, [
                    blockExp,
                ])
            ).toEqual(expect.arrayContaining(expectedDates));
        });
    });
});
