
import Promise from 'any-promise';


export default class Serene {
  constructor() {
    this.handlers = [];
  }


  dispatch(operationName, resourceName, query, body, id, headers, cookies) {
    let operation = Serene.operationsHash[operationName];

    if (!operation)
      throw new Error(`operation ${operationName} not supported`);

    let request = {operation, resourceName, query, body, id, headers, cookies};
    let response = {result: null, status: null, headers: {}, end() {this._end = true;}};

    return new Promise((resolve, reject) => {
      resolve(reduce(request, response, this.handlers));
    });
  }


  use(handler) {
    if (typeof handler === 'function') {
      this.handlers.push(handler);
    } else if (handler.handle) {
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
    return this.use(function (request, response) {
      if (request.operation.name === operation.name) {
        handler(request, response);
      }
    });
  };
}


function reduce(request, response, handlers, i=0) {
  if (!response._end && i < handlers.length) {
    return Promise.resolve(handlers[i](request, response))
      .then(function () {
        return reduce(request, response, handlers, i + 1)
      });
  } else {
    return response;
  }
}
