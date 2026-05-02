import { LoginController } from '@/application/controllers'
import { makePasswordAuthentication } from '@/main/factories/domain/usecases'

export const makeLoginController = (): LoginController => {
  return new LoginController(makePasswordAuthentication())
}
