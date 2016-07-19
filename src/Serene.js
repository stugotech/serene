
import Request from './Request';
import Promise from 'any-promise';
import debug from 'debug';

const traceSetup = debug('serene:setup');
export const displayNameKey = Symbol('display name');


export default class Serene {
  constructor() {
    this.handlers = [];
  }


  request(operationName, resourceName, query, body, id, headers, cookies) {
    let request = new Request(this, operationName, resourceName, id);
    request.query = query;
    request.body = body;
    request.headers = headers;
    request.cookies = cookies;
    return request;
  }


  dispatch(operationName, resourceName, query, body, id, headers, cookies) {
    return this.request(operationName, resourceName, query, body, id, headers, cookies);
  }


  use(handler, operation='use') {
    if (typeof handler === 'function') {
      handler[displayNameKey] = handler.name || handler.toString();
      traceSetup(`${operation} ${handler[displayNameKey]}`);
      this.handlers.push(handler);

    } else if (handler.handle) {
      let fn = handler.handle.bind(handler);
      fn[displayNameKey] = handler.constructor.name;
      traceSetup(`${operation} ${fn[displayNameKey]}`);
      this.handlers.push(fn);

    } else {
      throw new Error('handler must be either a function or an object with a handle method');
    }

    return this;
  }
};


Serene.operations = [
  {name: 'list', write: false, body: false},
  {name: 'get', write: false, body: false},
  {name: 'create', write: true, body: true},
  {name: 'update', write: true, body: true},
  {name: 'replace', write: true, body: true},
  {name: 'delete', write: true, body: false}
];


Serene.operationsHash = {};

for (let operation of Serene.operations) {
  Serene.operationsHash[operation.name] = operation;

  Serene.prototype[operation.name] = function (handler) {
    this.use(handler, operation.name);

    let fn = this.handlers[this.handlers.length - 1];

    this.handlers[this.handlers.length - 1] = (request, response) => {
      if (request.operation.name === operation.name) {
        fn(request, response);
      }
    }

    return this;
  };
}
