'use strict';

/**
 * Converts json object to xml
 * @param {*} input Input
 * @param {Boolean} header Determines whether to add root tags. Defaults to true
 * @returns {Object} returns XML
 */
function jsonToXML(input, header = true) {
  let obj;
  if (header && typeof input === 'string') {
    try {
      obj = JSON.parse(input);
    } catch (e) {
      return new Error('invalid JSON format', e);
    }
  } else if (header && typeof input === 'object' && !Array.isArray(input) && [undefined, null].indexOf(input) === -1) {
    obj = input;
  } else if (header) {
    return new Error('invalid JSON format');
  } else {
    obj = input;
  }

  if (typeof obj === 'object'  && !(obj instanceof Date) && [undefined, null, ].indexOf(obj) === -1) {
    return Object.keys(obj).reduce((acc, curr, i) => {
      if (header && i === 0) acc += '<?xml version="1.0" encoding="UTF-8"?> <root>';
      if (typeof obj[ curr ] === 'object' && !(obj[curr] instanceof Date) && !Array.isArray(obj[curr]) && [undefined, null, ].indexOf(obj[curr]) === -1) {
        acc += ` <${curr}>${jsonToXML(obj[ curr ], false)}</${curr}>`;
      } else if (Array.isArray(obj[ curr ]) && obj[curr].length) {
        obj[ curr ].forEach((ele) => {
          if ([ undefined, null, ].indexOf(ele) !== -1) {
            acc += ` <${curr} ${ele}="true"/>`;
          } else {
            acc += ` <${curr}>${jsonToXML(ele, false)}</${curr}>`;
          }
        });
      } else if ([undefined, null, ].indexOf(obj[curr]) !== -1) {
        acc += ` <${curr} ${obj[curr]}="true"/>`;
      } else {
        acc += ` <${curr}>${obj[ curr ]}</${curr}>`;
      }
      if (header && i === Object.keys(obj).length - 1) acc += '</root>';
      return acc;
    }, '');
  } else {
    return obj;
  }
}

module.exports = jsonToXML;