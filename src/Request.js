
import Serene, {displayNameKey} from './Serene';
import Response from './Response';
import debug from 'debug';

const traceRequest = debug('serene:request');


export default class Request {
  constructor(serene, operationName, resourceName, id=null) {
    this.serene = serene;
    this.operation = Serene.operationsHash[operationName];

    if (!this.operation)
      throw new Error(`operation ${operationName} not supported`);

    this.resourceName = resourceName;
    this.id = id;
    this.query = {};
    this.body = null;
    this.headers = {};
    this.cookies = {};
    this.response = new Response();
  }


  subrequest(operationName, resourceName, id) {
    let request = new Request(
      this.serene,
      operationName || this.operationName,
      resourceName || this.resourceName,
      typeof id !== 'undefined' ? id : this.id
    );

    request.headers = this.headers;
    request.cookies = this.cookies;
    return request;
  }


  dispatch() {
    traceRequest(`dispatching ${this.operation.name}:${this.resourceName} (id=${this.id})`);

    return Promise.resolve(this._reduce())
      .then(() => {
        traceRequest(`dispatched successfully`);
        return this.response;
      });
  }


  _reduce(i=0) {
    if (!this.response._end && i < this.serene.handlers.length) {
      traceRequest(`running handler ${i}: ${this.serene.handlers[i][displayNameKey]}`);

      return new Promise((resolve, reject) => {
          Promise.resolve(this.serene.handlers[i](this, this.response))
            .then(() => resolve(this._reduce(i + 1)))
            .catch((err) => reject(err));
        });
    }
  }
};
