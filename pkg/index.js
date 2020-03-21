"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var RouterMethod;
(function (RouterMethod) {
    RouterMethod["CONNECT"] = "CONNECT";
    RouterMethod["DELETE"] = "DELETE";
    RouterMethod["GET"] = "GET";
    RouterMethod["HEAD"] = "HEAD";
    RouterMethod["OPTIONS"] = "OPTIONS";
    RouterMethod["PATCH"] = "PATCH";
    RouterMethod["POST"] = "POST";
    RouterMethod["PUT"] = "PUT";
    RouterMethod["TRACE"] = "TRACE";
})(RouterMethod = exports.RouterMethod || (exports.RouterMethod = {}));
function normalizePath(path) {
    return (path.replace(new RegExp(`${Router.delimiter}$`), '') || Router.delimiter).replace(/\s/g, '');
}
class Router {
    constructor() {
        this.routes = [];
    }
    has(method, path) {
        const directories = normalizePath(path).split(Router.delimiter);
        return this.routes.some(route => {
            const routeDirectories = route.path.split(Router.delimiter);
            if (method !== route.method) {
                return false;
            }
            if (directories.length === routeDirectories.length) {
                return directories.every((directory, i) => {
                    if (directory.match(Router.pattern) && routeDirectories[i].match(Router.pattern)) {
                        return true;
                    }
                    if (directory === routeDirectories[i]) {
                        return true;
                    }
                });
            }
        });
    }
    register(method, path, middlewareOrAction, action) {
        path = normalizePath(path);
        if (this.has(method, path)) {
            throw new Error(`${method} ${path} has already been registered`);
        }
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
                resolve: middlewareOrAction
            });
        }
    }
    connect(path, middlewareOrAction, action) {
        this.register(RouterMethod.CONNECT, path, middlewareOrAction, action);
    }
    delete(path, middlewareOrAction, action) {
        this.register(RouterMethod.DELETE, path, middlewareOrAction, action);
    }
    get(path, middlewareOrAction, action) {
        this.register(RouterMethod.GET, path, middlewareOrAction, action);
    }
    head(path, middlewareOrAction, action) {
        this.register(RouterMethod.HEAD, path, middlewareOrAction, action);
    }
    options(path, middlewareOrAction, action) {
        this.register(RouterMethod.OPTIONS, path, middlewareOrAction, action);
    }
    patch(path, middlewareOrAction, action) {
        this.register(RouterMethod.PATCH, path, middlewareOrAction, action);
    }
    post(path, middlewareOrAction, action) {
        this.register(RouterMethod.POST, path, middlewareOrAction, action);
    }
    put(path, middlewareOrAction, action) {
        this.register(RouterMethod.PUT, path, middlewareOrAction, action);
    }
    trace(path, middlewareOrAction, action) {
        this.register(RouterMethod.TRACE, path, middlewareOrAction, action);
    }
    find(method, path) {
        path = normalizePath(path);
        try {
            const simpleRoute = this.routes.find(route => route.method === method && route.path === path);
            if (simpleRoute) {
                return simpleRoute;
            }
            const parameters = {};
            const complexRoute = this.routes
                .filter(route => route.method === method)
                .filter(route => route.path.split(Router.delimiter).length === path.split(Router.delimiter).length)
                .find(route => route.path.split(Router.delimiter).every((directory, i) => {
                if (directory.match(Router.pattern)) {
                    parameters[directory.match(Router.pattern)[1]] = path.split(Router.delimiter)[i];
                    return true;
                }
                if (directory === path.split(Router.delimiter)[i]) {
                    return true;
                }
                Object.keys(parameters).forEach(key => delete parameters[key]);
                return false;
            }));
            if (!complexRoute) {
                return undefined;
            }
            return Object.assign({ parameters }, complexRoute);
        }
        catch (e) {
            return undefined;
        }
    }
}
exports.Router = Router;
Router.pattern = /\{(.*)\}/;
Router.delimiter = '/';
