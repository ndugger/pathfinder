/**
 * Registered actions must return a promise.
 */
type Action<Resolution> = <Request, Parameters, Response>(request: Request, params?: Parameters, response?: Response) => Promise<Resolution>;

/**
 * Middleware is an array of actions that run before the registered action.
 */
type Middleware = Action<unknown>[];

/**
 * Supported HTTP methods.
 */
export enum RouterMethod {
    CONNECT = 'CONNECT',
    DELETE = 'DELETE',
    GET = 'GET',
    HEAD = 'HEAD',
    OPTIONS = 'OPTIONS',
    PATCH = 'PATCH',
    POST = 'POST',
    PUT = 'PUT',
    TRACE = 'TRACE'
}

/**
 * Represents a registered route.
 */
export interface Route {
    /**
     * HTTP method tied to route.
     */
    method: RouterMethod;
    /**
     * Path parameters extracted during parsing.
     */
    parameters?: {
        [ key: string ]: string
    };
    /**
     * Registered string path.
     */
    path: string;
    /**
     * Registered action associated with registered route.
     */
    resolve: Action<unknown>;
}

/**
 * Normalizes string paths.
 */
function normalizePath(path: string): string {
    return (path.replace(new RegExp(`${ Router.delimiter }$`), '') || Router.delimiter).replace(/\s/g, '');
}

/**
 * Used to parse string paths, and direct flow based on HTTP methods.
 */
export class Router {
    
    /**
     * Pattern used to capture path parameters.
     * May be overridden.
     */
    public static pattern: RegExp = /\{(.*)\}/;

    /**
     * Delimter used to section string paths.
     * May be overridden.
     */
    public static delimiter: string = '/';

    /**
     * Collection of registered routes.
     */
    private routes: Route[] = [];

    /**
     * Detect if a route has already been registered.
     */
    private has(method: RouterMethod, path: string): boolean {
        const directories = normalizePath(path).split(Router.delimiter);
        
        return this.routes.some(route => {
            const routeDirectories = route.path.split(Router.delimiter);

            /**
             * Skip check if methods do not match.
             */
            if (method !== route.method) {
                return false;
            }

            /**
             * If paths contain identical amount of directories, continue check.
             */
            if (directories.length === routeDirectories.length) {
                return directories.every((directory, i) => {
                    /**
                     * Match if both directories are a parameter.
                     */
                    if (directory.match(Router.pattern) && routeDirectories[ i ].match(Router.pattern)) {
                        return true;
                    }

                    /**
                     * Match if both directories are an identical string.
                     */
                    if (directory === routeDirectories[ i ]) {
                        return true;
                    }
                });
            }
        });
    }

    /**
     * Registers a route.
     */
    private register<Resolution>(method: RouterMethod, path: string, middlewareOrAction: Middleware | Action<Resolution>, action?: Action<Resolution>) {
        path = normalizePath(path);

        /**
         * If route has already been registered, throw an Error.
         */
        if (this.has(method, path)) {
            throw new Error(`${ method } ${ path } has already been registered`);
        }

        /**
         * If middleware has been supplied, chain them together before the action.
         * Else use middleware as action.
         */
        if (Array.isArray(middlewareOrAction)) {
            this.routes.push({
                method,
                path,
                resolve: (...args) => Promise.all(middlewareOrAction.map(fn => fn(...args))).then(() => action(...args))
            });
        }
        else {
            this.routes.push({
                method,
                path,
                resolve: middlewareOrAction as Action<Resolution>
            });
        }
    }

    /**
     * Registers a CONNECT route.
     */
    public connect<Resolution>(path: string, middlewareOrAction: Middleware | Action<Resolution>, action?: Action<Resolution>): void {
        this.register(RouterMethod.CONNECT, path, middlewareOrAction, action);
    }

    /**
     * Registers a DELETE route.
     */
    public delete<Resolution>(path: string, middlewareOrAction: Middleware | Action<Resolution>, action?: Action<Resolution>): void {
        this.register(RouterMethod.DELETE, path, middlewareOrAction, action);
    }

    /**
     * Registers a GET route.
     */
    public get<Resolution>(path: string, middlewareOrAction: Middleware | Action<Resolution>, action?: Action<Resolution>): void {
        this.register(RouterMethod.GET, path, middlewareOrAction, action);
    }

    /**
     * Registers a HEAD route.
     */
    public head<Resolution>(path: string, middlewareOrAction: Middleware | Action<Resolution>, action?: Action<Resolution>): void {
        this.register(RouterMethod.HEAD, path, middlewareOrAction, action);
    }

    /**
     * Registers a OPTIONS route.
     */
    public options<Resolution>(path: string, middlewareOrAction: Middleware | Action<Resolution>, action?: Action<Resolution>): void {
        this.register(RouterMethod.OPTIONS, path, middlewareOrAction, action);
    }

    /**
     * Registers a PATCH route.
     */
    public patch<Resolution>(path: string, middlewareOrAction: Middleware | Action<Resolution>, action?: Action<Resolution>): void {
        this.register(RouterMethod.PATCH, path, middlewareOrAction, action);
    }

    /**
     * Registers a POST route.
     */
    public post<Resolution>(path: string, middlewareOrAction: Middleware | Action<Resolution>, action?: Action<Resolution>): void {
        this.register(RouterMethod.POST, path, middlewareOrAction, action);
    }

    /**
     * Registers a PUT route.
     */
    public put<Resolution>(path: string, middlewareOrAction: Middleware | Action<Resolution>, action?: Action<Resolution>): void {
        this.register(RouterMethod.PUT, path, middlewareOrAction, action);
    }

    /**
     * Registers a TRACE route.
     */
    public trace<Resolution>(path: string, middlewareOrAction: Middleware | Action<Resolution>, action?: Action<Resolution>): void {
        this.register(RouterMethod.TRACE, path, middlewareOrAction, action);
    }

    /**
     * Retrieves a registered route based on the method and the path.
     */
    public find(method: RouterMethod, path: string): Route | void {
        path = normalizePath(path);

        try {
            const simpleRoute = this.routes.find(route => route.method === method && route.path === path);

            /**
             * If route contains no parameters, return a "simple" route.
             */
            if (simpleRoute) {
                return simpleRoute;
            }

            const parameters = {};
            const complexRoute = this.routes
                .filter(route => route.method === method)
                .filter(route => route.path.split(Router.delimiter).length === path.split(Router.delimiter).length)
                .find(route => route.path.split(Router.delimiter).every((directory, i) => {

                    /**
                     * If directory is a paramter, register the value.
                     */
                    if (directory.match(Router.pattern)) {
                        parameters[ directory.match(Router.pattern)[ 1 ] ] = path.split(Router.delimiter)[ i ];
                        return true;
                    }

                    /**
                     * If directory is a regular string, continue.
                     */
                    if (directory === path.split(Router.delimiter)[ i ]) {
                        return true;
                    }

                    /**
                     * If directory doesn't match, reset parameters.
                     */
                    Object.keys(parameters).forEach(key => delete parameters[ key ]);

                    return false;
                }));

            /**
             * If no route matches provided criteria, return undefined.
             */
            if (!complexRoute) {
                return undefined;
            }

            return { 
                parameters,
                ...complexRoute
            };
        }
        catch (e) {
            return undefined;
        }
    }
}
