export type NextFunction = () => Promise<void>;

export interface ApplicationOptions {
  name?: string;
}

export type HeaderEntry = readonly [string, string];

export type HoaHeadersInit = Headers | Record<string, string> | Iterable<HeaderEntry>;

export interface AppJSON {
  name: string;
}

export interface ReqJSON {
  method: string;
  url: string;
  headers: Record<string, string>;
}

export interface ResJSON {
  status: number;
  statusText: string;
  headers: Record<string, string>;
}

export interface CtxJSON {
  app: AppJSON;
  req: ReqJSON;
  res: ResJSON;
}

export interface CtxOptions {
  request?: Request;
  env?: any;
  executionCtx?: any;
}

export interface HttpErrorOptions {
  message?: string;
  cause?: unknown;
  expose?: boolean;
  headers?: HoaHeadersInit;
}

export type HoaMiddleware<Ctx extends HoaContext = HoaContext> = (ctx: Ctx, next: NextFunction) => Promise<any> | any;

export declare class HttpError extends Error {
  constructor(status: number, message?: string | HttpErrorOptions, options?: HttpErrorOptions);
  readonly status: number;
  readonly statusCode: number;
  readonly expose: boolean;
  readonly headers?: Record<string, string>;
}

export declare class HoaContext {
  constructor(options?: CtxOptions);
  app: Application;
  req: HoaRequest;
  res: HoaResponse;
  request?: Request;
  env?: any;
  executionCtx?: any;
  state: Record<string, any>;
  throw(status: number, message?: string | HttpErrorOptions, options?: HttpErrorOptions): never;
  assert<T>(value: T, status: number, message?: string | HttpErrorOptions, options?: HttpErrorOptions): asserts value;
  onerror(err: unknown): Response;
  toJSON(): CtxJSON;
}

export declare class HoaRequest {
  app: Application;
  ctx: HoaContext;
  res: HoaResponse;

  get url(): URL;
  set url(value: string | URL);

  get href(): string;
  set href(value: string);

  get origin(): string;
  set origin(value: string);

  get protocol(): string;
  set protocol(value: string);

  get host(): string;
  set host(value: string);

  get hostname(): string;
  set hostname(value: string);

  get port(): string;
  set port(value: string);

  get pathname(): string;
  set pathname(value: string);

  get search(): string;
  set search(value: string);

  get hash(): string;
  set hash(value: string);

  get method(): string;
  set method(value: string);

  get query(): Record<string, string | string[]>;
  set query(value: Record<string, string | readonly string[]>);

  get headers(): Record<string, string>;
  set headers(value: HoaHeadersInit);

  get body(): ReadableStream<Uint8Array> | null;
  set body(value: any);

  get(field: string): string | null;
  getSetCookie(): string[];
  has(field: string): boolean;
  set(field: string, value: string): void;
  set(values: Record<string, string>): void;
  append(field: string, value: string): void;
  append(values: Record<string, string>): void;
  delete(field: string): void;

  get ips(): string[];
  get ip(): string;

  get length(): number | null;

  get type(): string | null;

  blob(): Promise<Blob>;
  arrayBuffer(): Promise<ArrayBuffer>;
  text(): Promise<string>;
  json<T = any>(): Promise<T>;
  formData(): Promise<FormData>;
  toJSON(): ReqJSON;
}

export type ResponseBody =
  | string
  | Blob
  | ArrayBuffer
  | ArrayBufferView
  | ReadableStream<any>
  | FormData
  | URLSearchParams
  | Response
  | Record<string, any>
  | null
  | undefined;

export declare class HoaResponse {
  app: Application;
  ctx: HoaContext;
  req: HoaRequest;

  get headers(): Record<string, string>;
  set headers(value: HoaHeadersInit);

  get(field: string): string | null;
  getSetCookie(): string[];
  has(field: string): boolean;
  set(field: string, value: string): void;
  set(values: Record<string, string>): void;
  append(field: string, value: string): void;
  append(values: Record<string, string>): void;
  delete(field: string): void;

  get status(): number;
  set status(value: number);

  get statusText(): string;
  set statusText(value: string);

  get body(): ResponseBody;
  set body(value: ResponseBody);

  redirect(url: string): void;
  back(alt?: string): void;

  get type(): string | null;
  set type(value: string);

  get length(): number | null;
  set length(value: number | string);

  toJSON(): ResJSON;
}

export declare class Application {
  constructor(options?: ApplicationOptions);

  name: string;
  readonly HoaContext: typeof HoaContext;
  readonly HoaRequest: typeof HoaRequest;
  readonly HoaResponse: typeof HoaResponse;
  readonly middlewares: HoaMiddleware[];

  extend(fn: (app: Application) => void): this;
  use(fn: HoaMiddleware): this;
  fetch(request: Request, env?: any, executionCtx?: any): Promise<Response>;
  protected handleRequest(ctx: HoaContext, middlewareFn: (ctx: HoaContext) => Promise<void>): Promise<Response>;
  protected createContext(request: Request, env?: any, executionCtx?: any): HoaContext;
  protected onerror(err: unknown, ctx?: HoaContext): void;
  toJSON(): AppJSON;

  static get default(): typeof Application;
}

export declare function compose<Ctx extends HoaContext = HoaContext>(
  middlewares: ReadonlyArray<HoaMiddleware<Ctx>> | ReadonlyArray<ReadonlyArray<HoaMiddleware<Ctx>>>
): (ctx: Ctx, next?: NextFunction) => Promise<void>;

export {
  ApplicationOptions,
  AppJSON,
  CtxJSON,
  CtxOptions,
  HoaHeadersInit,
  HoaMiddleware,
  HttpErrorOptions,
  ReqJSON,
  ResJSON,
  NextFunction,
  ResponseBody
};

export { Application as Hoa, HoaContext, HoaRequest, HoaResponse, HttpError, compose };

export default Application;
