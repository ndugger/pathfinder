# Pathfinder

pathfinder is a lightweight, HTTP-based router, built with node.js in mind, 
but can be used in the browser as well, since it has no external dependencies.

## Installation

```
npm install ndugger/pathfinder --save
```

## Usage

Simply import it at the top of a file, and go to town!

```typescript
import * as Pathfinder from 'pathfinder';
```

### Basic Usage Example

Here's an example to give you an idea on how to use it with a node http server.

```typescript
import http from 'http';
import url from 'url';

import * as Pathfinder from 'pathfinder';

const router = new Pathfinder.Router();

router.get('/', async request => {
    return 'Hello, World!';
});

router.get('/{ foo }', async (request, { foo }) => {
    return `Hello, ${ foo }!`;
});

http.createServer(async (request, response) => {
    const path = url.parse(request.url).pathname;
    const route = router.find(request.method, path);
    
    if (route) {
        response.end(await route.resolve(request, route.params));
    }
}).listen(8080);
```

### Middleware
pathfinder also supports "middleware", in that you can pass in an array of async functions 
to be called before an action. Middleware functions should `throw` a useful value that you 
can use to send an error response to the client if it fails.

```typescript
async function authenticate(request) {
    if (!authenticated) {
        throw new Error(401);
    }
}

router.delete('/{ foo }', [ authenticate ], async (request, { foo }) => {
    // if authenticate throws, this action will not be executed
});
```

```typescript
if (route) try {
    const result = await route.resolve(request, route.params);

    response.end(result);
}
catch (error) {
    response.statusCode = error.message;
    response.end(http.STATUS_CODES[ error.message ]);
}
```

### Available API

```typescript
router.connect('/', async request => {
    // ...
});
```

```typescript
router.delete('/', async request => {
    // ...
});
```

```typescript
router.get('/', async request => {
    // ...
});
```

```typescript
router.head('/', async request => {
    // ...
});
```

```typescript
router.options('/', async request => {
    // ...
});
```

```typescript
router.patch('/', async request => {
    // ...
});
```

```typescript
router.post('/', async request => {
    // ...
});
```

```typescript
router.put('/', async request => {
    // ...
});
```

```typescript
router.trace('/', async request => {
    // ...
});
```

```typescript
router.find('GET', '/');
```
