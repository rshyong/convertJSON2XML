'use strict';

const expect = require('chai').expect;
const convertJSON2XML = require('../lib');

describe('jsonToXML', () => {
  let singleton = convertJSON2XML.singleton();
  describe('should return an error if:', () => {
    it('input is a string', () => {
      let stringInput = singleton('this is a string');
      expect(stringInput).to.be.instanceOf(Error);
      expect(stringInput.message).to.be.equal('invalid JSON format');
    });
    it('input is an array', () => {
      let arrayInput = singleton([ 1, 2, 3 ]);
      expect(arrayInput).to.be.instanceOf(Error);
      expect(arrayInput.message).to.be.equal('invalid JSON format');
    });
    it('input is null or undefined', () => {
      let nullInput = singleton(null);
      let undefinedInput = singleton(undefined);
      expect(nullInput).to.be.instanceOf(Error);
      expect(undefinedInput).to.be.instanceOf(Error);
      expect(nullInput.message).to.be.equal('invalid JSON format');
      expect(undefinedInput.message).to.be.equal('invalid JSON format');
    });
    it('input is an invalid object', () => {
      let invalidInput = singleton('{{"test": 1 }');
      expect(invalidInput).to.be.instanceOf(Error);
      expect(invalidInput.message).to.be.equal('invalid JSON format');
    });
  });
  describe('should return an xml if:', () => {
    it('input is valid', () => {
      let xml = singleton({
        a: 1,
        b: [],
        c: {},
        d: [ 'alpha ', 3, [ 4, 5, 6 ], { test: 1, undefined: null, }, undefined, null, [], ],
        e: undefined,
        f: null,
        g: { '@': { attribute: 'value ', }, json: ' xml ', },
        h: { '@': { ' animal': true, }, _: ' partOfH', },
        i: '',
        j: ' ',
      });
      expect(xml).to.be.equal('<?xml version="1.0" encoding="UTF-8"?>\n\t<root>\n\t\t<a>1</a>\n\t\t<b></b>\n\t\t<c></c>\n\t\t<d>alpha </d>\n\t\t<d>3</d>\n\t\t<d>\n\t\t\t<0>4</0>\n\t\t\t<1>5</1>\n\t\t\t<2>6</2>\n\t\t</d>\n\t\t<d>\n\t\t\t<test>1</test>\n\t\t\t<undefined null="true"/>\n\t\t</d>\n\t\t<d undefined="true"/>\n\t\t<d null="true"/>\n\t\t<d></d>\n\t\t<e undefined="true"/>\n\t\t<f null="true"/>\n\t\t<g attribute=\'value \'>\n\t\t\t<json> xml </json>\n\t\t</g>\n\t\t<h  animal=\'true\'> partOfH</h>\n\t\t<i/>\n\t\t<j> </j>\n\t</root>');
    });
  });
  describe('configurations:', () => {
    it('change root tag', () => {
      let instance = convertJSON2XML.config({
        rootTag: 'changedRoot',
      });
      let xml = instance({
        a: 1
      });
      expect(xml).to.be.equal('<?xml version="1.0" encoding="UTF-8"?>\n\t<changedRoot>\n\t\t<a>1</a>\n\t</changedRoot>');
    });
    it('trim contents', () => {
      let instance = convertJSON2XML.config({
        trim: true,
      });
      let xml = instance({
        a: [ 'alpha ', 3, [ 4, 5, 6 ], { test: 1, undefined: null, }, undefined, null, [], ],
        b: { '@': { attribute: 'value ', }, json: ' xml ', },
        c: { '@': { ' animal': true, }, _: ' partOfC', },
        d: '',
        e: ' ',
        f: ' hi '
      });
      expect(xml).to.be.equal('<?xml version="1.0" encoding="UTF-8"?>\n\t<root>\n\t\t<a>alpha</a>\n\t\t<a>3</a>\n\t\t<a>\n\t\t\t<0>4</0>\n\t\t\t<1>5</1>\n\t\t\t<2>6</2>\n\t\t</a>\n\t\t<a>\n\t\t\t<test>1</test>\n\t\t\t<undefined null="true"/>\n\t\t</a>\n\t\t<a undefined="true"/>\n\t\t<a null="true"/>\n\t\t<a></a>\n\t\t<b attribute=\'value\'>\n\t\t\t<json>xml</json>\n\t\t</b>\n\t\t<c animal=\'true\'>partOfC</c>\n\t\t<d/>\n\t\t<e/>\n\t\t<f>hi</f>\n\t</root>');
    });
    it('trim and show empty strings', () => {
      let instance = convertJSON2XML.config({
        trim: true,
        emptyStringTag: 'full',
      });
      let xml = instance({
        a: '',
        b: ' '
      });
      expect(xml).to.be.equal('<?xml version="1.0" encoding="UTF-8"?>\n\t<root>\n\t\t<a></a>\n\t\t<b></b>\n\t</root>');
    });
    it('full null tags', () => {
      let instance = convertJSON2XML.config({
        trim: true,
        nullValueTag: 'full',
      });
      let xml = instance({
        a: null,
      });
      expect(xml).to.be.equal('<?xml version="1.0" encoding="UTF-8"?>\n\t<root>\n\t\t<a></a>\n\t</root>');
    });
    it('hide undefined tags', () => {
      let instance = convertJSON2XML.config({
        trim: true,
        hideUndefinedTag: true,
      });
      let xml = instance({
        a: 'null',
        b: undefined,
      });
      expect(xml).to.be.equal('<?xml version="1.0" encoding="UTF-8"?>\n\t<root>\n\t\t<a>null</a>\n\t</root>');
    });
    it('configurations all turned on', () => {
      let instance = convertJSON2XML.config({
        trim: true,
        hideUndefinedTag: true,
        nullValueTag: 'full',
        emptyStringTag: 'full',
      });
      let xml = instance({
        a: null,
        b: undefined,
        c: '',
        d: ' ',
        e: [],
        f: {},
      });
      expect(xml).to.be.equal('<?xml version="1.0" encoding="UTF-8"?>\n\t<root>\n\t\t<a></a>\n\t\t<c></c>\n\t\t<d></d>\n\t\t<e></e>\n\t\t<f></f>\n\t</root>');
    });
  });
});