
import {expect} from 'chai';
import Serene from '../src/Serene';


describe('Serene', function () {
  let service;

  beforeEach(function () {
    service = new Serene();
  });

  it('should call registered handlers in order', function () {
    let calls = [];

    let expectedRequest = {
      operation: 'list',
      resource: 'widgets',
      query: {size: 5},
      body: {name: 'fred'},
      id: '3'
    };

    service.use(function (request, response) {
      calls.push(1);
      expect(request).to.eql(expectedRequest);
      expect(response.result).to.be.null;
      expect(response.status).to.be.null;
      expect(response.headers).to.exist;

      response.result = 'a result';
      return response;
    });

    service.use(function (request, response) {
      calls.push(2);
      expect(request).to.eql(expectedRequest);
      expect(response.result).to.equal('a result');
      expect(response.status).to.be.null;
      expect(response.headers).to.exist;

      return response;
    });

    return service.dispatch('list', 'widgets', {size: 5}, {name: 'fred'}, '3')
      .then(function (response) {
        expect(calls).to.eql([1,2]);
      });
  });

  it('should allow promises to be returned', function () {
    service.use(function (request, response) {
      return Promise.resolve(5);
    });

    return service.dispatch('list', 'widgets')
      .then(function (response) {
        expect(response).to.equal(5);
      });
  });

  it('should bail if end() is called', function () {
    service.use(function (request, response) {
      response.end();
      return response;
    });

    service.use(function (request, response) {
      throw new Error('should not have been called');
    });

    return service.dispatch('list', 'widgets');
  });

  it('should call specific handler for relevant operation', function () {
    let calls = [];

    service.use(function (request, response) {
      calls.push(1);
      return response;
    });

    service.list(function (request, response) {
      calls.push(2);
      return response;
    });

    return service.dispatch('list', 'widgets')
      .then(function (response) {
        expect(calls).to.eql([1,2]);
      });
  });

  it('should not call specific handler for irrelevant operation', function () {
    let calls = [];

    service.use(function (request, response) {
      calls.push(1);
      return response;
    });

    service.create(function (request, response) {
      calls.push(2);
      return response;
    });

    return service.dispatch('list', 'widgets')
      .then(function (response) {
        expect(calls).to.eql([1]);
      });
  });

  it('should throw an error if no result is returned', function () {
    service.use(function (request, response) {

    });

    return service.dispatch('list', 'widgets')
      .then(
        function () {
          throw Error('expected error');
        },
        function () {

        }
      );
  });

  it('should not complain if there are no handlers', function () {
    let promise = service.dispatch('list', 'widgets');
    expect(promise.then).to.exist;
  });

  it('should allow registration of objects with a handle method', function () {
    let called = false;

    let obj = {
      name: 'test',
      handle(request, response) {
        called = true;
        expect(this.name).to.equal('test');
        return response;
      }
    };

    service.use(obj);

    return service.dispatch('list', 'widgets')
      .then(function (response) {
        expect(called).to.be.true;
      });
  });
});
