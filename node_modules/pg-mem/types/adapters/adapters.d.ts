import { LibAdapters, IMemoryDb } from '../interfaces';
export declare class Adapters implements LibAdapters {
    private db;
    private _mikroPatched?;
    constructor(db: IMemoryDb);
    createPg(queryLatency?: number): {
        Pool: any;
        Client: any;
    };
    /**
     * @deprecated Use `createTypeormDataSource` instead.
     */
    createTypeormConnection(postgresOptions: any, queryLatency?: number): any;
    createTypeormDataSource(postgresOptions: any, queryLatency?: number): any;
    createSlonik(queryLatency?: number): any;
    createPgPromise(queryLatency?: number): any;
    createPgNative(queryLatency?: number): {
        new (): {
            connect(a: any, b: any): Promise<void>;
            connectSync(): void;
            prepare(name: string, sql: string, npar: number, callback: any): Promise<void>;
            prepareSync(name: string, sql: string, npar: number): void;
            execute(name: string, a: any, b: any): Promise<void>;
            executeSync(name: string, pars?: any): any[];
            query(sql: string, b: any, c: any): Promise<void>;
            querySync(sql: string, params: any[]): any[];
        };
    };
    createKnex(queryLatency?: number, knexConfig?: object): any;
    createMikroOrm(mikroOrmOptions: any, queryLatency?: number): Promise<any>;
}
//# sourceMappingURL=adapters.d.ts.map