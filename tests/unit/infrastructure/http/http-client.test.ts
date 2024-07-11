import { HTTP_STATUS } from '../../../../src/domain/constants';
import { UserRequestDtoType } from '../../../../src/domain/dto/user-request.dto';
import HttpClient from '../../../../src/infrastructure/http/http-client';

let sut: HttpClient;

const fetchData = async (timeout?: number) => {
    return await sut.get<string, UserRequestDtoType>('https://www.google.com/search', {
        headers: { 'content-type': 'application/json' },
        searchParams: {
            q: 'perro',
        },
        timeout,
    });
};

describe('HttpClient test suite', () => {
    beforeEach(() => {
        sut = new HttpClient();
    });

    describe('GET correct request', () => {
        it('should return some string in the BODY', async () => {
            const actual = await fetchData();

            expect(actual.body).toEqual(expect.any(String));
        });

        it('should return 200 as STATUS_CODE', async () => {
            const actual = await fetchData();

            expect(actual.statusCode).toBe(HTTP_STATUS['OK']);
        });
    });

    describe('ANY method TIMEOUT error', () => {
        it('should return timeout error with 1ms of timeout param', async () => {
            const timeout = 1;

            await expect(fetchData(timeout)).rejects.toThrow('Timeout error');
        });
    });
});
