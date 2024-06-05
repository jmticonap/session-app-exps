import { Handler } from '../../domain/types/route';

export default class HandlerRoute<T> {
    private _middlewares: Array<Handler | HandlerRoute<T>> = [];
    private _handler: Handler | undefined;

    constructor(handler?: Handler) {
        if (handler) this._handler = handler;
    }

    use(handler: Handler | HandlerRoute<T>) {
        this._middlewares.push(handler);

        return this;
    }

    handler(handler: Handler) {
        this._handler = handler;
    }

    getHandlers(): { handler: Handler; middlewares: Array<Handler | HandlerRoute<T>> } {
        try {
            if (!this._handler) throw new Error('Handlder must be present');

            return { handler: this._handler, middlewares: this._middlewares };
        } catch (error) {
            throw error;
        }
    }
}
