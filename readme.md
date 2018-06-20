# juncture

juncture is a lightweight, agnostic router, built with node.js in mind, 
but can be used in the browser as well, since it has no external dependencies.

## Installation

```
npm install cyclonic-games/juncture --save
```

## Usage

Simply import it at the top of a file, and go to town!

```javascript
import Router from 'juncture/Router';
```

### Basic Usage Example

Currently, juncture supports the following HTTP methods:

- DELETE
- GET
- POST
- PUT

(It's dead simple to support others, so feel free to submit a PR)

Here's an example to give you an idea on how to use it with an http server.

```javascript
import http from 'http';
import url from 'url';

import Router from 'juncture/Router';

const router = new Router();

router.get('/', async request => {
    return 'Hello, World!';
});

router.get('/{ foo }', async (request, { foo }) => {
    return `Hello, ${ foo }!`;
});

http.createServer((request, response) => {
    const { method } = request;
    const path = url.parse(request.url).pathname;
    const route = router.find(method, path);

    // if a post/put, listen on 'data' event on request to extract body

    if (route) {
        const { action, params } = route;
        const result = await action(request, params);

        response.end(result);
    }
}).listen(3000);
```

### Middleware
juncture also supports "middleware", in that you can pass in an array of async functions 
to be called before an action. Middleware functions should `throw` a useful value that you 
can use to send an error response to the client, if it fails.

```javascript
async function authenticate (request) {
    if (!authenticated) {
        throw 401;
    }
}

router.del('/{ foo }', [ authenticate ], async (request, { foo }) => {
    // if any middleware throws, this action will not be run
});

// ...

if (route) try {
    const { action, params } = route;
    const result = await action(request, params);

    response.end(result);
}
catch (statusCode) {
    response.statusCode = statusCode;
    response.end(http.STATUS_CODES[ statusCode ]);
}
```

### Available API

- `register(httpMethod, requestedPath, asyncCallback)`
```javascript
juncture.register(router.GET, '/', async request => {
    // ...
})
```

- `delete(requestedPath, asyncCallback)`
```javascript
juncture.delete('/', async request => {
    // ...
});
```

- `get(requestedPath, asyncCallback)`
```javascript
juncture.get('/', async request => {
    // ...
});
```

- `post(requestedPath, asyncCallback)`
```javascript
juncture.post('/', async request => {
    // ...
});
```

- `put(requestedPath, asyncCallback)`
```javascript
juncture.put('/', async request => {
    // ...
});
```

Groups allow you to specify routes that live under a path, so if I wanted to group paths under `'/foo'`, and I add a get `'/bar'` to that group, you can access it get via `'/foo/bar'`.

When dealing with groups, you can chain `delete`, `get`, `post`, `put`, and even child `group`ings.
