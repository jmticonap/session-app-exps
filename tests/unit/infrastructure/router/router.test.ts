import 'reflect-metadata';
import Router, { RoutesController } from '../../../../src/infrastructure/router';
import { TestController } from './test.controller';
import { HttpRequest } from '../../../../src/domain/types/route';

describe('Router suite test', () => {
    describe('RoutesController', () => {
        let sut: RoutesController<any>;
        let testController: TestController;

        beforeEach(() => {
            testController = new TestController();
            sut = new RoutesController(testController);
        });

        afterEach(() => {
            jest.clearAllMocks();
        });

        it('should make an array of RouteType by each addRoute invokation', async () => {
            sut.addRoute({
                method: 'GET',
                path: '/test',
                handler: 'findAll',
            }).addRoute({
                method: 'GET',
                path: '/test/{ix}',
                handler: 'findAll',
            });

            const expected = [
                {
                    method: 'GET',
                    path: '/test',
                    handler: expect.any(Function),
                },
                {
                    method: 'GET',
                    path: '/test/{ix}',
                    handler: expect.any(Function),
                },
            ];

            expect(sut.routes).toEqual(expected);
        });

        it('should call 2 times addRouter and once the first handler', async () => {
            const addRouteMock = jest.spyOn(sut, 'addRoute');
            const findAllMock = jest.spyOn(testController, 'findAll');

            sut.addRoute({
                method: 'GET',
                path: '/test',
                handler: 'findAll',
            }).addRoute({
                method: 'GET',
                path: '/test/{ix}',
                handler: 'findAll',
            });

            const actual = await sut.routes[0].handler();
            const expected = [
                { name: 'Kobe', age: 46 },
                { name: 'Juan', age: 42 },
            ];

            expect(addRouteMock).toHaveBeenCalledTimes(2);
            expect(findAllMock).toHaveBeenCalledTimes(1);
            expect(actual).toEqual(expected);
        });
    });

    describe('Router', () => {
        let sut: Router;
        let testController: TestController;
        let routes: RoutesController<any>;

        beforeEach(() => {
            testController = new TestController();
            routes = new RoutesController(testController);
            sut = new Router([routes]);
        });

        afterEach(() => {
            jest.clearAllMocks();
        });

        describe('routeList', () => {
            it('should invoke console.log same times as routes length', () => {
                const logMock = jest.spyOn(console, 'log');
                routes
                    .addRoute({
                        method: 'GET',
                        path: '/test',
                        handler: 'findAll',
                    })
                    .addRoute({
                        method: 'GET',
                        path: '/test/{ix}',
                        handler: 'findAll',
                    });

                sut.routeList();

                expect(logMock).toHaveBeenCalledTimes(routes.routes.length);
            });
        });

        describe('pushRoutes', () => {
            it('should calls pushRoutes once with given arguments', () => {
                const pushRoutesMock = jest.spyOn(sut, 'pushRoutes');

                sut.pushRoutes([]);

                expect(pushRoutesMock).toHaveBeenCalledTimes(1);
                expect(pushRoutesMock).toHaveBeenCalledWith([]);
            });

            it('should returns the operator "this"', () => {
                const actual = sut.pushRoutes([]);

                expect(actual).toBe(sut);
            });
        });

        describe('execRequest', () => {
            it('should throw an error with path as null', async () => {
                const req: HttpRequest = {
                    method: 'GET',
                    url: '',
                    body: '',
                };

                await expect(sut.execRequest(req)).rejects.toThrow("Url can't be undefined, null or empty");
            });

            it('should resolves error response with no match route', async () => {
                routes
                    .addRoute({
                        method: 'GET',
                        path: '/test',
                        handler: 'findAll',
                    })
                    .addRoute({
                        method: 'GET',
                        path: '/test/{ix}',
                        handler: 'findAll',
                    });
                const req: HttpRequest = {
                    method: 'GET',
                    url: '/some/path',
                    body: '',
                };
                const expected = {
                    body: { error: 'The route must be diferent from undefined' },
                    statusCode: 500,
                };

                await expect(sut.execRequest(req)).resolves.toEqual(expected);
            });
        });
    });
});
