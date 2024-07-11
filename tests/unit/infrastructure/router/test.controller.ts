export class TestController {
    private _people: Array<{ name: string; age: number }> = [
        { name: 'Kobe', age: 46 },
        { name: 'Juan', age: 42 },
    ];

    async findAll(): Promise<Array<{ name: string; age: number }>> {
        return await new Promise((resolve) => {
            resolve(this._people);
        });
    }

    async findByIx(ix: number): Promise<{ name: string; age: number }> {
        return await new Promise((resolve, reject) => {
            try {
                const result = this._people[ix];
                resolve(result);
            } catch (error) {
                reject(error);
            }
        });
    }
}
