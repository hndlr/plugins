## @hndlr/plugin-elasticsearch

### Installation

```bash
$ npm install @hndlr/plugin-elasticsearch
```

### Usage

Basic usage

```javascript
const erred = require('@hndlr/erred')()

// Some plugins may have options that need to be handled first
erred.use(require('@hndlr/plugin-elasticsearch')({
  indexNotFound: 404 // Defaults to a 500 with the underling error
}))
```
