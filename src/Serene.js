
import Promise from 'any-promise';
import debug from 'debug';

const traceRequest = debug('serene:request');
const traceSetup = debug('serene:setup');
const displayNameKey = Symbol('display name');


export default class Serene {
  constructor() {
    this.handlers = [];
  }


  dispatch(operationName, resourceName, query, body, id, headers, cookies) {
    traceRequest(`dispatching ${operationName}:${resourceName} (id=${id})`);
    let operation = Serene.operationsHash[operationName];

    if (!operation)
      throw new Error(`operation ${operationName} not supported`);

    let request = {operation, resourceName, query, body, id, headers, cookies};
    let response = {result: null, status: null, headers: {}, end() {this._end = true;}};

    return Promise.resolve(reduce(request, response, this.handlers))
      .then(function () {
        traceRequest(`dispatched successfully`);
        return response;
      });
  }


  use(handler, operation='use') {
    if (typeof handler === 'function') {
      handler[displayNameKey] = handler.name || handler.toString();
      traceSetup(`${operation} ${handler[displayNameKey]}`);
      this.handlers.push(handler);

    } else if (handler.handle) {
      handler[displayNameKey] = handler.constructor.name;
      traceSetup(`${operation} ${handler[displayNameKey]}`);
      this.handlers.push(handler.handle.bind(handler));

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


function reduce(request, response, handlers, i=0) {
  if (!response._end && i < handlers.length) {
    traceRequest(`running handler ${i}: ${handlers[i][displayNameKey]}`);

    return new Promise((resolve, reject) => {
        Promise.resolve(handlers[i](request, response))
          .then(() => resolve(reduce(request, response, handlers, i + 1)))
      });
  }
}
