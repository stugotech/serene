
# Serene

Abstraction for REST APIs.

## Installation

    $ npm install --save serene

## Usage

There is one handler for Serene so far, namely [serene-express](https://www.npmjs.com/package/serene-express).  Go there for a usage example with express.

```js
import Serene from 'serene';

let service = new Serene();

service.use(function (request, response) {
  // do some stuff
});

```

## Documentation

Serene defines the following operations on resources:

  * `list` - get all objects
  * `get` - get a specific object
  * `create` - create a new object
  * `update` - update specific fields on a specific object
  * `replace` - replace a specific object with an object
  * `delete` - delete an object

It allows you to register handler functions for these operations:

```js
service.use(function (request, response) {
  // do some stuff
});
```

The handler function is passed two parameters, namely `request` and `response`.  The `request` object has the following fields:

  * `operation` - a string specifying which of the above operations the request is for
  * `resourceName` - the name of the resource to operate on
  * `query` - additional parameters from the querystring
  * `body` - an object representing the request body parsed as a JSON object (only applicable to `create`, `update` and `replace` requests)
  * `id` - a string representing the ID of the resource to operate on (only applicable to `get`, `update` and `replace` requests)

The `response` object has the following fields:

  * `result` - the result object, which will be serialised as JSON back to the client
  * `status` - the integer status code to return
  * `headers` - a hash of headers to return
  * `end()` - bail out the handler stack

The handlers are executed in the order in which they were registered; by default all the handlers registered are executed, unless `response.end()` is called, which prevents further handlers being executed.  If a handler returns a promise, the promise will be awaited before continuing with the next handler.

### `Serene` class

```js
import Serene from 'serene';
```

#### `use(handler)`

Adds the specified handler function to the stack.

#### `list(handler)`

Adds a handler specifically for the `list` operation.

#### `get(handler)`

Adds a handler specifically for the `get` operation.

#### `create(handler)`

Adds a handler specifically for the `create` operation.

#### `update(handler)`

Adds a handler specifically for the `update` operation.

#### `replace(handler)`

Adds a handler specifically for the `replace` operation.

#### `delete(handler)`

Adds a handler specifically for the `delete` operation.


### `Request` class

```js
import {Request} from 'serene';
```

#### `constructor(serene, baseUrl, operationName, resourceName, id=null)`

Dispatches a request to the handlers.

**Parameters**

  * `serene` - the instance of serene the request is for
  * `operationName` - a string, one of the above operation types
  * `resourceName` - the name of the resource  
  * `id` - the ID of the object the request is for

#### `serene` property

The instance of serene the request is for.

#### `operationName` property

The name of the operation, e.g., `delete` (see above for list).

#### `resourceName` property

The name of the resource that the request is for.

#### `id` property

The ID of the object the request is for, if applicable.

#### `query` property

An ordinary object hash representing the query parsed query string.

#### `body` property

The body of the request as an ordinary object, i.e., parsed from JSON.

#### `headers` property

An object representing the HTTP headers.

#### `cookies` property

An object representing the HTTP cookies.

#### `response` property

An instance of `Response` (see below) for the request.


### `Response` class

#### `result` property

The result of the API call.

#### `status` property

Integer HTTP status code.

#### `headers` property

A hash representing the headers to send.

## Why "Serene"?

I went to thesaurus.com and looked up synonyms for "RESTful".

## Middleware etc

You can find related packages such as middleware and handlers under the [serene](https://www.npmjs.com/browse/keyword/serene) keyword on NPM.
