import { BcryptHashHandler } from '@/infra/gateways'

import bcrypt from 'bcrypt'

jest.mock('bcrypt')

describe('BcryptHashHandler', () => {
  let value: string
  let hash: string
  let salt: number
  let fakeBcrypt: jest.Mocked<typeof bcrypt>
  let sut: BcryptHashHandler

  beforeAll(() => {
    value = 'any_value'
    hash = 'any_hashed_value'
    salt = 12
    fakeBcrypt = bcrypt as jest.Mocked<typeof bcrypt>
    fakeBcrypt.hash.mockImplementation(() => 'any_hashed_value')
    fakeBcrypt.compare.mockImplementation(() => true)
  })

  beforeEach(() => {
    sut = new BcryptHashHandler(salt)
  })

  describe('generate', () => {
    it('should call hash with correct input', async () => {
      await sut.generate({ value })

      expect(fakeBcrypt.hash).toHaveBeenCalledWith('any_value', salt)
    })

    it('should return a valid hash on hash success', async () => {
      const hashedValue = await sut.generate({ value })

      expect(hashedValue).toBe('any_hashed_value')
    })

    it('should rethrow if hash throws', async () => {
      fakeBcrypt.hash.mockImplementationOnce(() => { throw new Error('hash_error') })

      const promise = sut.generate({ value })

      await expect(promise).rejects.toThrow(new Error('hash_error'))
    })
  })

  describe('compare', () => {
    it('should call compare with correct input', async () => {
      await sut.compare({ value, hash })

      expect(fakeBcrypt.compare).toHaveBeenCalledWith('any_value', 'any_hashed_value')
    })

    it('should return true when bcrypt.compare returns true', async () => {
      const isValid = await sut.compare({ value, hash })

      expect(isValid).toBe(true)
    })

    it('should return false when bcrypt.compare returns false', async () => {
      fakeBcrypt.compare.mockImplementationOnce(() => false)

      const isValid = await sut.compare({ value, hash })

      expect(isValid).toBe(false)
    })

    it('should rethrow if compare throws', async () => {
      fakeBcrypt.compare.mockImplementationOnce(() => { throw new Error('compare_error') })

      const promise = sut.compare({ value, hash })

      await expect(promise).rejects.toThrow(new Error('compare_error'))
    })
  })
})
