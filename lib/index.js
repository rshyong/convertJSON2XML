'use strict';

let rootTag;

/**
 * Converts json object to xml
 * @param {*} input Input
 * @param {Boolean} xmlHeader Determines whether to add the xml header tag. Defaults to true
 * @param {Boolean} header Determines whether to add root tags. Defaults to true
 * @returns {Object} returns XML
 */
function jsonToXML(input, xmlHeader = true, header = true, tabs = '') {
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

  if (typeof obj === 'object' && !(obj instanceof Date) && [ undefined, null, ].indexOf(obj) === -1) {
    return Object.keys(obj).reduce((acc, curr, i) => {
      if (xmlHeader && i === 0) {
        acc += '<?xml version="1.0" encoding="UTF-8"?>\n';
        tabs += '\t';
      }
      if (header && i === 0) {
        acc += `${tabs}<${rootTag}>\n`;
        tabs += '\t';
      }
      if (curr === '@') {
        let attributes = obj[ curr ];
        acc += '__@' + ' ' + Object.keys(attributes).reduce((acc, curr) => {
          acc.push(`${curr}='${attributes[ curr ]}'`)
          return acc;
        }, []).join(' ') + '>\n';
      } else {
        if (typeof obj[ curr ] === 'object' && !(obj[ curr ] instanceof Date) && !Array.isArray(obj[ curr ]) && [ undefined, null, ].indexOf(obj[ curr ]) === -1) {
          if (Object.values(obj[ curr ]).length) acc += `${tabs}<${curr}>\n${jsonToXML(obj[ curr ], false, false, tabs + '\t')}${tabs}</${curr}>\n`;
          else {
            // empty object
            acc += `${tabs}<${curr}></${curr}>\n`;
          }
        } else if (Array.isArray(obj[ curr ]) && obj[ curr ].length) {
          obj[ curr ].forEach((ele) => {
            if ([ undefined, null, ].indexOf(ele) !== -1) {
              acc += `${tabs}<${curr} ${ele}="true"/>\n`;
            } else {
              if (typeof ele === 'object' && Object.values(ele).length) acc += `${tabs}<${curr}>\n${jsonToXML(ele, false, false, tabs + '\t')}${tabs}</${curr}>\n`;
              else if (typeof ele === 'object') acc += `${tabs}<${curr}></${curr}>\n`;
              else acc += `${tabs}<${curr}>${jsonToXML(ele, false, false, tabs + '\t')}</${curr}>\n`;
            }
          });
        } else if ([ undefined, null, ].indexOf(obj[ curr ]) !== -1) {
          acc += `${tabs}<${curr} ${obj[curr]}="true"/>\n`;
        } else if ([ '', ].indexOf(obj[ curr ]) !== -1) {
          acc += `${tabs}<${curr}/>\n`
        } else if (curr === '_') {
          acc += `<${curr}>${obj[ curr ]}</${curr}>`;
        } else {
          acc += `${tabs}<${curr}>${obj[ curr ]}</${curr}>\n`;
        }
      }
      if (header && i === Object.keys(obj).length - 1) {
        tabs = tabs.slice(0, -1);
        acc += `${tabs}</${rootTag}>`;
      }
      return acc;
    }, '').replace(/>\n__@|\n<_>|<\/_>\t+/g, '');
  } else {
    return obj;
  }
}

module.exports = (input, userRootTag, xmlHeader = true) => {
  rootTag = userRootTag || 'root';
  return jsonToXML(input, xmlHeader);
};