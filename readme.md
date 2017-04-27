# Redshirt.js

Redshirt.js is a lightweight, agnostic router, built with vanilla Node.js in mind, 
but can be used in the browser as well, since it has no external dependencies.

## Installation

```
npm install redshirt --save
```

## Usage

Simply import it at the top of a file, and go to town!

```javascript
import router from 'redshirt';
```

### Basic Usage Example

Currently, redshirt supports the following HTTP methods:

- DELETE
- GET
- POST
- PUT

(It's dead simple to support others, so feel free to submit a PR)

Here's an example to give you an idea on how to use it with an http server.

```javascript
import http from 'http';
import url from 'url';

import router from 'redshirt';

router.get('/', async request => {
    return 'Hello, World!';
});

router.get('/{ foo }', async request => {
    const { foo } = request.params;
    return `Hello, ${ foo }!`;
});

http.createServer((request, response) => {
    const { method } = request;
    const path = url.parse(request.url).pathname;
    const route = router.find(method, path);

    // if a post/put, listen on 'data' event on request to extract body

    if (route) {
        const { action } = route;
        const result = await action(request);

        response.end(result);
    }
}).listen(3000);
```

### Middleware
Redshirt also supports "middleware", in that you can pass in an array of async functions 
to be called before an action. Middleware functions should `throw` a useful value that you 
can use to send an error response to the client, if it fails.

```javascript
async function authenticate (request) {
    if (!authenticated) {
        throw 401;
    }
}

router.del('/{ foo }', [ authenticate ], async request => {
    // if any middleware throws, this action will not be run
});

// ...

if (route) try {
    const { action } = route;
    const result = await action(request);

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
router.register(router.GET, '/', async req => { ... })
```

- `get(requestedPath, asyncCallback)`
```javascript
router.get('/', async req => {
    // ...
});
```

- `post(requestedPath, asyncCallback)`
```javascript
router.post('/', async req => {
    const { body } = req;
});
```

- `put(requestedPath, asyncCallback)`
```javascript
router.put('/', async req => {
    const { body } = req;
});
```

- `del(requestedPath, asyncCallback)`
```javascript
router.del('/', async req => {
    // ...
});
```

- `group(groupPath)`
```javascript
router.group('/foo')
      .get('/', async req => { ... })
      .get('/bar', async req => { ... })
      .post('/baz', async req => { ... });
```

Groups allow you to specify routes that live under a path, so if I wanted to group paths under `'/foo'`, and I add a get `'/bar'` to that group, you can access it get via `'/foo/bar'`.

When dealing with groups, you can chain `get`, `post`, `put`, `del`, and even child `group`ings.
