convertJSON2XML
=========

A small library that converts json to xml.

## Installation

  `npm install convertjson2xml`

## Usage

```
  const jsonToXML = require('convertjson2xml');

  let xml = jsonToXML({
    a: 1,
    b: [2,3],
  });

  console.log(xml);
```

Output should be

```
  <root>
    <a>1</a>
    <b>2</b>
    <b>3</b>
  </root>
```

## Tests

  `npm test`
