// The internal store for routes
const routes = [];

// The pattern for matching params in paths -- { x }
const paramsPattern = /\{(.*)\}/;

// Supported HTTP methods
export const DELETE = 'DELETE';
export const GET = 'GET';
export const POST = 'POST';
export const PUT = 'PUT';

// Register a route
export function register (method, path, action) {
    try {
        // Optional trailing slash and remove spaces
        path = (path.replace(/\/$/, '') || '/').replace(/\s/g, '');

        // Route already exists
        if (false /* TODO: match route with possible vars against requested url */) {
            throw new Error(`Route already exists for ${ method }: ${ path }`);
        }

        // Register the route
        routes.push({ method, path, action });
    }
    catch (e) {
        console.error(e);
    }
}

// Shorthand HTTP method wrappers
export const del = register.bind(undefined, DELETE);
export const get = register.bind(undefined, GET);
export const post = register.bind(undefined, POST);
export const put = register.bind(undefined, PUT);

// Shorthand for grouping routes under a parent path
export function group (parent) {
    return {
        del (path, action) { del(parent + path, action); return this },
        get (path, action) { get(parent + path, action); return this },
        post (path, action) { post(parent + path, action); return this },
        put (path, action) { put(parent + path, action); return this },

        group(path) { return group(parent + path) }
    }
}

// Find a route based on the request method & the url
export function find (method, path) {
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

                // Reset params, wrong route TODO: smelly...
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
        console.error(e);
        return null;
    }
}
