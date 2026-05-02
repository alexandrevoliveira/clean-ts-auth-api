import { HashComparer, HashGenerator } from '@/domain/contracts/gateways'

import bcrypt from 'bcrypt'

export class BcryptHashHandler implements HashGenerator, HashComparer {
  constructor (private readonly salt: number) {}

  async generate ({ value }: HashGenerator.Input): Promise<HashGenerator.Output> {
    return bcrypt.hash(value, this.salt)
  }

  async compare ({ value, hash }: HashComparer.Input): Promise<HashComparer.Output> {
    return bcrypt.compare(value, hash)
  }
}
