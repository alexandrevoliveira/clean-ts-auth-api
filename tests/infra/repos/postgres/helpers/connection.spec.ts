import { PgUser } from '@/infra/repos/postgres/entities'
import { ConnectionNotFoundError, PgConnection, TransactionNotFoundError } from '@/infra/repos/postgres/helpers'

import { DataSource } from 'typeorm'

jest.mock('typeorm', () => ({
  Entity: jest.fn(),
  PrimaryGeneratedColumn: jest.fn(),
  Column: jest.fn(),
  DataSource: jest.fn()
}))

describe('PgConnection', () => {
  let initializeSpy: jest.Mock
  let destroySpy: jest.Mock
  let createQueryRunnerSpy: jest.Mock
  let startTransactionSpy: jest.Mock
  let releaseSpy: jest.Mock
  let commitTransactionSpy: jest.Mock
  let rollbackTransactionSpy: jest.Mock
  let queryRunnerGetRepositorySpy: jest.Mock
  let dataSourceGetRepositorySpy: jest.Mock
  let newDataSourceSpy: jest.Mock
  let dataSourceInstance: any
  let sut: PgConnection

  beforeAll(() => {
    startTransactionSpy = jest.fn()
    releaseSpy = jest.fn()
    commitTransactionSpy = jest.fn()
    rollbackTransactionSpy = jest.fn()
    queryRunnerGetRepositorySpy = jest.fn().mockReturnValue('any_repo')
    createQueryRunnerSpy = jest.fn().mockReturnValue({
      startTransaction: startTransactionSpy,
      release: releaseSpy,
      commitTransaction: commitTransactionSpy,
      rollbackTransaction: rollbackTransactionSpy,
      manager: { getRepository: queryRunnerGetRepositorySpy }
    })
    initializeSpy = jest.fn(async () => {
      dataSourceInstance.isInitialized = true
      return dataSourceInstance
    })
    destroySpy = jest.fn(async () => {
      dataSourceInstance.isInitialized = false
    })
    dataSourceGetRepositorySpy = jest.fn().mockReturnValue('any_repo')
    newDataSourceSpy = jest.fn(() => {
      dataSourceInstance = {
        isInitialized: false,
        initialize: initializeSpy,
        destroy: destroySpy,
        createQueryRunner: createQueryRunnerSpy,
        getRepository: dataSourceGetRepositorySpy
      }
      return dataSourceInstance
    })
    jest.mocked(DataSource).mockImplementation(newDataSourceSpy as any)
  })

  beforeEach(() => {
    sut = PgConnection.getInstance()
  })

  it('should have only one instance (singleton)', () => {
    const sut2 = PgConnection.getInstance()

    expect(sut).toBe(sut2)
  })

  it('should create a new connection', async () => {
    await sut.connect()

    expect(newDataSourceSpy).toHaveBeenCalledTimes(1)
    expect(initializeSpy).toHaveBeenCalledTimes(1)
  })

  it('should reuse an existing connection', async () => {
    await sut.connect()

    expect(newDataSourceSpy).not.toHaveBeenCalled()
    expect(initializeSpy).not.toHaveBeenCalled()
  })

  it('should close connection', async () => {
    await sut.connect()
    await sut.disconnect()

    expect(destroySpy).toHaveBeenCalledWith()
    expect(destroySpy).toHaveBeenCalledTimes(1)
  })

  it('should return ConnectionNotFoundError on disconnect if connection is not found', async () => {
    const promise = sut.disconnect()

    expect(destroySpy).not.toHaveBeenCalled()
    await expect(promise).rejects.toThrow(new ConnectionNotFoundError())
  })

  it('should open transaction', async () => {
    await sut.connect()
    await sut.openTransaction()

    expect(startTransactionSpy).toHaveBeenCalledWith()
    expect(startTransactionSpy).toHaveBeenCalledTimes(1)
    expect(createQueryRunnerSpy).toHaveBeenCalledWith()
    expect(createQueryRunnerSpy).toHaveBeenCalledTimes(1)

    await sut.disconnect()
  })

  it('should return ConnectionNotFoundError on openTransaction if connection is not found', async () => {
    const promise = sut.openTransaction()

    expect(startTransactionSpy).not.toHaveBeenCalled()
    await expect(promise).rejects.toThrow(new ConnectionNotFoundError())
  })

  it('should close transaction', async () => {
    await sut.connect()
    await sut.openTransaction()
    await sut.closeTransaction()

    expect(releaseSpy).toHaveBeenCalledWith()
    expect(releaseSpy).toHaveBeenCalledTimes(1)

    await sut.disconnect()
  })

  it('should return TransactionNotFoundError on closeTransaction if queryRunner is not found', async () => {
    const promise = sut.closeTransaction()

    expect(releaseSpy).not.toHaveBeenCalled()
    await expect(promise).rejects.toThrow(new TransactionNotFoundError())
  })

  it('should commit transaction', async () => {
    await sut.connect()
    await sut.openTransaction()
    await sut.commit()

    expect(commitTransactionSpy).toHaveBeenCalledWith()
    expect(commitTransactionSpy).toHaveBeenCalledTimes(1)

    await sut.disconnect()
  })

  it('should return TransactionNotFoundError on commit if queryRunner is not found', async () => {
    const promise = sut.commit()

    expect(commitTransactionSpy).not.toHaveBeenCalled()
    await expect(promise).rejects.toThrow(new TransactionNotFoundError())
  })

  it('should rollback transaction', async () => {
    await sut.connect()
    await sut.openTransaction()
    await sut.rollback()

    expect(rollbackTransactionSpy).toHaveBeenCalledWith()
    expect(rollbackTransactionSpy).toHaveBeenCalledTimes(1)

    await sut.disconnect()
  })

  it('should return TransactionNotFoundError on rollback if queryRunner is not found', async () => {
    const promise = sut.rollback()

    expect(rollbackTransactionSpy).not.toHaveBeenCalled()
    await expect(promise).rejects.toThrow(new TransactionNotFoundError())
  })

  it('should get repository from queryRunner', async () => {
    await sut.connect()
    await sut.openTransaction()
    const repository = sut.getRepository(PgUser)

    expect(queryRunnerGetRepositorySpy).toHaveBeenCalledWith(PgUser)
    expect(queryRunnerGetRepositorySpy).toHaveBeenCalledTimes(1)
    expect(repository).toBe('any_repo')

    await sut.disconnect()
  })

  it('should get repository', async () => {
    await sut.connect()
    const repository = sut.getRepository(PgUser)

    expect(dataSourceGetRepositorySpy).toHaveBeenCalledWith(PgUser)
    expect(dataSourceGetRepositorySpy).toHaveBeenCalledTimes(1)
    expect(repository).toBe('any_repo')

    await sut.disconnect()
  })

  it('should return ConnectionNotFoundError on getRepository if connection is not found', async () => {
    expect(dataSourceGetRepositorySpy).not.toHaveBeenCalled()
    expect(() => sut.getRepository(PgUser)).toThrow(new ConnectionNotFoundError())
  })
})
