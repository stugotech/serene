
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
  return response;
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
  return response;
});
```

The handler function is passed two parameters, namely `request` and `response`.  The `request` object has the following fields:

  * `operation` - a string specifying which of the above operations the request is for
  * `resource` - the name of the resource to operate on
  * `query` - additional parameters from the querystring
  * `body` - an object representing the request body parsed as a JSON object (only applicable to `create`, `update` and `replace` requests)
  * `id` - a string representing the ID of the resource to operate on (only applicable to `get`, `update` and `replace` requests)

The `response` object has the following fields:

  * `result` - the result object, which will be serialised as JSON back to the client
  * `status` - the integer status code to return
  * `headers` - a hash of headers to return
  * `end()` - bail out the handler stack

Each handler must return the response (or a promise of the response), which is passed into the next handler.  The handlers are executed in the order in which they were registered; by default all the handlers registered are executed, unless `response.end()` is called, which prevents further handlers being executed.

### API

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

#### `dispatch(operation, resource, query, body, id)`

Dispatches a request to the handlers.

**Parameters**

  * `operation` - a string, one of the above operation types
  * `resource` - the name of the resource
  * `query` - an object representing the parsed querystring
  * `body` - an object representing the parsed request body
  * `id` - the ID of the object the request is for

## Why "Serene"?

I went to thesaurus.com and looked up synonyms for "RESTful".
