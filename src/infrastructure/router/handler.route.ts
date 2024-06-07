import { HandlerManager } from '.';

export default class HandlerRoute<T> {
    private _middlewares: Array<HandlerManager | HandlerRoute<T>> = [];
    private _handler: HandlerManager | undefined;

    constructor(handler?: HandlerManager) {
        if (handler) this._handler = handler;
    }

    use(handler: HandlerManager | HandlerRoute<T>) {
        this._middlewares.push(handler);

        return this;
    }

    handler(handler: HandlerManager) {
        this._handler = handler;
    }

    getHandlers(): { handler: HandlerManager; middlewares: Array<HandlerManager | HandlerRoute<T>> } {
        try {
            if (!this._handler) throw new Error('Handlder must be present');

            return { handler: this._handler, middlewares: this._middlewares };
        } catch (error) {
            throw error;
        }
    }
}
