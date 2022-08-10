import { _ISchema } from '../interfaces-private';
import { IMigrate } from './migrate-interfaces';
import MigrationParams = IMigrate.MigrationParams;
export declare function readMigrations(migrationPath?: string): Promise<IMigrate.MigrationData[]>;
/**
 * Migrates database schema to the latest version
 */
export declare function migrate(db: _ISchema, config?: MigrationParams): Promise<void>;
//# sourceMappingURL=migrate.d.ts.map