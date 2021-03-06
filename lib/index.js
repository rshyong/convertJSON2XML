'use strict';

let defaultConfigurations = {
  rootTag: 'root',
  xmlHeader: true,
  trim: false,
  emptyStringTag: 'default',
  nullValueTag: 'default',
  hideUndefinedTag: false,
  formatting: true,
};

/**
 * Converts json object to xml
 * @param {Object} config Contains configuration object.
 * @returns {Function} returns XML.
 */
function jsonToXML(config) {
  let options = Object.assign({}, defaultConfigurations, config);
  return function (input, tabs = '', rootHeader = true, xmlHeader) {
    let { rootTag, trim, emptyStringTag, nullValueTag, hideUndefinedTag, formatting, } = options;
    xmlHeader = xmlHeader !== undefined ? xmlHeader : options.xmlHeader;
    let tabChar = formatting ? '\t' : '';
    let newlineChar = formatting ? '\n' : '';
    let obj;
    if (rootHeader && typeof input === 'string') {
      try {
        obj = JSON.parse(input);
      } catch (e) {
        return new Error('invalid JSON format', e);
      }
    } else if (rootHeader && typeof input === 'object' && !Array.isArray(input) && [undefined, null].indexOf(input) === -1) {
      obj = input;
    } else if (rootHeader) {
      return new Error('invalid JSON format');
    } else {
      obj = input;
    }
    if (typeof obj === 'object' && !(obj instanceof Date) && [ undefined, null, ].indexOf(obj) === -1) {
      return Object.keys(obj).reduce((acc, curr, i) => {
        if (trim && typeof obj[ curr ] === 'string') obj[ curr ] = obj[ curr ].trim();
        if (xmlHeader && i === 0) {
          acc += `<?xml version="1.0" encoding="UTF-8"?>${newlineChar}`;
          tabs += tabChar;
        }
        if (rootHeader && i === 0) {
          acc += `${tabs}<${rootTag}>${newlineChar}`;
          tabs += tabChar;
        }
        if (curr === '@') {
          let attributes = obj[ curr ];
          acc += '__@' + ' ' + Object.keys(attributes).reduce((acc, curr) => {
            if (trim) {
              acc.push(`${curr.trim()}="${attributes[ curr ].toString().trim()}"`)
            } else {
              acc.push(`${curr}='${attributes[ curr ]}'`)
            }
            return acc;
          }, []).join(' ') + `>${newlineChar}`;
        } else {
          if (typeof obj[ curr ] === 'object' && !(obj[ curr ] instanceof Date) && !Array.isArray(obj[ curr ]) && [ undefined, null, ].indexOf(obj[ curr ]) === -1) {
            if (Object.values(obj[ curr ]).length) acc += `${tabs}<${curr}>${newlineChar}${jsonToXML(options)(obj[ curr ], formatting ? tabs + '\t' : '', false, false)}${tabs}</${curr}>${newlineChar}`;
            else {
              // empty object
              acc += `${tabs}<${curr}></${curr}>${newlineChar}`;
            }
          } else if (Array.isArray(obj[ curr ]) && obj[ curr ].length) {
            obj[ curr ].forEach((ele) => {
              if (trim && typeof ele === 'string') ele = ele.trim();
              if ([ undefined, null, ].indexOf(ele) !== -1) {
                acc += `${tabs}<${curr} ${ele}="true"/>${newlineChar}`;
              } else {
                if (typeof ele === 'object' && Object.values(ele).length) acc += `${tabs}<${curr}>${newlineChar}${jsonToXML(options)(ele, formatting ? tabs + '\t' : '', false, false)}${tabs}</${curr}>${newlineChar}`;
                else if (typeof ele === 'object') acc += `${tabs}<${curr}></${curr}>${newlineChar}`;
                else acc += `${tabs}<${curr}>${jsonToXML(options)(ele, formatting ? tabs + '\t' : '', false, false)}</${curr}>${newlineChar}`;
              }
            });
          } else if ([ undefined ].indexOf(obj[ curr ]) !== -1) {
            if (!hideUndefinedTag) acc += `${tabs}<${curr} ${obj[curr]}="true"/>${newlineChar}`;
          } else if ([ null ].indexOf(obj[ curr ]) !== -1) {
            if (nullValueTag === 'default') acc += `${tabs}<${curr} ${obj[ curr ]}="true"/>${newlineChar}`;
            else acc += `${tabs}<${curr}></${curr}>${newlineChar}`;
          } else if ([ '', ].indexOf(obj[ curr ]) !== -1) {
            if (emptyStringTag === 'default') acc += `${tabs}<${curr}/>${newlineChar}`;
            else if (emptyStringTag === 'full') acc += `${tabs}<${curr}>${obj[ curr ]}</${curr}>${newlineChar}`;
          } else if (curr === '_') {
            if (trim) obj[ curr ] = obj[ curr ].toString().trim();
            acc += `<${curr}>${obj[ curr ]}</${curr}>`;
          } else {
            acc += `${tabs}<${curr}>${obj[ curr ]}</${curr}>${newlineChar}`;
          }
        }
        if (rootHeader && i === Object.keys(obj).length - 1) {
          tabs = tabs.slice(0, -1);
          acc += `${tabs}</${rootTag}>`;
        }
        return acc;
      }, '').replace(/>\n__@|>__@|\n<_>|<\/_>\t+/g, '');
    } else {
      return obj;
    }
  }
}

/**
 * Returns singleton object.
 * @returns {Function} Returns jsonToXML function.
 */
function Singleton(inp) {
  if (typeof Singleton.instance === 'function') {
    return Singleton.instance(inp);
  } else {
    Singleton.instance = jsonToXML(inp);
    return Singleton.instance;
  }
}

Singleton.clear = function() {
  Singleton.instance = null;
}

module.exports = {
  singleton: Singleton,
  config: jsonToXML,
};