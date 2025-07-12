import { Injectable, Logger } from "@nestjs/common";
import { Cron, CronExpression } from "@nestjs/schedule";
import * as fs from "fs";
import * as path from "path";
import { ENV } from "../../env";

@Injectable()
export class LogCleanupService {
  private readonly logger = new Logger(LogCleanupService.name);

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async cleanupOldLogs() {
    this.logger.log("Starting log cleanup process...");

    try {
      const logFolder = ENV.logFolder;
      const maxFileSize = 100 * 1024 * 1024; // 100MB
      const maxFiles = 3;

      // Get all log files
      const files = await fs.promises.readdir(logFolder);
      const logFiles = files.filter((file) => file.endsWith(".log"));

      for (const logFileName of ["app.log", "errors.log"]) {
        await this.cleanupLogFiles(
          logFolder,
          logFileName,
          maxFileSize,
          maxFiles
        );
      }

      this.logger.log("Log cleanup process completed successfully");
    } catch (error) {
      this.logger.error("Error during log cleanup:", error);
    }
  }

  private async cleanupLogFiles(
    logFolder: string,
    baseFileName: string,
    maxFileSize: number,
    maxFiles: number
  ) {
    try {
      // Get all related log files (base file + rotated files)
      const files = await fs.promises.readdir(logFolder);
      const relatedFiles = files
        .filter(
          (file) => file.startsWith(baseFileName) && file.endsWith(".log")
        )
        .sort((a, b) => {
          // Sort by modification time (newest first)
          const statA = fs.statSync(path.join(logFolder, a));
          const statB = fs.statSync(path.join(logFolder, b));
          return statB.mtime.getTime() - statA.mtime.getTime();
        });

      // Check file sizes and remove files that exceed limits
      for (let i = 0; i < relatedFiles.length; i++) {
        const filePath = path.join(logFolder, relatedFiles[i]);
        const stats = await fs.promises.stat(filePath);

        // Remove files beyond maxFiles limit
        if (i >= maxFiles) {
          await fs.promises.unlink(filePath);
          this.logger.log(
            `Removed old log file: ${relatedFiles[i]} (exceeded max files limit)`
          );
          continue;
        }

        // Remove files that exceed maxFileSize
        if (stats.size > maxFileSize) {
          // If it's the main log file, rotate it
          if (relatedFiles[i] === baseFileName) {
            const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
            const rotatedName = `${baseFileName}.${timestamp}`;
            const rotatedPath = path.join(logFolder, rotatedName);

            await fs.promises.rename(filePath, rotatedPath);
            this.logger.log(
              `Rotated large log file: ${baseFileName} -> ${rotatedName}`
            );

            // Create new empty log file
            await fs.promises.writeFile(filePath, "");
          } else {
            // Remove old rotated files that are too large
            await fs.promises.unlink(filePath);
            this.logger.log(`Removed oversized log file: ${relatedFiles[i]}`);
          }
        }
      }

      // Re-check and ensure we don't exceed maxFiles after rotation
      const updatedFiles = (await fs.promises.readdir(logFolder))
        .filter(
          (file) => file.startsWith(baseFileName) && file.endsWith(".log")
        )
        .sort((a, b) => {
          const statA = fs.statSync(path.join(logFolder, a));
          const statB = fs.statSync(path.join(logFolder, b));
          return statB.mtime.getTime() - statA.mtime.getTime();
        });

      // Remove excess files
      for (let i = maxFiles; i < updatedFiles.length; i++) {
        const filePath = path.join(logFolder, updatedFiles[i]);
        await fs.promises.unlink(filePath);
        this.logger.log(`Removed excess log file: ${updatedFiles[i]}`);
      }
    } catch (error) {
      this.logger.error(`Error cleaning up ${baseFileName}:`, error);
    }
  }

  // Manual cleanup method that can be called programmatically
  async manualCleanup() {
    this.logger.log("Manual log cleanup initiated...");
    await this.cleanupOldLogs();
  }

  // Get log directory stats
  async getLogStats() {
    try {
      const logFolder = ENV.logFolder;
      const files = await fs.promises.readdir(logFolder);
      const logFiles = files.filter((file) => file.endsWith(".log"));

      const stats = await Promise.all(
        logFiles.map(async (file) => {
          const filePath = path.join(logFolder, file);
          const stat = await fs.promises.stat(filePath);
          return {
            name: file,
            size: stat.size,
            sizeInMB: (stat.size / (1024 * 1024)).toFixed(2),
            modified: stat.mtime,
          };
        })
      );

      return {
        totalFiles: logFiles.length,
        files: stats.sort(
          (a, b) => b.modified.getTime() - a.modified.getTime()
        ),
      };
    } catch (error) {
      this.logger.error("Error getting log stats:", error);
      return null;
    }
  }
}
