interface AppJSON {
  name: string;
}

interface CtxJSON {
  app: AppJSON;
  req: ReqJSON;
  res: ResJSON;
}

interface ReqJSON {
  method: string;
  url: string;
  headers: Record<string, string>;
}

interface ResJSON {
  status: number;
  statusText: string;
  headers: Record<string, string>;
}

export type HoaExtend = (app: Hoa) => void;

export type HoaMiddleware = (ctx: HoaContext, next?: () => Promise<void>) => Promise<void> | void;

export declare class Hoa {
  constructor(options?: { name?: string });

  name: string;
  silent?: boolean;
  readonly HoaContext: typeof HoaContext;
  readonly HoaRequest: typeof HoaRequest;
  readonly HoaResponse: typeof HoaResponse;
  readonly middlewares: HoaMiddleware[];

  extend(fn: HoaExtend): this;
  use(fn: HoaMiddleware): this;
  fetch(request: Request, env?: any, executionCtx?: any): Promise<Response>;
  protected handleRequest(ctx: HoaContext, middlewareFn: HoaMiddleware): Promise<Response>;
  protected createContext(request: Request, env?: any, executionCtx?: any): HoaContext;
  protected onerror(err: unknown, ctx?: HoaContext): void;
  toJSON(): AppJSON;

  static get default(): typeof Hoa;
}

export declare class HoaContext {
  constructor(options?: { request?: Request; env?: any; executionCtx?: any });
  app: Hoa;
  req: HoaRequest;
  res: HoaResponse;
  request?: Request;
  env?: any;
  executionCtx?: any;
  state: Record<string, any>;
  throw(status: number, message?: string | { message?: string; cause?: unknown; expose?: boolean; headers?: Headers | Record<string, string> | Iterable<readonly [string, string]> }, options?: { message?: string; cause?: unknown; expose?: boolean; headers?: Headers | Record<string, string> | Iterable<readonly [string, string]> }): never;
  assert<T>(value: T, status: number, message?: string | { message?: string; cause?: unknown; expose?: boolean; headers?: Headers | Record<string, string> | Iterable<readonly [string, string]> }, options?: { message?: string; cause?: unknown; expose?: boolean; headers?: Headers | Record<string, string> | Iterable<readonly [string, string]> }): asserts value is NonNullable<T>;
  onerror(err: unknown): Response;
  toJSON(): CtxJSON;
}

export declare class HoaRequest {
  app: Hoa;
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
  set query(value: Record<string, string | string[]>);

  get headers(): Record<string, string>;
  set headers(value: Headers | Record<string, string> | Iterable<readonly [string, string]>);

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

type ResponseBody =
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
  app: Hoa;
  ctx: HoaContext;
  req: HoaRequest;

  get headers(): Record<string, string>;
  set headers(value: Headers | Record<string, string> | Iterable<readonly [string, string]>);

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

export declare class HttpError extends Error {
  constructor(
    status: number,
    message?: string | { message?: string; cause?: unknown; expose?: boolean; headers?: Headers | Record<string, string> | Iterable<readonly [string, string]> },
    options?: { message?: string; cause?: unknown; expose?: boolean; headers?: Headers | Record<string, string> | Iterable<readonly [string, string]> }
  );
  readonly name: string;
  readonly status: number;
  readonly statusCode: number;
  readonly expose: boolean;
  readonly headers?: Record<string, string>;
}

export declare function compose(
  middlewares: ReadonlyArray<HoaMiddleware> | ReadonlyArray<ReadonlyArray<HoaMiddleware>>
): HoaMiddleware;

export default Hoa;
