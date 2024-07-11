import { MiddlewareManager, middleware } from '../../../../src/infrastructure/middleware-manager';

describe('MiddlewareManager suite test', () => {
    let sut: MiddlewareManager;

    beforeEach(() => {
        sut = middleware();
    });

    it('should show parameters pass throw middles and handler', async () => {
        const useFntMock = jest.fn();
        const handlerFntMock = jest.fn();

        const handler = sut.use(useFntMock).handler(handlerFntMock);
        const param = 'parametro';
        await handler(param);

        expect(useFntMock).toHaveBeenCalledWith(param);
        expect(handlerFntMock).toHaveBeenCalledWith(param);
    });

    it('should show the change in parameters throw middles and handler', async () => {
        const param = { value: 'parametro' };
        const param1 = { value: 'change param' };
        const objUse = {
            useFnt: (param: { value: string }) => {
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                param.value = 'change param';
                return new Promise<any>((resolve) => resolve(undefined));
            },
        };

        const useFntSpy = jest.spyOn(objUse, 'useFnt');
        const handlerFntMock = jest.fn();

        const handler = sut.use(objUse.useFnt).handler(handlerFntMock);

        await handler(param, 'foo');

        expect(useFntSpy).toHaveBeenCalledWith(param, 'foo');
        expect(handlerFntMock).toHaveBeenCalledWith(param1, 'foo');
    });
});
