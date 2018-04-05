'use strict';

/**
 * Formats XML string to include newline characters and tabs
 * @param {string} str Input string in xml format
 * @return {string} Output string that includes newline characters and tabs
 */
function formatXML(str) {
  let tags = [];
  let beginning = 0;
  //grab all the tags
  for (let i = 0; i < str.length; i++ ) {
    if (str[i] === '<') {
      beginning = i;
    }
    if (str[i] === '>') {
      tags.push(str.substring(beginning, i) + '>');
      beginning = i + 1;
    }
  }
  //grab all the tags with values that should go on one line
  let values = {};
  tags.forEach((curr, ind) => {
    if (tags[ind + 1] && curr.substring(1) === tags[ind + 1].substring(2) ) {
      let closingTag = `</${curr.substring(1)}`;
      values[curr] = (`${str.substring(str.indexOf(curr), str.indexOf(closingTag))}${closingTag}`);
    }
  });
  // combine tags and values array
  let formatted = [];
  let j = 0;
  while (j < tags.length) {
    if (values[tags[j]]) {
      formatted.push(values[tags[j]]);
      j += 2;
    } else {
      formatted.push(tags[j]);
      j++;
    }
  }
  let tabs = '';
  let prev = '';
  formatted = formatted.map((line, ind, orgArr) => {
    if (ind !== 0 && !values[ line.substring(0, line.indexOf('>') + 1) ]) {
      if (line.indexOf('</') === -1 && !values[prev]) {
        tabs += '\t';
      }
    } else if (values[ line.substring(0, line.indexOf('>') + 1) ] && !values[ prev ] && prev.indexOf('</') === -1) {
      tabs += '\t';
    }
    if (line.substring(0, 2) === '</') {
      tabs = tabs.slice(1);
    }
    prev = line.substring(0, line.indexOf('>') + 1);
    return tabs + line;
  });
  return formatted.join('\n');
}

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

module.exports = (input, header = true) => {
  let unformattedXML = jsonToXML(input, header);
  if (unformattedXML instanceof Error) return unformattedXML;
  else return formatXML(jsonToXML(input, header));
};