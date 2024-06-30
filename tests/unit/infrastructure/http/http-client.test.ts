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

    describe('body', () => {
        it('should return some string', async () => {
            const actual = await fetchData();

            expect(actual.body).toEqual(expect.any(String));
        });
    });

    describe('statusCode', () => {
        it('should return 200', async () => {
            const actual = await fetchData();

            expect(actual.statusCode).toBe(HTTP_STATUS['OK']);
        });
    });

    describe('timeout', () => {
        it('should return timeout error', async () => {
            await expect(fetchData(1)).rejects.toThrow('Timeout error');
        });
    });
});
