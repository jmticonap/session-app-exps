import { HttpResponse } from '../../domain/types/route';

export class MiddlewareManager {
    private _beforeMiddlewares: Array<(...args: any) => Promise<any>> = [];

    constructor() {}

    handler(fnt: (...args: any[]) => any) {
        return async (...argsHandler: any[]): Promise<HttpResponse> => {
            for (const mdw of this._beforeMiddlewares) {
                const mdwResult = await mdw(...argsHandler);

                if (mdwResult) return mdwResult;
            }

            return await fnt(...argsHandler);
        };
    }

    use(fnt: (...args: any) => Promise<any>) {
        this._beforeMiddlewares.push(fnt);

        return this;
    }
}

export const middleware = () => new MiddlewareManager();
