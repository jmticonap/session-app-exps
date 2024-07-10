import http from 'node:http';

export type HandlerIndex = (
    req: http.IncomingMessage,
    res: http.ServerResponse<http.IncomingMessage> & {
        req: http.IncomingMessage;
    },
) => any;

export const switchMiddleware = () => {
    return async (req: http.IncomingMessage) => {
        console.log('Client IP:', req.socket.remoteAddress);
        // TODO: implement
    };
};
