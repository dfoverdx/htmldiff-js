import 'mocha';
import {assert} from 'chai';

import {helloWorld} from '../index';
import npmPackage from '../index';

describe('NPM Package', () => {
    it('should be an object', () => {
        assert.isObject(npmPackage);
    });

    it('should have a helloWorld property', () => {
        assert.property(npmPackage, 'helloWorld');
    });
});

describe('helloWorld function', () => {
    it('should be a function', () => {
        assert.isFunction(helloWorld);
    });

    it('should return "Hello world" on call', () => {
        const expected = 'Hello world';
        assert.equal(helloWorld(), expected);
    });
});
