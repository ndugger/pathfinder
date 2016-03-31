# Redshirt.js

Redshirt.js is a lightweight HTTP router for vanilla Node.js -- It allows you to get
your requests routing in no time, allowing you to focus on what really matters.

## Prerequisites

- Node.js
- NPM
- Gulp

## Installation

```
npm install redshirt --save
```

## Usage

Simply import it at the top of a file, and go to town!

```javascript
import * as router from 'redshirt';
```

### Basic Usage Example

Currently, redshirt supports the following HTTP methods:

- DELETE
- GET
- POST
- PUT

Here's an example to give you an idea on how to use it with an http server.

```javascript
import http from 'http';
import url from 'url';

import * as router from 'redshirt';

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

Groups allow you to specify routes that live under a path, so if I wanted to group paths under '/foo', and I add a get '/bar' to that group, you can access that get via '/foo/bar'.

When dealing with groups, you can chain `get`, `post`, `put`, `del`, and even child `group`ings.
