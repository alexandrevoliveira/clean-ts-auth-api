import { AddUserAccount, CheckUserAccountByEmail, LoadUserAccount } from '@/domain/contracts/repos'
import { PgRepository } from '@/infra/repos/postgres'
import { PgUser } from '@/infra/repos/postgres/entities'

export class PgUserAccountRepository extends PgRepository implements LoadUserAccount, CheckUserAccountByEmail, AddUserAccount {
  async load ({ email }: LoadUserAccount.Input): Promise<LoadUserAccount.Output> {
    const pgUserRepo = this.getRepository(PgUser)
    const pgUser = await pgUserRepo.findOne({ where: { email } })
    if (pgUser !== null) {
      return {
        id: pgUser.id.toString(),
        name: pgUser.name ?? undefined
      }
    }
  }

  async checkByEmail ({ email }: CheckUserAccountByEmail.Input): Promise<CheckUserAccountByEmail.Output> {
    const pgUserRepo = this.getRepository(PgUser)
    const pgUser = await pgUserRepo.findOne({ where: { email } })
    return pgUser !== null
  }

  async add ({ name, email, password }: AddUserAccount.Input): Promise<AddUserAccount.Output> {
    const pgUserRepo = this.getRepository(PgUser)
    const pgUser = await pgUserRepo.save({ name, email, password })
    return {
      id: pgUser.id.toString(),
      name,
      email,
      isAdmin: false
    }
  }
}
