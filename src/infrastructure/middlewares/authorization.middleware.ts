import http from 'node:http';
import { HttpResponse } from '../../domain/types/route';
import { HEADERS, HTTP_STATUS } from '../../domain/constants';
import jwt from 'jsonwebtoken';
import { container } from 'tsyringe';
import EnvConfigurationRepository from '../repository/env-configuration.repository';
import ConfigurationRepository from '../../domain/repository/configuration.repository';

export const authorizationMiddleware = (req: http.IncomingMessage): HttpResponse | void => {
    const rawToken = req.headers.authorization?.replace(HEADERS.AUTHORIZATION_PATTERN_INIT, '');
    const errorMessage = 'Unauthorize 😕';
    if (!rawToken) {
        return {
            statusCode: HTTP_STATUS.UNAUTHORIZED,
            body: {
                error: errorMessage,
            },
        } as unknown as HttpResponse;
    }
    const confRepository = container.resolve<ConfigurationRepository>(EnvConfigurationRepository);
    const secretKey = confRepository.get().jwt.secretKey;
    if (!secretKey) {
        return {
            statusCode: HTTP_STATUS.INTERNAL_SERVER_ERROR,
            body: {
                error: 'Something went wrong 😅',
            },
        } as unknown as HttpResponse;
    }

    let result: object | undefined;
    jwt.verify(rawToken, secretKey, (err, user) => {
        if (err)
            result = {
                error: errorMessage,
                message: err.message,
            };
        req.headers['user'] = JSON.stringify(user);
    });

    if (result)
        return {
            statusCode: HTTP_STATUS.UNAUTHORIZED,
            body: result,
        } as unknown as HttpResponse;
};
