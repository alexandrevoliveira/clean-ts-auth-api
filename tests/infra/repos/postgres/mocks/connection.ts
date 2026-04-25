import { PgConnection } from '@/infra/repos/postgres/helpers'

import { DataType, IMemoryDb, newDb } from 'pg-mem'

export const makeFakeDb = async (entities?: any[]): Promise<IMemoryDb> => {
  const db = newDb()
  db.public.registerFunction({
    name: 'current_database',
    args: [],
    returns: DataType.text,
    implementation: () => 'test'
  })
  db.public.registerFunction({
    name: 'version',
    args: [],
    returns: DataType.text,
    implementation: () => 'PostgreSQL 14.0'
  })
  const connection = await db.adapters.createTypeormConnection({
    type: 'postgres',
    entities: entities ?? ['src/infra/repos/postgres/entities/index.ts']
  })
  await connection.synchronize()
  await PgConnection.getInstance().connect()
  return db
}
