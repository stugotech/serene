
import {expect} from 'chai';
import Serene from '../src/Serene';
import Request from '../src/Request';


describe('Serene', function () {
  let service;

  beforeEach(function () {
    service = new Serene();
  });

  it('should call registered handlers in order', function () {
    let calls = [];

    service.use(function (request, response) {
      calls.push(1);

      expect(request.operation).to.eql({
        body: false,
        write: false,
        name: 'list'
      });

      expect(request.resourceName).to.equal('widgets');
      expect(request.query).to.eql({size: 5});
      expect(request.body).to.eql({name: 'fred'});
      expect(request.id).to.eql('3');

      expect(response.result).to.be.null;
      expect(response.status).to.be.null;
      expect(response.headers).to.exist;

      response.result = 'a result';
    });

    service.use(function (request, response) {
      calls.push(2);
      expect(response.result).to.equal('a result');
      expect(response.status).to.be.null;
      expect(response.headers).to.exist;
    });

    let request = new Request(service, 'list', 'widgets', '3');
    request.query = {size: 5};
    request.body = {name: 'fred'};

    return request.dispatch()
      .then(function (response) {
        expect(calls).to.eql([1,2]);
      });
  });

  it('should allow promises to be returned', function () {
    service.use(function (request, response) {
      return Promise.resolve(5).then(function (v) {
        response.value = v;
      });
    });

    let request = new Request(service, 'list', 'widgets');

    return request.dispatch()
      .then(function (response) {
        expect(response.value).to.equal(5);
      });
  });

  it('should bail if end() is called', function () {
    service.use(function (request, response) {
      response.end();
    });

    service.use(function (request, response) {
      throw new Error('should not have been called');
    });

    let request = new Request(service, 'list', 'widgets');

    return request.dispatch();
  });

  it('should call specific handler for relevant operation', function () {
    let calls = [];

    service.use(function (request, response) {
      calls.push(1);
    });

    service.list(function (request, response) {
      calls.push(2);
    });

    let request = new Request(service, 'list', 'widgets');

    return request.dispatch()
      .then(function (response) {
        expect(calls).to.eql([1,2]);
      });
  });

  it('should not call specific handler for irrelevant operation', function () {
    let calls = [];

    service.use(function (request, response) {
      calls.push(1);
    });

    service.create(function (request, response) {
      calls.push(2);
    });

    let request = new Request(service, 'list', 'widgets');

    return request.dispatch()
      .then(function (response) {
        expect(calls).to.eql([1]);
      });
  });

  it('should reject if an error is thrown in the handler', function () {
    service.use(() => void 0);

    service.use(function (request, response) {
      throw new Error();
    });

    service.use(() => void 0);

    let request = new Request(service, 'list', 'widgets');

    return request.dispatch()
      .then(
        function () {
          throw new Error('expected error');
        },
        function () {
        }
      );
  });


  it('should reject if a promise is rejected in the handler', function () {
    service.use(() => void 0);

    service.use(function (request, response) {
      return Promise.reject('error');
    });

    let request = new Request(service, 'list', 'widgets');

    return request.dispatch()
      .then(
        function () {
          throw new Error('expected error');
        },
        function () {
        }
      );
  });

  it('should not complain if there are no handlers', function () {
    let request = new Request(service, 'list', 'widgets');

    return request.dispatch()
      .then(function () {});
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

    let request = new Request(service, 'list', 'widgets');

    return request.dispatch()
      .then(function (response) {
        expect(called).to.be.true;
      });
  });
});
