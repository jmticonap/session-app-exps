export type NodeEnvType = 'live' | 'test';

export type EnvConfiguration<T> = {
    [key in NodeEnvType]: T;
};

export type MysqlConfiguration = {
    host: string;
    port: number;
    user: string;
    password: string;
    database: string;
};

export type ServerConfiguration = {
    host: string;
    port: number;
};

export type Configuration = {
    nodeEnv: NodeEnvType;
    server: EnvConfiguration<ServerConfiguration>;
    mysql: EnvConfiguration<MysqlConfiguration>;
};

// LOGGER TYPES
export type LoggerAttributeType = {
    className?: string;
    method?: string;
    execTime?: { time: number; unit?: 's' | 'ms' };
    message?: string;
    object?: object;
    error?: Error;
};

export type HttpStatusCodeKey =
    | 'CONTINUE'
    | 'SWITCHING_PROTOCOLS'
    | 'PROCESSING'
    | 'OK'
    | 'CREATED'
    | 'ACCEPTED'
    | 'NON_AUTHORITATIVE'
    | 'NO_CONTENT'
    | 'RESET_CONTENT'
    | 'PARTIAL_CONTENT'
    | 'MULTI_STATUS'
    | 'ALREADY_REPORTED'
    | 'IM_USED'
    | 'MULTIPLE_CHOICES'
    | 'MOVED_PERMANENTLY'
    | 'MOVED_TEMPORARILY'
    | 'SEE_OTHER'
    | 'NOT_MODIFIED'
    | 'USE_PROXY'
    | 'TEMPORARY_REDIRECT'
    | 'PERMANENT_REDIRECT'
    | 'BAD_REQUEST'
    | 'UNAUTHORIZED'
    | 'PAYMENT_REQUIRED'
    | 'FORBIDDEN'
    | 'NOT_FOUND'
    | 'METHOD_NOT_ALLOWED'
    | 'NOT_ACCEPTABLE'
    | 'PROXY_AUTHENTICATION_REQUIRED'
    | 'REQUEST_TIME_OUT'
    | 'CONFLICT'
    | 'GONE'
    | 'LENGTH_REQUIRED'
    | 'PRECONDITION_FAILED'
    | 'REQUEST_ENTITY_TOO_LARGE'
    | 'REQUEST_URI_TOO_LARGE'
    | 'UNSUPPORTED_MEDIA_TYPE'
    | 'RANGE_NOT_SATISFIABLE'
    | 'EXPECTATION_FAILED'
    | 'IM_A_TEAPOT'
    | 'MISDIRECTED_REQUEST'
    | 'UNPROCESSABLE_ENTITY'
    | 'LOCKED'
    | 'FAILED_DEPENDENCY'
    | 'TOO_EARLY'
    | 'UPGRADE_REQUIRED'
    | 'PRECONDITION_REQUIRED'
    | 'TOO_MANY_REQUESTS'
    | 'REQUEST_HEADER_FIELDS_TOO_LARGE'
    | 'UNAVAILABLE_FOR_LEGAL_REASONS'
    | 'INTERNAL_SERVER_ERROR'
    | 'NOT_IMPLEMENTED'
    | 'BAD_GATEWAY'
    | 'SERVICE_UNAVAILABLE'
    | 'GATEWAY_TIME_OUT'
    | 'VERSION_NOT_SUPPORTED'
    | 'VARIANT_ALSO_VARIES'
    | 'INSUFFICIENT_STORAGE'
    | 'LOOP_DETECTED'
    | 'NOT_EXTENDED'
    | 'NETWORK_AUTHENTICATION_REQUIRED';
