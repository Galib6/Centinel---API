import { Injectable, Logger } from "@nestjs/common";
import { ENV } from "@src/env";
import { promises as fs } from "fs";
import { join } from "path";
import { DataSource } from "typeorm";

@Injectable()
export class MigrationService {
  private readonly logger = new Logger(MigrationService.name);
  private readonly migrationDir = join(
    process.cwd(),
    "src/database/migrations"
  );

  constructor(private readonly dataSource: DataSource) {}

  async generate(name: string): Promise<string> {
    // Validate migration name
    if (!name || !name.match(/^[a-zA-Z][a-zA-Z0-9_]*$/)) {
      throw new Error(
        "Invalid migration name. Use only letters, numbers, and underscores."
      );
    }

    try {
      const timestamp = Date.now();
      const className = `${name.charAt(0).toUpperCase()}${name.slice(1)}${timestamp}`;
      const filename = `${timestamp}-${name.toLowerCase().replace(/_/g, "-")}.ts`;
      const filePath = join(this.migrationDir, filename);

      // Generate schema diff
      const sqlInMemory = await this.dataSource.driver
        .createSchemaBuilder()
        .log();
      const upQueries = sqlInMemory.upQueries;
      const downQueries = sqlInMemory.downQueries;

      if (upQueries.length === 0) {
        this.logger.warn("No schema changes detected");
        return null;
      }

      const content = this.generateMigrationFile(
        className,
        upQueries,
        downQueries
      );

      // Ensure migrations directory exists
      await fs.mkdir(this.migrationDir, { recursive: true });
      await fs.writeFile(filePath, content, "utf8");

      this.logger.log(`Migration generated: ${filename}`);
      return filePath;
    } catch (error) {
      this.logger.error("Failed to generate migration", error);
      throw error;
    }
  }

  async run(): Promise<void> {
    // Security check for production
    if (ENV.config.nodeEnv === "production") {
      this.logger.warn("Running migrations in production environment");
    }

    try {
      const migrations = await this.dataSource.runMigrations({
        transaction: "all", // Run all migrations in a single transaction
      });

      if (migrations.length === 0) {
        this.logger.log("No pending migrations found");
        return;
      }

      this.logger.log(`Successfully executed ${migrations.length} migrations`);
      migrations.forEach((migration) => {
        this.logger.log(`✓ ${migration.name}`);
      });
    } catch (error) {
      this.logger.error("Migration execution failed", error);
      throw error;
    }
  }

  async revert(): Promise<void> {
    // Prevent revert in production
    if (ENV.config.nodeEnv === "production") {
      throw new Error(
        "Migration revert is not allowed in production environment"
      );
    }

    try {
      await this.dataSource.undoLastMigration({
        transaction: "all",
      });
      this.logger.log("Successfully reverted last migration");
    } catch (error) {
      this.logger.error("Migration revert failed", error);
      throw error;
    }
  }

  async status(): Promise<{ pending: any[]; executed: any[] }> {
    try {
      const allMigrations = this.dataSource.migrations;
      const executedMigrations = await this.dataSource.query(
        "SELECT * FROM migrations ORDER BY timestamp DESC LIMIT 10"
      );

      const executedNames = new Set(executedMigrations.map((m: any) => m.name));
      const pending = allMigrations.filter(
        (migration) => !executedNames.has(migration.name)
      );

      return { pending, executed: executedMigrations };
    } catch (error) {
      this.logger.error("Failed to get migration status", error);
      throw error;
    }
  }

  async validate(): Promise<boolean> {
    try {
      // Check if database connection is working
      await this.dataSource.query("SELECT 1");

      // Check migrations table exists
      const tableExists = await this.dataSource.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_name = 'migrations'
        );
      `);

      return tableExists[0].exists;
    } catch (error) {
      this.logger.error("Database validation failed", error);
      return false;
    }
  }

  private generateMigrationFile(
    className: string,
    upQueries: any[],
    downQueries: any[]
  ): string {
    const upQueriesStr = upQueries
      .map(
        (q) =>
          `        await queryRunner.query(\`${this.sanitizeQuery(q.query)}\`);`
      )
      .join("\n");

    const downQueriesStr = downQueries
      .map(
        (q) =>
          `        await queryRunner.query(\`${this.sanitizeQuery(q.query)}\`);`
      )
      .join("\n");

    return `import { MigrationInterface, QueryRunner } from 'typeorm';

export class ${className} implements MigrationInterface {
  name = '${className}';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Auto-generated migration queries
${upQueriesStr}
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Auto-generated rollback queries
${downQueriesStr}
  }
}
`;
  }

  private sanitizeQuery(query: string): string {
    return query.replace(/`/g, "\\`").replace(/\$/g, "\\$");
  }
}
