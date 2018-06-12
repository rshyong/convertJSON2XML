'use strict';

const expect = require('chai').expect;
const convertJSON2XML = require('../lib');
let jsonToXML;

describe('jsonToXML', () => {
  jsonToXML = convertJSON2XML();
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
        c: {},
        d: [ 'alpha', 3, [ 4, 5, 6 ], { test: 1, undefined: null, }, undefined, null, [], ],
        e: undefined,
        f: null,
        g: { '@': { attribute: 'value', }, json: 'xml', },
        h: { '@': { animal: true, }, _: 'partOfG', },
        i: '',
      });
      expect(xml).to.be.equal('<?xml version="1.0" encoding="UTF-8"?>\n\t<root>\n\t\t<a>1</a>\n\t\t<b></b>\n\t\t<c></c>\n\t\t<d>alpha</d>\n\t\t<d>3</d>\n\t\t<d>\n\t\t\t<0>4</0>\n\t\t\t<1>5</1>\n\t\t\t<2>6</2>\n\t\t</d>\n\t\t<d>\n\t\t\t<test>1</test>\n\t\t\t<undefined null="true"/>\n\t\t</d>\n\t\t<d undefined="true"/>\n\t\t<d null="true"/>\n\t\t<d></d>\n\t\t<e undefined="true"/>\n\t\t<f null="true"/>\n\t\t<g attribute=\'value\'>\n\t\t\t<json>xml</json>\n\t\t</g>\n\t\t<h animal=\'true\'>partOfG</h>\n\t\t<i/>\n\t</root>');
    });
  });
  describe('is configurable', () => {
    beforeEach(() => {
      convertJSON2XML.clear();
    });
    it('changing root tag', () => {
      jsonToXML = convertJSON2XML({
        rootTag: 'changedRoot',
      });
      let xml = jsonToXML({
        a: 1
      });
      expect(xml).to.be.equal('<?xml version="1.0" encoding="UTF-8"?>\n\t<changedRoot>\n\t\t<a>1</a>\n\t</changedRoot>');
    });
  });
});