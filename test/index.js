'use strict';

const expect = require('chai').expect;
const jsonToXML = require('../lib');

describe('jsonToXML', () => {
  describe('should return an error if:', () => {
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
    it('input is an invalid object', () => {
      let invalidInput = jsonToXML('{{"test": 1 }');
      expect(invalidInput).to.be.instanceOf(Error);
      expect(invalidInput.message).to.be.equal('invalid JSON format');
    });
  });
  describe('should return an xml if:', () => {
    it('input is valid', () => {
      let xml = jsonToXML({
        a: 1,
        b: [],
        c: [ 'alpha', 3, [ 4, 5, 6 ], { test: 1, undefined: null, }, undefined, null, [], ],
        d: undefined,
        e: null,
      });
      expect(xml).to.be.equal('<?xml version="1.0" encoding="UTF-8"?> <root> <a>1</a> <b></b> <c>alpha</c> <c>3</c> <c> <0>4</0> <1>5</1> <2>6</2></c> <c> <test>1</test> <undefined null="true"/></c> <c undefined="true"/> <c null="true"/> <c></c> <d undefined="true"/> <e null="true"/></root>');
    });
  });
});