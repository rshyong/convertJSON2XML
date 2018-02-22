'use strict';

/**
 * Converts json object to xml
 * @param {Object} json JSON object
 * @param {Boolean} header Determines whether to add root tags. Defaults to true
 * @returns {Object} returns XML
 */
function jsonToXML(json, header = true) {
  let obj;
  if (typeof json === 'string') {
    try {
      obj = JSON.parse(json);
    } catch (e) {
      return new Error('invalid JSON format', e);
    }
  } else if (typeof json === 'object' && !Array.isArray(json) && [undefined, null].indexOf(json) === -1) {
    obj = json;
  } else {
    return new Error('invalid JSON format');
  }
  return Object.keys(obj).reduce((acc, curr, i) => {
    if (header && i === 0) acc += '<?xml version="1.0" encoding="UTF-8"?> <root>';
    if (typeof obj[ curr ] === 'object' && !(obj[curr] instanceof Date) && !Array.isArray(obj[curr]) && [undefined, null, ].indexOf(obj[curr]) === -1) {
      acc += ` <${curr}>${jsonToXML(obj[ curr ], false)}</${curr}>`;
    } else if (Array.isArray(obj[ curr ]) && obj[curr].length) {
      obj[ curr ].forEach((ele) => {
        acc += ` <${curr}>${jsonToXML(ele, false)}</${curr}>`;
      });
    } else if ([undefined, null, ].indexOf(obj[curr]) !== -1) {
      acc += ` <${curr} ${obj[curr]}="true"/>`;
    } else {
      acc += ` <${curr}>${obj[ curr ]}</${curr}>`;
    }
    if (header && i === Object.keys(obj).length - 1) acc += '</root>';
    return acc;
  }, '');
}

module.exports = jsonToXML;