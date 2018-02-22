'use strict';

const expect = require('chai').expect;
const jsonToXML = require('../lib');

describe('jsonToXML', () => {
  describe('should return an error if', () => {
    it('input is a string', () => {
      let stringInput = jsonToXML('this is a string');
      expect(stringInput).to.be.instanceOf(Error);
      expect(stringInput.message).to.be.equal('invalid JSON format');
    });
    it('input is an array', () => {
      let arrayInput = jsonToXML([ 1, 2, 3 ]);
      expect(arrayInput).to.be.instanceOf(Error);
      expect(arrayInput.message).to.be.equal('invalid JSON format');
    });
    it('input is null or undefined', () => {
      let nullInput = jsonToXML(null);
      let undefinedInput = jsonToXML(undefined);
      expect(nullInput).to.be.instanceOf(Error);
      expect(undefinedInput).to.be.instanceOf(Error);
      expect(nullInput.message).to.be.equal('invalid JSON format');
      expect(undefinedInput.message).to.be.equal('invalid JSON format');
    });
  });
});