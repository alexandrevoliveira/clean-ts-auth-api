import { DbTransaction } from '@/application/contracts'
import { ConnectionNotFoundError, TransactionNotFoundError } from '@/infra/repos/postgres/helpers'

import path from 'path'
import { DataSource, DataSourceOptions, ObjectLiteral, ObjectType, QueryRunner, Repository } from 'typeorm'

export class PgConnection implements DbTransaction {
  private static instance?: PgConnection
  private query?: QueryRunner
  private dataSource?: DataSource

  private constructor () {}

  static getInstance (): PgConnection {
    if (PgConnection.instance === undefined) PgConnection.instance = new PgConnection()
    return PgConnection.instance
  }

  async connect (dataSource?: DataSource): Promise<void> {
    if (this.dataSource?.isInitialized === true) return
    const source = dataSource ?? new DataSource(require(path.resolve('ormconfig.js')) as DataSourceOptions)
    this.dataSource = source.isInitialized ? source : await source.initialize()
  }

  async disconnect (): Promise<void> {
    if (this.dataSource === undefined) throw new ConnectionNotFoundError()
    await this.dataSource.destroy()
    this.query = undefined
    this.dataSource = undefined
  }

  async openTransaction (): Promise<void> {
    if (this.dataSource === undefined) throw new ConnectionNotFoundError()
    this.query = this.dataSource.createQueryRunner()
    await this.query.startTransaction()
  }

  async closeTransaction (): Promise<void> {
    if (this.query === undefined) throw new TransactionNotFoundError()
    await this.query.release()
  }

  async commit (): Promise<void> {
    if (this.query === undefined) throw new TransactionNotFoundError()
    await this.query.commitTransaction()
  }

  async rollback (): Promise<void> {
    if (this.query === undefined) throw new TransactionNotFoundError()
    await this.query.rollbackTransaction()
  }

  getRepository<Entity extends ObjectLiteral> (entity: ObjectType<Entity>): Repository<Entity> {
    if (this.dataSource === undefined) throw new ConnectionNotFoundError()
    if (this.query !== undefined) return this.query.manager.getRepository(entity)
    return this.dataSource.getRepository(entity)
  }
}
