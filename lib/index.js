'use strict';

let rootTag;

/**
 * Formats XML string to include newline characters and tabs
 * @param {String} str Input string in xml format
 * @param {Boolean} xmlHeader Determines whether to add the xml header tag. Defaults to true
 * @param {Boolean} header Boolean indicating whether to include header
 * @param {String} tabs Tabs string
 * @return {string} Output string that includes newline characters and tabs
 */
function formatXML(str, xmlHeader, header = false, tabs) {
  let startIndex = str.indexOf(`<${rootTag}`) === -1 ? 0 : str.indexOf(`<${rootTag}`);
  let endIndex = str.indexOf(`</${rootTag}>`) === -1 ? str.length : str.indexOf(`</${rootTag}>`) + rootTag.length + 3;
  let modStr = str.slice(startIndex, endIndex);
  let formattedXML = xmlHeader ? `<?xml version="1.0" encoding="UTF-8"?>` : '';
  let openingTag = '', tagValue = '';
  tabs = xmlHeader ? '\t' : tabs || '';
  let appendToXML;
  for (let i = 0; i < modStr.length + 1; i++) {
    appendToXML = true;
    if (!openingTag || openingTag.slice(-1) !== '>') {
      openingTag += modStr[ i ];
      if (openingTag.slice(-2) === '/>') {
        formattedXML += formattedXML !== ''
          ? '\n' + tabs + openingTag + tagValue 
          : tabs + openingTag + tagValue;
        openingTag = '';
        tagValue = '';
      }
      appendToXML = false;
    } else if (!tagValue || !tagValue.includes(`</${openingTag.slice(1, openingTag.indexOf(' '))}>`)) {
      tagValue += modStr[ i ];
      appendToXML = false;
    }
    if (appendToXML) {
      //remove outer tags
      let innerTagValue = tagValue.slice(0, (openingTag.slice(1, openingTag.indexOf(' ')).length + 3) * -1);
      if (formatXML(innerTagValue)) {
        formattedXML += formattedXML
          ? '\n' + tabs + openingTag + '\n' + formatXML(innerTagValue, false, false, tabs + '\t') + '\n' + tabs + '</' + openingTag.slice(1, openingTag.indexOf(' ')) + '>'
          : tabs + openingTag + '\n' + formatXML(innerTagValue, false, false, tabs + '\t') + '\n' + tabs + '</' + openingTag.slice(1, openingTag.indexOf(' ')) + '>';
        openingTag = modStr[i];
        tagValue = '';
      } else {
        formattedXML += formattedXML
          ? '\n' + tabs + openingTag + tagValue
          : tabs + openingTag + tagValue;
        openingTag = modStr[i];
        tagValue = '';
      }
    }
  }
  tabs = tabs.slice(-1);
  return formattedXML;
}

/**
 * Converts json object to xml
 * @param {*} input Input
 * @param {Boolean} xmlHeader Determines whether to add the xml header tag. Defaults to true
 * @param {Boolean} header Determines whether to add root tags. Defaults to true
 * @returns {Object} returns XML
 */
function jsonToXML(input, xmlHeader = true, header = true) {
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
      if (xmlHeader && i === 0) acc += '<?xml version="1.0" encoding="UTF-8"?>';
      if (header && i === 0) acc += `<${rootTag}>`;
      if (curr === '@') {
        let attributes = obj[ curr ];
        acc += '__@' + ' ' + Object.keys(attributes).reduce((acc, curr) => {
          acc.push(`${curr}='${attributes[ curr ]}'`)
          return acc;
        }, []).join(' ') + '>';
      } else {
        if (typeof obj[ curr ] === 'object' && !(obj[ curr ] instanceof Date) && !Array.isArray(obj[ curr ]) && [ undefined, null, ].indexOf(obj[ curr ]) === -1) {
          acc += `<${curr}>${jsonToXML(obj[ curr ], false, false)}</${curr}>`;
        } else if (Array.isArray(obj[ curr ]) && obj[curr].length) {
          obj[ curr ].forEach((ele) => {
            if ([ undefined, null, ].indexOf(ele) !== -1) {
              acc += `<${curr} ${ele}="true"/>`;
            } else {
              acc += `<${curr}>${jsonToXML(ele, false, false)}</${curr}>`;
            }
          });
        } else if ([undefined, null, ].indexOf(obj[curr]) !== -1) {
          acc += `<${curr} ${obj[curr]}="true"/>`;
        } else if (['', ].indexOf(obj[curr]) !== -1) {
          acc += `<${curr}/>`;
        } else {
          acc += `<${curr}>${obj[ curr ]}</${curr}>`;
        }
      }
      if (header && i === Object.keys(obj).length - 1) acc += `</${rootTag}>`;
      return acc;
    }, '').replace(/>__@|<_>|<\/_>/g, '');
  } else {
    return obj;
  }
}

module.exports = (input, userRootTag, xmlHeader = true) => {
  rootTag = userRootTag || 'root';
  let unformattedXML = jsonToXML(input, xmlHeader);
  if (unformattedXML instanceof Error) return unformattedXML;
  else return formatXML(unformattedXML, xmlHeader);
};