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

export type JwtConfiguration = {
    secretKey: string | undefined;
    expiredToken: string;
};

export type Configuration = {
    nodeEnv: NodeEnvType;
    server: EnvConfiguration<ServerConfiguration>;
    mysql: EnvConfiguration<MysqlConfiguration>;
    jwt: JwtConfiguration;
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

export type LogLevel = 'INFO' | 'WARN' | 'ERROR' | 'DEBUG';

export type PaginationParams = {
    page: number;
    limit: number;
};

export type ResponsePage<T> = {
    data: T[];
    count: number;
    pages: number;
    limit: number;
    current: number;
};
