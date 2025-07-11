import { Command, CommandRunner } from "nest-commander";
import { MigrationService } from "../services/migration.service";

@Command({
  name: "migration",
  description: "Database migration management commands",
})
export class MigrationCommand extends CommandRunner {
  constructor(private readonly migrationService: MigrationService) {
    super();
  }

  async run(params: string[]): Promise<void> {
    const [action, name] = params;

    try {
      switch (action) {
        case "generate":
        case "g":
          await this.handleGenerate(name);
          break;

        case "run":
        case "r":
          await this.handleRun();
          break;

        case "revert":
        case "rollback":
          await this.handleRevert();
          break;

        case "status":
        case "s":
          await this.handleStatus();
          break;

        case "validate":
        case "v":
          await this.handleValidate();
          break;

        default:
          this.showHelp();
      }
    } catch (error) {
      console.error(`❌ Migration command failed: ${error.message}`);
      process.exit(1);
    }
  }

  private async handleGenerate(name: string): Promise<void> {
    if (!name) {
      console.error("❌ Migration name is required");
      console.log("Usage: yarn migration:generate <migration_name>");
      process.exit(1);
    }

    const filePath = await this.migrationService.generate(name);
    if (filePath) {
      console.log(`✅ Migration generated: ${filePath}`);
    } else {
      console.log("ℹ️  No schema changes detected");
    }
  }

  private async handleRun(): Promise<void> {
    console.log("🚀 Running migrations...");
    await this.migrationService.run();
    console.log("✅ Migrations completed successfully");
  }

  private async handleRevert(): Promise<void> {
    console.log("⏪ Reverting last migration...");
    await this.migrationService.revert();
    console.log("✅ Migration reverted successfully");
  }

  private async handleStatus(): Promise<void> {
    console.log("📊 Checking migration status...\n");
    const status = await this.migrationService.status();

    if (status.pending.length > 0) {
      console.log("⏳ PENDING MIGRATIONS:");
      status.pending.forEach((migration) => {
        console.log(`   • ${migration.name}`);
      });
    } else {
      console.log("✅ No pending migrations");
    }

    if (status.executed.length > 0) {
      console.log("\n📋 RECENT MIGRATIONS:");
      status.executed.forEach((migration) => {
        console.log(
          `   ✓ ${migration.name} (${new Date(migration.timestamp).toLocaleString()})`
        );
      });
    }
  }

  private async handleValidate(): Promise<void> {
    console.log("🔍 Validating database connection...");
    const isValid = await this.migrationService.validate();

    if (isValid) {
      console.log("✅ Database connection is valid");
    } else {
      console.log("❌ Database validation failed");
      process.exit(1);
    }
  }

  private showHelp(): void {
    console.log(`
🗄️  Database Migration Commands

Usage: npm run migration:<command> [options]

Commands:
  generate <name>    Generate new migration (alias: g)
  run                Run pending migrations (alias: r)  
  revert             Revert last migration (alias: rollback)
  status             Show migration status (alias: s)
  validate           Validate database connection (alias: v)

Examples:
  npm run migration:generate add_users_table
  npm run migration:run
  npm run migration:status
  npm run migration:revert

Note: Revert is disabled in production environment
    `);
  }
}
