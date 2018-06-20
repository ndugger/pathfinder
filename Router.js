const DELETE = 'DELETE';
const GET = 'GET';
const POST = 'POST';
const PUT = 'PUT';

module.exports = class Router {
    
    constructor () {
        this.routes = new Set();
    }
    
    exists (method, uri) {
        
        const path = (uri.replace(/\/$/, '') || '/').replace(/\s/g, '');
        return false; // TODO
    }

    register (method, uri, middleware, action) {
        const path = (uri.replace(/\/$/, '') || '/').replace(/\s/g, '');
        
        if (this.exists(method, path)) {
            throw new Error(`Route already exists for ${ method } ${ path }`);
        }
        
        if (Array.isArray(middleware) && typeof action === 'function') {
            return routes.add({ 
                method, 
                path, 
                action: (...args) => {
                    return Promise.all(middleware.map(fn => fn(...args))).then(() => action(...args));
                }
            });
        }
        
        if (!action && typeof middleware === 'function') {
            return this.routes.add({ method, path, action: middleware });
        }
    }
    
    delete (uri, middleware, action) {
        return this.register(DELETE, uri, middleware, action);
    }
    
    get (uri, middleware, action) {
        return this.register(GET, uri, middleware, action);
    }
    
    post (uri, middleware, action) {
        return this.register(POST, uri, middleware, action);
    }
    
    put (uri, middleware, action) {
        return this.register(PUT, uri, middleware, action);
    }
    
    find (method, uri) {
        const routes = Array.from(this.routes);
        const path = (uri.replace(/\/$/, '') || '/').replace(/\s/g, '');
        const params = { };
        
        try {
            const simpleRoute = routes.find(route => route.method === method && route.path === path);

            if (simpleRoute) {
                return { params, ...simpleRoute };
            }
            
            const complexRoute = routes
                .filter(route => route.method === method)
                .filter(route => route.path.split('/').length === path.split('/').length)
                .find(route => route.path.split('/').every((dir, i) => {
                    
                    if (dir.match(module.exports.pattern)) {
                        params[ dir.match(module.exports.pattern)[ 1 ] ] = path.split('/')[ i ];
                        return true;
                    }
                    
                    if (dir === path.split('/')[ i ]) {
                        return true;
                    }
                    
                    Object.keys(params).forEach(key => delete params[ key ]);
                    
                    return false;
                }));
            
            if (!complexRoute) {
                return null;
            }

            return { params, ...complexRoute };
        }
        catch (e) {
            return null;
        }
    }
};

module.exports.pattern = /\{(.*)\}/;
