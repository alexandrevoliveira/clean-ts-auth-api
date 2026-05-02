import { HashComparer, TokenGenerator } from '@/domain/contracts/gateways'
import { LoadUserAccount } from '@/domain/contracts/repos'
import { AccessToken, AuthenticationError } from '@/domain/entities'

type Setup = (userAccountRepo: LoadUserAccount, hasher: HashComparer, token: TokenGenerator) => PasswordAuthentication
type Input = { email: string, password: string }
type Output = { accessToken: string }
export type PasswordAuthentication = (input: Input) => Promise<Output>

export const setupPasswordAuthentication: Setup = (userAccountRepo, hasher, token) => async ({ email, password }) => {
  const account = await userAccountRepo.load({ email })
  if (account === undefined) throw new AuthenticationError()
  const isValid = await hasher.compare({ value: password, hash: account.password })
  if (!isValid) throw new AuthenticationError()
  const accessToken = await token.generate({ key: account.id, expirationInMs: AccessToken.expirationInMs })
  return { accessToken }
}
