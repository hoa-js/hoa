interface HoaAppJson {
  name: string;
}

interface HoaContextJson {
  app: HoaAppJson;
  req: HoaRequestJson;
  res: HoaResponseJson;
}

interface HoaRequestJson {
  method: string;
  url: string;
  headers: Record<string, string>;
}

interface HoaResponseJson {
  status: number;
  statusText: string;
  headers: Record<string, string>;
}

interface HoaError {
  message?: string;
  cause?: unknown;
  expose?: boolean;
  headers?: Headers | Record<string, string> | Iterable<readonly [string, string]>;
}

export type HoaExtension = (app: Hoa) => void;

export type HoaMiddleware = (ctx: HoaContext, next?: () => Promise<void>) => Promise<void> | void;

export declare class Hoa {
  constructor(options?: { name?: string });

  name: string;
  silent?: boolean;
  readonly HoaContext: typeof HoaContext;
  readonly HoaRequest: typeof HoaRequest;
  readonly HoaResponse: typeof HoaResponse;
  readonly middlewares: HoaMiddleware[];

  extend(fn: HoaExtension): this;
  use(fn: HoaMiddleware): this;
  fetch(request: Request, env?: any, executionCtx?: any): Promise<Response>;
  protected handleRequest(ctx: HoaContext, middlewareFn: HoaMiddleware): Promise<Response>;
  protected createContext(request: Request, env?: any, executionCtx?: any): HoaContext;
  protected onerror(err: unknown, ctx?: HoaContext): void;
  toJSON(): HoaAppJson;

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
  throw(status: number, message?: string | HoaError, options?: HoaError): never;
  assert<T>(value: T, status: number, message?: string | HoaError, options?: HoaError): asserts value is NonNullable<T>;
  onerror(err: unknown): Response;
  toJSON(): HoaContextJson;
  readonly response: Response;
}

export declare class HoaRequest {
  app: Hoa;
  ctx: HoaContext;
  res: HoaResponse;

  get url(): URL;
  set url(val: string | URL);

  get href(): string;
  set href(val: string);

  get origin(): string;
  set origin(val: string);

  get protocol(): string;
  set protocol(val: string);

  get host(): string;
  set host(val: string);

  get hostname(): string;
  set hostname(val: string);

  get port(): string;
  set port(val: string);

  get pathname(): string;
  set pathname(val: string);

  get search(): string;
  set search(val: string);

  get hash(): string;
  set hash(val: string);

  get method(): string;
  set method(val: string);

  get query(): Record<string, string | string[]>;
  set query(val: Record<string, string | string[]>);

  get headers(): Record<string, string>;
  set headers(val: Headers | Record<string, string> | Iterable<readonly [string, string]>);

  get body(): ReadableStream<Uint8Array> | null;
  set body(val: any);

  get(field: string): string | null;
  getSetCookie(): string[];
  has(field: string): boolean;
  set(field: string, val: string): void;
  set(field: Record<string, string>): void;
  append(field: string, val: string): void;
  append(field: Record<string, string>): void;
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
  toJSON(): HoaRequestJson;
}

type HoaResponseBody =
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
  set headers(val: Headers | Record<string, string> | Iterable<readonly [string, string]>);

  get(field: string): string | null;
  getSetCookie(): string[];
  has(field: string): boolean;
  set(field: string, val: string): void;
  set(field: Record<string, string>): void;
  append(field: string, val: string): void;
  append(field: Record<string, string>): void;
  delete(field: string): void;

  get status(): number;
  set status(val: number);

  get statusText(): string;
  set statusText(val: string);

  get body(): HoaResponseBody;
  set body(val: HoaResponseBody);

  redirect(url: string): void;
  back(alt?: string): void;

  get type(): string | null;
  set type(val: string);

  get length(): number | null;
  set length(val: number | string);

  toJSON(): HoaResponseJson;
}

export declare class HttpError extends Error {
  constructor(
    status: number,
    message?: string | HoaError,
    options?: HoaError
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
