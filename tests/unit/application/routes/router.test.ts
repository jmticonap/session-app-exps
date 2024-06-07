import 'reflect-metadata';
import { HttpRequest, HttpResponse, Route } from '../../../../src/domain/types/route';
import Router, { handler } from '../../../../src/infrastructure/router';

describe('Router test suite', () => {
    const handlerTest = async (): Promise<HttpResponse> => {
        try {
            return {
                statusCode: 200,
                body: { message: 'test text' },
            };
        } catch (error) {
            throw error;
        }
    };
    const routes: Route<HttpRequest, HttpResponse>[] = [
        {
            method: 'GET',
            path: '/test/endpoint',
            handler: handler(handlerTest),
        },
    ];
    let sut: Router;

    jest.mock('../../../../src/infrastructure/logger/console.logger');
    jest.mock('../../../../src/application/routes/router');

    beforeEach(() => {
        sut = new Router();
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('shoult push correctly routes', () => {
        const pushRoutesSpy = jest.spyOn(sut, 'pushRoutes');

        sut.pushRoutes(routes);

        expect(pushRoutesSpy).toHaveBeenCalledTimes(1);
        expect(pushRoutesSpy).toHaveBeenCalledWith(routes);
    });

    describe('match', () => {
        it('should returns a true answer with the correct endpoint', () => {
            const actual = sut.match(routes[0].path, '/test/endpoint');

            expect(actual).toEqual({ match: true });
        });

        it('should returns a null answer with the incorrect endpoint', () => {
            const actual = sut.match(routes[0].path, '/test/endpoint_wrong');

            expect(actual).toBeNull;
        });
    });

    describe('execRequest', () => {
        it('should throw an error by send a null url', async () => {
            const req: HttpRequest = {
                method: 'GET',
                url: '',
                body: '',
            };

            await expect(sut.execRequest(req)).rejects.toThrow("Url can't be undefined, null or empty");
        });

        it('should returns a statusCode 500', async () => {
            const req: HttpRequest = {
                method: 'GET',
                url: '/test/endpoint',
                body: '',
            };
            const expected = {
                body: {
                    error: 'The route must be diferent from undefined',
                },
                statusCode: 500,
            };

            await expect(sut.execRequest(req)).resolves.toEqual(expected);
        });

        it('should throw an error if loadPathParameters fail', async () => {
            const req: HttpRequest = {
                method: 'GET',
                url: '/test/endpoint',
                body: '',
            };

            jest.spyOn(sut, 'loadPathParameters').mockImplementation(() => {
                throw new Error();
            });
            sut.pushRoutes(routes);

            const actual = await sut.execRequest(req);

            expect(actual.statusCode).toBe(500);
        });

        it('should returns the handler answare', async () => {
            const req: HttpRequest = {
                method: 'GET',
                url: '/test/endpoint',
                body: '',
            };
            const expected = {
                statusCode: 200,
                body: { message: 'test text' },
            };

            sut.pushRoutes(routes);

            await expect(sut.execRequest(req)).resolves.toEqual(expected);
        });

        it('should put the path parameters in the request', async () => {
            const req: HttpRequest = {
                method: 'GET',
                url: '/test/test_param/endpoint',
                body: '',
                pathParameters: {},
            };
            const expected = { param: 'test_param' };

            sut.pushRoutes([
                {
                    method: 'GET',
                    path: '/test/{param}/endpoint',
                    handler: handler(handlerTest),
                },
            ]);
            await sut.execRequest(req);

            expect(req.pathParameters).toEqual(expected);
        });
    });
});
