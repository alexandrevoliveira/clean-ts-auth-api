import { MigrationInterface, QueryRunner, Table } from 'typeorm'

export class CreateUsers1777824841281 implements MigrationInterface {
  name = 'CreateUsers1777824841281'

  async up (queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'users',
        columns: [
          {
            name: 'id',
            type: 'integer',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment'
          },
          { name: 'name', type: 'varchar', isNullable: true },
          { name: 'email', type: 'varchar', isNullable: false },
          { name: 'password', type: 'varchar', isNullable: false },
          { name: 'is_admin', type: 'varchar', isNullable: false, default: "'false'" },
          { name: 'picture_url', type: 'varchar', isNullable: true },
          { name: 'initials', type: 'varchar', isNullable: true }
        ]
      })
    )
  }

  async down (queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('users')
  }
}
