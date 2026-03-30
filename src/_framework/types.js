/**
 * @typedef {Object} Req
 * @property {string} route
 * @property {string} method
 * @property {Record<string, string>} params
 * @property {Record<string, string>} query
 * @property {Record<string, any>} body
 * @property {any} user
 * @property {boolean} isApi
 * @property {(key: string) => any} get
 * @property {(key: string) => boolean} has
 * @property {() => Object} all
 * @property {(name: string) => any} header
 */

/**
 * @typedef {Object} Res
 * @property {Record<string, any>} locals
 * @property {(code: number) => Res} status
 * @property {(content: any) => any} send
 * @property {(data: any) => Object} json
 * @property {(view: string, options?: Object) => any} render
 * @property {(url: string) => any} redirect
 * @property {(err: { code?: number, type: string, message: string, details?: any }) => Object} error
 */

/**
 * @typedef {(req: Req, res: Res, next: Function) => any} Middleware
 */

/**
 * @typedef {(err: any, req: Req, res: Res, next: Function) => any} ErrorMiddleware
 */