import { adaptExpressRoute as adapt } from '@/main/adapters'
import { makeLoginController, makeSignUpController } from '@/main/factories/application/controllers'

import { Router } from 'express'

export default (router: Router): void => {
  router.post('/login', adapt(makeLoginController()))
  router.post('/signup', adapt(makeSignUpController()))
}
