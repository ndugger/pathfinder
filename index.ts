import * as http from 'http';

type Action<ReturnType = unknown> = (request: http.ClientRequest, params?: any, response?: http.ServerResponse) => ReturnType;
type Middleware = Action<Promise<any>>[] | Action;

enum Method {
    ALL = 'ALL',
    DELETE = 'DELETE',
    GET = 'GET',
    POST = 'POST',
    PUT = 'PUT'
}

interface Route {
    method: Method;
    params?: {
        [ key: string ]: string
    };
    path: string;
    action: Action;
}

export default class Pathfinder {

    public static pattern: RegExp = /\{(.*)\}/;

    private routes: Set<Route>;

    private knows(method: Method, path: string): boolean {
        const x = (path.replace(/\/$/, '') || '/').replace(/\s/g, '');
        return false; // TODO
    }

    private register(method: Method, path: string, middleware: Middleware, action: Action) {
        path = (path.replace(/\/$/, '') || '/').replace(/\s/g, '');

        if (this.knows(method, path)) {
            throw new Error(`Route already exists for ${ method } ${ path }`);
        }

        if (Array.isArray(middleware) && typeof action === 'function') {
            this.routes.add({
                method,
                path,
                action: (...args) => {
                    return Promise.all(middleware.map(fn => fn(...args))).then(() => action(...args));
                }
            });
        }

        if (!action && typeof middleware === 'function') {
            this.routes.add({ method, path, action: middleware });
        }
    }

    public constructor() {
        this.routes = new Set();
    }

    public delete(path: string, middleware: Middleware, action: Action): void {
        this.register(Method.DELETE, path, middleware, action);
    }

    public get(path: string, middleware: Middleware, action: Action): void {
        this.register(Method.GET, path, middleware, action);
    }

    public post(path: string, middleware: Middleware, action: Action): void {
        this.register(Method.POST, path, middleware, action);
    }

    public put(path: string, middleware: Middleware, action: Action): void {
        this.register(Method.PUT, path, middleware, action);
    }

    public find(method: Method, path: string) {
        path = (path.replace(/\/$/, '') || '/').replace(/\s/g, '');

        const routes = Array.from(this.routes);
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

                    if (dir.match(Pathfinder.pattern)) {
                        params[ dir.match(Pathfinder.pattern)[ 1 ] ] = path.split('/')[ i ];
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
}
