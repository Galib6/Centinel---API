# Log Management System

This directory contains the complete log management system for the Centinel API with automatic cleanup and rotation.

## 📁 Log Files

The system generates the following log files in the `logs/` directory:

- **`app.log`** - Contains all application logs (info, warn, error, debug)
- **`errors.log`** - Contains only error-level logs for quick debugging
- **Rotated files** - Automatically created when files exceed 100MB (e.g., `app.log.1`, `app.log.2`)

## 🔧 Configuration

### File Rotation Settings

- **Maximum file size**: 100MB per file
- **Maximum files**: 3 files per log type
- **Auto cleanup**: Files beyond the 3-file limit are automatically deleted

### Cron Job Schedule

- **Automatic cleanup**: Runs daily at midnight
- **Manual cleanup**: Available via API endpoints

## 🚀 Usage

### API Endpoints

#### Get Log Statistics

```bash
GET /api/v1/logs/stats
```

Returns current log file information including sizes and modification dates.

#### Manual Cleanup

```bash
POST /api/v1/logs/cleanup
```

Triggers immediate log cleanup and rotation.

### Command Line Script

Use the included bash script for manual log management:

```bash
# Show current log statistics
./scripts/log-cleanup.sh stats

# Perform manual cleanup
./scripts/log-cleanup.sh cleanup

# Show help
./scripts/log-cleanup.sh help
```

## 🔄 How It Works

### Automatic Rotation (Winston)

1. When a log file reaches 100MB, Winston automatically creates a numbered backup
2. The original file continues to receive new logs
3. Old numbered files are automatically deleted when exceeding the 3-file limit

### Cron Job Cleanup

1. Runs daily at midnight via `@Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)`
2. Checks all log files for size and count limits
3. Removes excess files and rotates oversized files
4. Logs cleanup activities to the console

### Manual Cleanup

- Available through API endpoints for immediate cleanup
- Command-line script for server administration
- Safe rotation that preserves current logs

## 📊 Log Format

### Console Output (Development)

- Colored output with timestamps
- NestJS-style formatting with context

### File Output (Production)

- Clean format without ANSI color codes
- Structure: `TIMESTAMP [LEVEL] [CONTEXT] MESSAGE`
- Example: `2025-07-12T08:46:30.612Z [INFO] [NestFactory] Starting Nest application...`

## 🛠️ Maintenance

### Monitoring

- Check `/api/v1/logs/stats` regularly to monitor log file sizes
- Use the command-line script for quick system checks

### Troubleshooting

- If logs contain ANSI codes, restart the application to apply the clean format
- Check file permissions if cleanup fails
- Verify disk space if rotation stops working

### Manual Intervention

- Use `./scripts/log-cleanup.sh cleanup` for immediate cleanup
- Manually delete old log files if needed: `rm logs/*.log.*`
- Reset logs completely: `rm logs/*.log && touch logs/app.log logs/errors.log`

## 🔐 Security Notes

- Log cleanup endpoints use `@Auth(AuthType.None)` for monitoring tools
- Consider adding authentication for production environments
- Monitor log access in production for sensitive information

## 📋 File Structure

```
logs/
├── app.log              # Current application logs
├── app.log.1           # Rotated application logs (if > 100MB)
├── app.log.2           # Older rotated logs
├── errors.log          # Current error logs
├── errors.log.1        # Rotated error logs (if > 100MB)
└── errors.log.2        # Older rotated error logs

scripts/
└── log-cleanup.sh      # Manual log management script

src/app/services/
└── log-cleanup.service.ts  # Automated cleanup service
```
