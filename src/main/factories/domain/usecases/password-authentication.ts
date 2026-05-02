import { PasswordAuthentication, setupPasswordAuthentication } from '@/domain/usecases'
import { makeBcryptHashHandler, makeJwtTokenHandler } from '@/main/factories/infra/gateways'
import { makePgUserAccountRepo } from '@/main/factories/infra/repos/postgres'

export const makePasswordAuthentication = (): PasswordAuthentication => {
  return setupPasswordAuthentication(makePgUserAccountRepo(), makeBcryptHashHandler(), makeJwtTokenHandler())
}
