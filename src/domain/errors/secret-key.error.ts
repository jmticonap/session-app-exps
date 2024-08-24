import { SessionError } from '.';
import { HTTP_STATUS } from '../constants';

export default class SecretKeyError extends SessionError {
    constructor() {
        super('The secret key is missing', HTTP_STATUS['CONFLICT'], 'ERROR');
    }
}
