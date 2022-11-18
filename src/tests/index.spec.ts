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
