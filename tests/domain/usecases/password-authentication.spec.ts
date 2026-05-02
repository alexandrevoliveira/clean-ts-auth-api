import { HashComparer, TokenGenerator } from '@/domain/contracts/gateways'
import { LoadUserAccount } from '@/domain/contracts/repos'
import { AccessToken, AuthenticationError } from '@/domain/entities'
import { PasswordAuthentication, setupPasswordAuthentication } from '@/domain/usecases'

import { mock, MockProxy } from 'jest-mock-extended'

describe('PasswordAuthentication', () => {
  let email: string
  let password: string
  let userAccountRepo: MockProxy<LoadUserAccount>
  let hasher: MockProxy<HashComparer>
  let crypto: MockProxy<TokenGenerator>
  let sut: PasswordAuthentication

  beforeAll(() => {
    email = 'any_email'
    password = 'any_password'
    userAccountRepo = mock()
    userAccountRepo.load.mockResolvedValue({ id: 'any_account_id', password: 'any_hashed_password' })
    hasher = mock()
    hasher.compare.mockResolvedValue(true)
    crypto = mock()
    crypto.generate.mockResolvedValue('any_token')
  })

  beforeEach(() => {
    sut = setupPasswordAuthentication(userAccountRepo, hasher, crypto)
  })

  it('should call LoadUserAccount with correct input', async () => {
    await sut({ email, password })

    expect(userAccountRepo.load).toHaveBeenCalledWith({ email })
    expect(userAccountRepo.load).toHaveBeenCalledTimes(1)
  })

  it('should throw AuthenticationError when LoadUserAccount returns undefined', async () => {
    userAccountRepo.load.mockResolvedValueOnce(undefined)

    const promise = sut({ email, password })

    await expect(promise).rejects.toThrow(new AuthenticationError())
  })

  it('should rethrow if LoadUserAccount throws', async () => {
    userAccountRepo.load.mockRejectedValueOnce(new Error('load_error'))

    const promise = sut({ email, password })

    await expect(promise).rejects.toThrow(new Error('load_error'))
  })

  it('should call HashComparer with correct input', async () => {
    await sut({ email, password })

    expect(hasher.compare).toHaveBeenCalledWith({ value: password, hash: 'any_hashed_password' })
    expect(hasher.compare).toHaveBeenCalledTimes(1)
  })

  it('should throw AuthenticationError when HashComparer returns false', async () => {
    hasher.compare.mockResolvedValueOnce(false)

    const promise = sut({ email, password })

    await expect(promise).rejects.toThrow(new AuthenticationError())
  })

  it('should rethrow if HashComparer throws', async () => {
    hasher.compare.mockRejectedValueOnce(new Error('compare_error'))

    const promise = sut({ email, password })

    await expect(promise).rejects.toThrow(new Error('compare_error'))
  })

  it('should call TokenGenerator with correct input', async () => {
    await sut({ email, password })

    expect(crypto.generate).toHaveBeenCalledWith({
      key: 'any_account_id',
      expirationInMs: AccessToken.expirationInMs
    })
    expect(crypto.generate).toHaveBeenCalledTimes(1)
  })

  it('should rethrow if TokenGenerator throws', async () => {
    crypto.generate.mockRejectedValueOnce(new Error('token_error'))

    const promise = sut({ email, password })

    await expect(promise).rejects.toThrow(new Error('token_error'))
  })

  it('should return an accessToken on success', async () => {
    const result = await sut({ email, password })

    expect(result).toEqual({ accessToken: 'any_token' })
  })
})
