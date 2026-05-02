import { CompareFieldError, InvalidEmailError, RequiredFieldError, UnauthorizedError } from '@/application/errors'
import { PgUser } from '@/infra/repos/postgres/entities'
import { PgConnection } from '@/infra/repos/postgres/helpers'
import { app } from '@/main/config/app'
import { makeFakeDb } from '@/tests/infra/repos/postgres/mocks'

import bcrypt from 'bcrypt'
import { IBackup } from 'pg-mem'
import { Repository } from 'typeorm'
import request from 'supertest'
import { ItemInUseError } from '@/domain/entities'

describe('Login Routes', () => {
  let backup: IBackup
  let connection: PgConnection
  let pgUserRepo: Repository<PgUser>

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
  })

  describe('POST /signup', () => {
    it('should return 200 with valid data', async () => {
      const { status, body } = await request(app)
        .post('/api/signup')
        .send({
          name: 'any_name',
          email: 'any_email@mail.com',
          password: '12345',
          passwordConfirmation: '12345'
        })

      expect(status).toBe(200)
      expect(body.accessToken).toBeDefined()
      expect(body.id).toBeDefined()
      expect(body.name).toBe('any_name')
      expect(body.email).toBe('any_email@mail.com')
      expect(body.isAdmin).toBeFalsy()
    })

    it('should return 400 with CompareFieldError', async () => {
      const { status, body } = await request(app)
        .post('/api/signup')
        .send({
          name: 'any_name',
          email: 'any_email@mail.com',
          password: '12345',
          passwordConfirmation: '12346'
        })

      expect(status).toBe(400)
      expect(body.error).toBe(new CompareFieldError('passwordConfirmation').message)
    })

    it('should return 400 with InvalidEmailError', async () => {
      const { status, body } = await request(app)
        .post('/api/signup')
        .send({
          name: 'any_name',
          email: 'any_email',
          password: '12345',
          passwordConfirmation: '12346'
        })

      expect(status).toBe(400)
      expect(body.error).toBe(new InvalidEmailError().message)
    })

    it('should return 400 with ItemInUseError', async () => {
      await pgUserRepo.save({ name: 'any_name', email: 'any_email@mail.com', password: 'any_hashed_password' })

      const { status, body } = await request(app)
        .post('/api/signup')
        .send({
          name: 'any_name',
          email: 'any_email@mail.com',
          password: '12345',
          passwordConfirmation: '12345'
        })

      expect(status).toBe(400)
      expect(body.error).toBe(new ItemInUseError('email').message)
    })
  })

  describe('POST /login', () => {
    it('should return 200 with accessToken on valid credentials', async () => {
      const hashedPassword = await bcrypt.hash('12345', 12)
      await pgUserRepo.save({ name: 'any_name', email: 'any_email@mail.com', password: hashedPassword })

      const { status, body } = await request(app)
        .post('/api/login')
        .send({ email: 'any_email@mail.com', password: '12345' })

      expect(status).toBe(200)
      expect(body.accessToken).toBeDefined()
    })

    it('should return 400 with RequiredFieldError when password is missing', async () => {
      const { status, body } = await request(app)
        .post('/api/login')
        .send({ email: 'any_email@mail.com' })

      expect(status).toBe(400)
      expect(body.error).toBe(new RequiredFieldError('password').message)
    })

    it('should return 400 with InvalidEmailError when email is malformed', async () => {
      const { status, body } = await request(app)
        .post('/api/login')
        .send({ email: 'any_email', password: '12345' })

      expect(status).toBe(400)
      expect(body.error).toBe(new InvalidEmailError().message)
    })

    it('should return 401 when email is not registered', async () => {
      const { status, body } = await request(app)
        .post('/api/login')
        .send({ email: 'unknown@mail.com', password: '12345' })

      expect(status).toBe(401)
      expect(body.error).toBe(new UnauthorizedError().message)
    })

    it('should return 401 when password is wrong', async () => {
      const hashedPassword = await bcrypt.hash('12345', 12)
      await pgUserRepo.save({ name: 'any_name', email: 'any_email@mail.com', password: hashedPassword })

      const { status, body } = await request(app)
        .post('/api/login')
        .send({ email: 'any_email@mail.com', password: 'wrong_password' })

      expect(status).toBe(401)
      expect(body.error).toBe(new UnauthorizedError().message)
    })
  })
})
