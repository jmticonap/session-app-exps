export default interface UnitOfWork {
    beginTransaction(): Promise<void>;
    savePoint(pointName: string): Promise<void>;
    commit(): Promise<void>;
    rollback(): Promise<void>;
    rollback(pointName: string): Promise<void>;
}
