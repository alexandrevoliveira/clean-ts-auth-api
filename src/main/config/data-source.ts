import 'dotenv/config'
import { DataSource } from 'typeorm'

const isCompiled = __filename.endsWith('.js')
const root = isCompiled ? 'dist' : 'src'
const ext = isCompiled ? 'js' : 'ts'

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST,
  port: process.env.DB_PORT !== undefined ? Number(process.env.DB_PORT) : 5432,
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  synchronize: false,
  entities: [`${root}/infra/repos/postgres/entities/index.${ext}`],
  migrations: [`${root}/infra/repos/postgres/migrations/*.${ext}`]
})
