import { inject, singleton } from 'tsyringe';
import MysqlUserRepository from '../../infrastructure/repository/mysql-user.repository';
import UserRepository from '../../domain/repository/user.repository';
import { UserRequestDtoSchema } from '../../domain/dto/user-request.dto';
import UserEntity from '../../domain/entity/user.entity';
import { HttpRequest, HttpResponse } from '../../domain/types/route';
import ConsoleLogger from '../../infrastructure/logger/console.logger';
import { HTTP_STATUS } from '../../domain/constants';
import { BadRequestError, SchemaValidationError } from '../../domain/errors';
import Logger from '../../domain/logger';

const className = 'UserController';

@singleton()
export default class UserController {
    constructor(
        @inject(ConsoleLogger) private _logger: Logger,
        @inject(MysqlUserRepository) private _userRepository: UserRepository,
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

    async findAll(): Promise<HttpResponse> {
        try {
            return {
                statusCode: HTTP_STATUS['OK'],
                body: await this._userRepository.findAll(),
            };
        } catch (error) {
            this._logger.error({ className, method: 'findAll', error: <Error>error });
            if (error instanceof BadRequestError || error instanceof SchemaValidationError) {
                return error.errorResponse();
            }
            return {
                statusCode: HTTP_STATUS['INTERNAL_SERVER_ERROR'],
                body: { error },
            };
        }
    }

    async findById(req: HttpRequest): Promise<HttpResponse> {
        const method = 'findById';
        try {
            if (!req.pathParameters || !req.pathParameters['id']) throw new BadRequestError();
            const [id] = req.pathParameters['id'];

            this._logger.info({ className, method, object: { id }, message: 'QueryStringParams:' });

            return {
                statusCode: HTTP_STATUS['OK'],
                body: JSON.stringify(await this._userRepository.findById(+id)),
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

    async newUser(req: HttpRequest): Promise<HttpResponse> {
        const method = 'newUser';
        try {
            if (!req.body) throw new BadRequestError();
            const user = <UserEntity>JSON.parse(req.body);

            const isvalid = UserRequestDtoSchema.safeParse(user);
            if (!isvalid.success) {
                throw new SchemaValidationError(JSON.stringify(isvalid.error.errors));
            }

            return {
                statusCode: HTTP_STATUS['OK'],
                body: JSON.stringify(await this._userRepository.insert(user)),
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
}
