import { inject, singleton } from 'tsyringe';
import jwt from 'jsonwebtoken';
import { HttpRequest, HttpResponse } from '../../domain/types/route';
import MysqlUserRepository from '../../infrastructure/repository/mysql-user.repository';
import UserRepository from '../../domain/repository/user.repository';
import UserEntity from '../../domain/entity/user.entity';
import { validationSchemaBody } from '../../domain/decorators';
import { UserRequestDtoSchema } from '../../domain/dto/user-request.dto';
import ConsoleLogger from '../../infrastructure/logger/console/console.logger';
import { HTTP_STATUS } from '../../domain/constants';
import { BadRequestError, SchemaValidationError } from '../../domain/errors';
import Logger from '../../infrastructure/logger/logger';
import { PaginationParams } from '../../domain/types';
import { LoginUserRequestDtoSchema, LoginUserRequestDtoType } from '../../domain/dto/login-user-request.dto';
import { NewUserRequestDtoSchema, NewUserRequestDtoType } from '../../domain/dto/new-user-request.dto';
import SecretKeyError from '../../domain/errors/secret-key.error';
import ConfigurationRepository from '../../domain/repository/configuration.repository';
import EnvConfigurationRepository from '../../infrastructure/repository/env-configuration.repository';

const className = 'UserController';

@singleton()
export default class UserController {
    constructor(
        @inject(ConsoleLogger) private _logger: Logger,
        @inject(MysqlUserRepository) private _userRepository: UserRepository,
        @inject(EnvConfigurationRepository)
        private _configurationRepository: ConfigurationRepository,
    ) {}

    async greeting(req: HttpRequest): Promise<HttpResponse> {
        const method = 'greeting';
        try {
            return {
                statusCode: 200,
                body: { message: 'from greetings', headers: req.headers },
            };
        } catch (error) {
            this._logger.info({ className, method, error: <Error>error });
            throw error;
        }
    }

    async findAll(req: HttpRequest): Promise<HttpResponse> {
        const method = this.findAll.name;
        try {
            const pagParams: PaginationParams = {
                page: +(req.searchParams?.get('page') || '1'),
                limit: +(req.searchParams?.get('limit') || '10'),
            };

            return {
                statusCode: HTTP_STATUS['OK'],
                body: await this._userRepository.findAll(pagParams),
            };
        } catch (error) {
            this._logger.error({ className, method, error: <Error>error });
            if (error instanceof BadRequestError || error instanceof SchemaValidationError) {
                return error.errorResponse();
            }

            return {
                statusCode: HTTP_STATUS['INTERNAL_SERVER_ERROR'],
                body: error,
            };
        }
    }

    async findById(req: HttpRequest, ctx: Record<string, any>): Promise<HttpResponse> {
        const method = 'findById';
        try {
            if (!ctx || !ctx['id']) throw new BadRequestError();
            const id = ctx['id'];

            const body = await this._userRepository.findById(+id);

            this._logger.info({ className, method, object: body, message: 'QueryStringParams:' });

            return {
                statusCode: HTTP_STATUS['OK'],
                body,
            };
        } catch (error) {
            this._logger.error({ className, method, error: <Error>error });

            if (error instanceof BadRequestError || error instanceof SchemaValidationError)
                return error.errorResponse();

            return {
                statusCode: HTTP_STATUS['NOT_FOUND'],
                body: JSON.stringify(error),
            };
        }
    }

    @validationSchemaBody(UserRequestDtoSchema)
    async newUser(req: HttpRequest<UserEntity>): Promise<HttpResponse> {
        console.log('newUser');
        const method = 'newUser';
        try {
            if (!req.body) throw new BadRequestError();
            const user = req.body;
            const result = await this._userRepository.insert(user);

            return {
                statusCode: HTTP_STATUS['OK'],
                body: result,
            };
        } catch (error) {
            this._logger.error({ className, method, error: <Error>error });
            if (error instanceof BadRequestError || error instanceof SchemaValidationError) {
                return error.errorResponse();
            }

            return {
                statusCode: HTTP_STATUS['NOT_FOUND'],
                body: JSON.stringify(error),
            };
        }
    }

    @validationSchemaBody(NewUserRequestDtoSchema)
    async register(req: HttpRequest<NewUserRequestDtoType>): Promise<HttpResponse> {
        const method = this.register.name;
        try {
            if (!req.body) throw new BadRequestError();
            const userDto = req.body;
            const result = await this._userRepository.register(userDto);

            return {
                statusCode: HTTP_STATUS.CREATED,
                body: result,
            };
        } catch (error) {
            this._logger.error({ className, method, error: <Error>error });
            if (error instanceof BadRequestError || error instanceof SchemaValidationError) {
                return error.errorResponse();
            }

            return {
                statusCode: HTTP_STATUS.INTERNAL_SERVER_ERROR,
                body: JSON.stringify(error),
            };
        }
    }

    @validationSchemaBody(LoginUserRequestDtoSchema)
    async login(req: HttpRequest<LoginUserRequestDtoType>): Promise<HttpResponse> {
        const method = this.login.name;
        try {
            if (!req.body) throw new BadRequestError();
            const userDto = req.body;
            const cnf = this._configurationRepository.get();

            if (!cnf.jwt.secretKey) throw new SecretKeyError();

            const token = jwt.sign(userDto, cnf.jwt.secretKey, { expiresIn: cnf.jwt.expiredToken });

            return {
                statusCode: HTTP_STATUS.OK,
                body: { token },
            };
        } catch (e) {
            this._logger.error({ className, method, error: <Error>e });

            if (e instanceof BadRequestError || e instanceof SchemaValidationError || e instanceof SecretKeyError) {
                return e.errorResponse();
            }

            return {
                statusCode: HTTP_STATUS.INTERNAL_SERVER_ERROR,
                body: JSON.stringify(e),
            };
        }
    }
}
