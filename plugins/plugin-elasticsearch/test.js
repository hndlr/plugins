const chai = require('chai')
const { HTTPError, InternalServerError, NotFound } = require('@hndlr/errors')
const Mock = require('@elastic/elasticsearch-mock')
const { Client, errors } = require('@elastic/elasticsearch')

const plugin = require('./index')

const expect = chai.expect

describe('plugin-elasticsearch', function () {

  describe('connected', function () {
    /**
     * @type {Client}
     * */
    let client;

    /**
     * @type {Mock.ClientMock}
     * */
    let mock;

    beforeEach(function () {
      mock = new Mock()

      client = new Client({
        node: 'http://localhost:9200',
        Connection: mock.getConnection()
      })

      mock.add({
        method: 'GET',
        path: '/:index/_count'
      }, () => {
        return new errors.ResponseError({
          body: {
            error: {
              root_cause: [
                {
                  type: 'index_not_found_exception',
                  reason: 'no such index [missing]',
                  'resource.type': 'index_or_alias',
                  'resource.id': 'missing',
                  index_uuid: '_na_',
                  index: 'missing'
                }
              ],
              type: 'index_not_found_exception',
              reason: 'no such index [missing]',
              'resource.type': 'index_or_alias',
              'resource.id': 'missing',
              index_uuid: '_na_',
              index: 'missing'
            },
            status: 404
          },
          statusCode: 404
        })
      })
    })

    it('should convert 404 to correct error', function (done) {
      client.info(function (error, _) {
        const err = plugin()(error)

        expect(err).to.be.instanceof(HTTPError)
        expect(err.status).to.be.eq(404)
        expect(err.underlyingError).to.be.instanceof(errors.ResponseError)

        done()
      })
    });

    it('should return 500 for missing index', function (done) {
      client.count({ index: 'missing'}, function (error, _) {
        const err = plugin()(error)

        expect(err).to.be.instanceof(InternalServerError)
        expect(err.status).to.be.eq(500)
        expect(err.underlyingError).to.be.instanceof(Error)

        done()
      })
    });

    it('should return 404 for missing index', function (done) {
      client.count({ index: 'missing'}, function (error, _) {
        const err = plugin({ indexNotFound: 404 })(error)

        expect(err).to.be.instanceof(NotFound)
        expect(err.status).to.be.eq(404)

        done()
      })
    });
  });

  describe('invalid connection', function () {
    /**
     * @type {Client}
     * */
    let client;

    beforeEach(function () {
      client = new Client({
        node: 'http://localhost:9200'
      })
    })

    it('should return a 500', function (done) {
      client.info(function (error, _) {
        const err = plugin()(error)

        expect(err).to.be.instanceof(HTTPError)
        expect(err.status).to.be.eq(500)
        expect(err.underlyingError).to.be.instanceof(Error)

        done()
      })
    });
  });
});

