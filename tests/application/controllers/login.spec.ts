import { Controller, LoginController } from '@/application/controllers'
import { ServerError, UnauthorizedError } from '@/application/errors'
import { Email, RequiredString } from '@/application/validation'
import { AuthenticationError } from '@/domain/entities'

describe('LoginController', () => {
  let email: string
  let password: string
  let sut: LoginController
  let passwordAuthentication: jest.Mock

  beforeAll(() => {
    email = 'any_email@gmail.com'
    password = 'any_password'
    passwordAuthentication = jest.fn().mockResolvedValue({ accessToken: 'any_token' })
  })

  beforeEach(() => {
    sut = new LoginController(passwordAuthentication)
  })

  it('should extend Controller', () => {
    expect(sut).toBeInstanceOf(Controller)
  })

  it('should build validators correctly', async () => {
    const validators = sut.buildValidators({ email, password })

    expect(validators).toEqual([
      new RequiredString('any_email@gmail.com', 'email'),
      new Email('any_email@gmail.com'),
      new RequiredString('any_password', 'password')
    ])
  })

  it('should call PasswordAuthentication with correct input', async () => {
    await sut.handle({ email, password })

    expect(passwordAuthentication).toHaveBeenCalledWith({ email, password })
    expect(passwordAuthentication).toHaveBeenCalledTimes(1)
  })

  it('should return 401 when PasswordAuthentication throws AuthenticationError', async () => {
    passwordAuthentication.mockRejectedValueOnce(new AuthenticationError())

    const httpResponse = await sut.handle({ email, password })

    expect(httpResponse).toEqual({
      statusCode: 401,
      data: new UnauthorizedError()
    })
  })

  it('should return 500 on infra error', async () => {
    const error = new Error('infra_error')
    passwordAuthentication.mockRejectedValueOnce(error)

    const httpResponse = await sut.handle({ email, password })

    expect(httpResponse).toEqual({
      statusCode: 500,
      data: new ServerError(error)
    })
  })

  it('should return 200 with accessToken on success', async () => {
    const httpResponse = await sut.handle({ email, password })

    expect(httpResponse).toEqual({
      statusCode: 200,
      data: { accessToken: 'any_token' }
    })
  })
})
