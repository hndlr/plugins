## @hndlr/plugins

Monorepo for `@hndlr/plugins`.

### Usage

Basic usage

```javascript
const express = require('express')
const erred = require('@hndlr/erred')
const { NotFound } = require('@hndlr/errors')

const app = express()
const port = 3000

app.get('*', (req, res, next) => {
  return next(new NotFound(`Could not find ${req.url}`))
})

// They can be global like so, of maybe a route uses a custom error handling
const errorHandler = erred()
// Some plugins may have options that need to be handled first
errorHandler.use(require('@hndlr/plugin-elasticsearch')({ /*...*/ }))

// Set the middleware for app
//
// Should always go last!!
app.use(errorHandler)

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})
```

