import { Controller } from '@/application/controllers'
import { HttpResponse, ok, unauthorized } from '@/application/helpers'
import { ValidationBuilder as Builder, Validator } from '@/application/validation'
import { AuthenticationError } from '@/domain/entities'
import { PasswordAuthentication } from '@/domain/usecases'

type HttpRequest = { email: string, password: string }
type Model = Error | { accessToken: string }

export class LoginController extends Controller {
  constructor (private readonly passwordAuthentication: PasswordAuthentication) {
    super()
  }

  async perform ({ email, password }: HttpRequest): Promise<HttpResponse<Model>> {
    try {
      const passwordAuthenticationOutput = await this.passwordAuthentication({ email, password })
      return ok(passwordAuthenticationOutput)
    } catch (error) {
      if (error instanceof AuthenticationError) return unauthorized()
      throw error
    }
  }

  override buildValidators ({ email, password }: HttpRequest): Validator[] {
    return [
      ...Builder.of({ value: email, fieldName: 'email' }).required().email().build(),
      ...Builder.of({ value: password, fieldName: 'password' }).required().build()
    ]
  }
}
