import { PgRepository, PgUserAccountRepository } from '@/infra/repos/postgres'
import { PgUser } from '@/infra/repos/postgres/entities'
import { PgConnection } from '@/infra/repos/postgres/helpers'
import { makeFakeDb } from '@/tests/infra/repos/postgres/mocks'

import { IBackup } from 'pg-mem'
import { Repository } from 'typeorm'

describe('PgUserAccountRepository', () => {
  let sut: PgUserAccountRepository
  let connection: PgConnection
  let pgUserRepo: Repository<PgUser>
  let backup: IBackup

  beforeAll(async () => {
    connection = PgConnection.getInstance()
    const db = await makeFakeDb([PgUser])
    backup = db.backup()
    pgUserRepo = connection.getRepository(PgUser)
  })

  afterAll(async () => {
    await connection.disconnect()
  })

  beforeEach(() => {
    backup.restore()
    sut = new PgUserAccountRepository()
  })

  it('should extend PgRepository', async () => {
    expect(sut).toBeInstanceOf(PgRepository)
  })

  describe('load', () => {
    it('should return an account if email exists', async () => {
      await pgUserRepo.save({ email: 'any_email' })

      const account = await sut.load({ email: 'any_email' })

      expect(account).toEqual({ id: '1' })
    })

    it('should return undefined if email does not exists', async () => {
      const account = await sut.load({ email: 'any_email' })

      expect(account).toBeUndefined()
    })
  })

  describe('checkByEmail', () => {
    it('should return true if email exists', async () => {
      await pgUserRepo.save({ email: 'any_email' })

      const account = await sut.checkByEmail({ email: 'any_email' })

      expect(account).toBe(true)
    })

    it('should return false if email does not exists', async () => {
      const account = await sut.checkByEmail({ email: 'any_email' })

      expect(account).toBe(false)
    })
  })

  describe('add', () => {
    it('should create an account', async () => {
      const { id, name, email, isAdmin } = await sut.add({
        name: 'any_name',
        email: 'any_email',
        password: 'any_hashed_password'
      })
      const pgUser = await pgUserRepo.findOne({ where: { email: 'any_email' } })

      expect(pgUser?.id).toBe(1)
      expect(id).toBe('1')
      expect(name).toBe('any_name')
      expect(email).toBe('any_email')
      expect(isAdmin).toBe(false)
    })
  })
})
