/**
 * Going to coverage ignore this file as it's not the place
 * for it. Will be moved out to it's own package soon
 * */

const { InternalServerError, HTTPError, NotFound } = require('@hndlr/errors')

/**
 * @callback ErredHandler
 *
 * @param {Error}
 * @returns {HTTPError|null}
 * */

/**
 * @typedef {Number|404|500} ErredElasticsearchOptionsNotFound
 * */

/**
 * @typedef {Object} ErredElasticsearchOptions
 *
 * @property {ErredElasticsearchOptionsNotFound} indexNotFound
 * */

/**
 * @param {ErredElasticsearchOptions} opts
 * @returns {ErredHandler}
 * */
module.exports = (opts = { indexNotFound: 500 }) => {
  const options = Object.assign({ indexNotFound: 500 }, opts)

  /**
   * @param {Error} error
   * @returns {AnyHTTPError|null}
   * */
  const plugin = (error) => {
    if (error.name === 'ConnectionError') {
      const underlyingError = new Error(error.message)
      underlyingError.name = underlyingError.code = error.name
      underlyingError.meta = error.meta.meta.connection
      return new InternalServerError('Elasticsearch node is down', underlyingError)
    }

    if (/index_not_found_exception/.test(error.message)) {
      const underlyingError = new Error(error.message)
      underlyingError.name = underlyingError.code = error.name
      underlyingError.meta = error.meta.body.error
      if (options.indexNotFound === 404) return new NotFound(`${error.meta.body.error['resource.id']} does not exist`)
      return new InternalServerError(`${error.meta.body.error['resource.id']} does not exist`, underlyingError)
    }

    // This is a general error, will need to diversify for the proper
    // elasticsearch error handling
    if (error.meta && error.meta.statusCode) {
      const httpError = new HTTPError(error.message, error.meta.statusCode)
      error.meta = error.meta.body.error
      httpError.underlyingError = error
      return httpError
    }
  }

  plugin.options = options

  return plugin;
}
