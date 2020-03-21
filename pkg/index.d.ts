declare type Action<Resolution> = <Request, Parameters, Response>(request: Request, params?: Parameters, response?: Response) => Promise<Resolution>;
declare type Middleware = Action<unknown>[];
export declare enum RouterMethod {
    CONNECT = "CONNECT",
    DELETE = "DELETE",
    GET = "GET",
    HEAD = "HEAD",
    OPTIONS = "OPTIONS",
    PATCH = "PATCH",
    POST = "POST",
    PUT = "PUT",
    TRACE = "TRACE"
}
export interface Route {
    method: RouterMethod;
    parameters?: {
        [key: string]: string;
    };
    path: string;
    resolve: Action<unknown>;
}
export declare class Router {
    static pattern: RegExp;
    static delimiter: string;
    private routes;
    private has;
    private register;
    connect<Resolution>(path: string, middlewareOrAction: Middleware | Action<Resolution>, action?: Action<Resolution>): void;
    delete<Resolution>(path: string, middlewareOrAction: Middleware | Action<Resolution>, action?: Action<Resolution>): void;
    get<Resolution>(path: string, middlewareOrAction: Middleware | Action<Resolution>, action?: Action<Resolution>): void;
    head<Resolution>(path: string, middlewareOrAction: Middleware | Action<Resolution>, action?: Action<Resolution>): void;
    options<Resolution>(path: string, middlewareOrAction: Middleware | Action<Resolution>, action?: Action<Resolution>): void;
    patch<Resolution>(path: string, middlewareOrAction: Middleware | Action<Resolution>, action?: Action<Resolution>): void;
    post<Resolution>(path: string, middlewareOrAction: Middleware | Action<Resolution>, action?: Action<Resolution>): void;
    put<Resolution>(path: string, middlewareOrAction: Middleware | Action<Resolution>, action?: Action<Resolution>): void;
    trace<Resolution>(path: string, middlewareOrAction: Middleware | Action<Resolution>, action?: Action<Resolution>): void;
    find(method: RouterMethod, path: string): Route | void;
}
export {};
