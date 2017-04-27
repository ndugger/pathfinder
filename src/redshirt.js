// The internal store for routes
const routes = [];

// The pattern for matching params in paths -- { x }
const paramsPattern = /\{(.*)\}/;

function exists (method, path) {
    return false; // TODO
}

// Supported HTTP methods
const DELETE = 'DELETE';
const GET = 'GET';
const POST = 'POST';
const PUT = 'PUT';

// Register a route
function register (method, path, middleware, action) {
    // Optional trailing slash and remove spaces
    path = (path.replace(/\/$/, '') || '/').replace(/\s/g, '');

    // Route already exists
    if (exists(method, path)) {
        throw new Error(`Route already exists for ${ method } ${ path }`);
    }

    // Route has middleware
    if (Array.isArray(middleware) && typeof action === 'function') {
        return routes.push({ 
            method, 
            path, 
            action: (...args) => {
                return Promise.all(middleware.map(fn => fn(...args))).then(() => action(...args));
            }
        });
    }

    // No middleware, just register action
    if (!action && typeof middleware === 'function') {
        return routes.push({ method, path, action: middleware });
    }
}

// Shorthand HTTP method wrappers
const del = register.bind(undefined, DELETE);
const get = register.bind(undefined, GET);
const post = register.bind(undefined, POST);
const put = register.bind(undefined, PUT);

// Shorthand for grouping routes under a parent path
function group (parent) {
    return {
        del (path, action) { del(parent + path, action); return this },
        get (path, action) { get(parent + path, action); return this },
        post (path, action) { post(parent + path, action); return this },
        put (path, action) { put(parent + path, action); return this },
        group(path) { return group(parent + path) }
    }
}

// Find a route based on the request method & the path
function find (method, path) {
    try {
        // Optional trailing slash
        path = path.replace(/\/$/, '') || '/';

        // Store the found params for later use
        const params = {};

        // Is the route simple; contains no params?
        const simpleRoute = routes.find(route => route.method === method && route.path === path);

        if (simpleRoute) {
            return { params, ...simpleRoute };
        }

        // Try to find a complex route with params;
        const complexRoute = routes
            .filter(route => route.method === method)
            .filter(route => route.path.split('/').length === path.split('/').length)
            .find(route => route.path.split('/').every((dir, i) => {
                // Dir is a param; retrieve value
                if (dir.match(paramsPattern)) {
                    params[dir.match(paramsPattern)[1]] = path.split('/')[i];
                    return true;
                }

                // Dir is just a string and matches request
                if (dir === path.split('/')[i]) {
                    return true;
                }

                // Reset params, wrong route
                Object.keys(params).forEach(key => delete params[key]);
                return false;
            }));

        // No route was found
        if (!complexRoute) {
            return null;
        }

        return { params, ...complexRoute };
    }
    catch (e) {
        return null;
    }
}

export default Object.freeze({
    
    DELETE,
    GET,
    POST,
    PUT,
    
    register,
    
    del,
    get,
    post,
    put,
    
    group,
    
    find
});
