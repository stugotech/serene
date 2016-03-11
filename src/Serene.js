
import Promise from 'any-promise';


export default class Serene {
  constructor() {
    this.handlers = [];
  }


  dispatch(operation, resource, query, body, id) {
    let request = {operation, resource, query, body, id};
    let response = {result: null, status: null, headers: {}, end() {this._end = true;}};
    return reduce(request, response, this.handlers);
  }


  use(handler) {
    this.handlers.push(handler);
  }
};


['list', 'get', 'create', 'update', 'replace', 'delete'].forEach((operation) => {
  Serene.prototype[operation] = function (handler) {
    this.use((request, response) =>
      request.operation === operation ? handler(request, response) : response);
  };
});


function reduce(request, response, handlers, i=0) {
  return Promise.resolve(handlers[i](request, response))
    .then(function (response) {
      if (!response)
        throw new Error(`handler ${handlers[i].name} did not return a response`);

      if (!response._end && i < handlers.length - 1) {
        return reduce(request, response, handlers, i + 1)
      } else {
        return response;
      }
    });
}
