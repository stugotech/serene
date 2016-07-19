
export default class Response {
  constructor() {
    this.result = null;
    this.status = null;
    this.headers = {};
  }


  end() {
    this._end = true;
  }
};
