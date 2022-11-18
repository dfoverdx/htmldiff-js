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
            console.log(WordSplitter.convertHtmlToListOfWords(string));
            expect(WordSplitter.convertHtmlToListOfWords(string)).toEqual(
                expect.arrayContaining(expectedWords)
            );
        });

        it('returns spaces', () => {
            const string = 'this is words'; // 2 spaces
            const expectedWords = [' ', ' '];
            console.log(WordSplitter.convertHtmlToListOfWords(string));
            expect(WordSplitter.convertHtmlToListOfWords(string)).toEqual(
                expect.arrayContaining(expectedWords)
            );
        });

        it('returns elements in original order', () => {
            const string = 'this is words';
            const expectedWords = ['this', ' ', 'is', ' ', 'words'];
            console.log(WordSplitter.convertHtmlToListOfWords(string));
            expect(WordSplitter.convertHtmlToListOfWords(string)).toEqual(
                expect.arrayContaining(expectedWords)
            );
        });

        it('returns punctuation', () => {
            const string = 'text; words.?,';
            const expectedWords = [';', '.', '?', ','];
            console.log(WordSplitter.convertHtmlToListOfWords(string));
            expect(WordSplitter.convertHtmlToListOfWords(string)).toEqual(
                expect.arrayContaining(expectedWords)
            );
        });

        it('returns opening and closing tags', () => {
            const string = '<tag>some text </tag>';
            const expectedWords = ['<tag>', '</tag>'];
            console.log(WordSplitter.convertHtmlToListOfWords(string));
            expect(WordSplitter.convertHtmlToListOfWords(string)).toEqual(
                expect.arrayContaining(expectedWords)
            );
        });

        it('returns singletone tags', () => {
            const string = '<audio /> <video /> ';
            const expectedWords = ['<audio />', '<video />'];
            console.log(WordSplitter.convertHtmlToListOfWords(string));
            expect(WordSplitter.convertHtmlToListOfWords(string)).toEqual(
                expect.arrayContaining(expectedWords)
            );
        });

        it('returns tags with atributes ', () => {
            const string = '<tag atribute="value1" >some text </tag>';
            const expectedWords = ['<tag atribute="value1" >', '</tag>'];
            console.log(WordSplitter.convertHtmlToListOfWords(string));

            expect(WordSplitter.convertHtmlToListOfWords(string)).toEqual(
                expect.arrayContaining(expectedWords)
            );

            const hardString =
                '<tag style="font-weight: 500; @font-face:"Roboto";" >some text </tag>';
            const expectedWords2 = [
                '<tag style="font-weight: 500; @font-face:"Roboto";" >',
                '</tag>',
            ];
            console.log(WordSplitter.convertHtmlToListOfWords(hardString));

            expect(WordSplitter.convertHtmlToListOfWords(hardString)).toEqual(
                expect.arrayContaining(expectedWords2)
            );
        });

        // it('returns broken tags and normal ones', () => {
        //     const string = '<tag <tag2> </tag3> ';
        //     const expectedWords = ['<tag2>', '</tag3>'];
        //     console.log(WordSplitter.convertHtmlToListOfWords(string));
        //     expect(WordSplitter.convertHtmlToListOfWords(string)).toEqual(
        //         expect.arrayContaining(expectedWords)
        //     );
        // });

        it('returns entities ', () => {
            const string = '@entity1; @entity2';
            const expectedWords = ['@entity1', '@entity2'];
            console.log(WordSplitter.convertHtmlToListOfWords(string));
            expect(WordSplitter.convertHtmlToListOfWords(string)).toEqual(
                expect.arrayContaining(expectedWords)
            );
        });

        it('returns entities with right borders (delimiter - ";")', () => {
            const string = '@entity1;notEntityPart';
            const expectedWords = ['@entity1'];
            console.log(WordSplitter.convertHtmlToListOfWords(string));
            expect(WordSplitter.convertHtmlToListOfWords(string)).toEqual(
                expect.arrayContaining(expectedWords)
            );
        });
    });
});
