#!/bin/bash

# Log Cleanup Utility Script
# This script helps manage log files manually

LOG_DIR="./logs"
MAX_SIZE_MB=100
MAX_FILES=3

echo "🧹 Log Cleanup Utility"
echo "======================"
echo "Log Directory: $LOG_DIR"
echo "Max File Size: ${MAX_SIZE_MB}MB"
echo "Max Files: $MAX_FILES"
echo ""

# Function to convert bytes to MB
bytes_to_mb() {
    echo "scale=2; $1 / 1024 / 1024" | bc
}

# Function to show log statistics
show_stats() {
    echo "📊 Current Log Statistics:"
    echo "-------------------------"
    
    if [ ! -d "$LOG_DIR" ]; then
        echo "❌ Log directory does not exist: $LOG_DIR"
        return 1
    fi
    
    total_size=0
    file_count=0
    
    for file in "$LOG_DIR"/*.log; do
        if [ -f "$file" ]; then
            size=$(stat -c%s "$file")
            size_mb=$(bytes_to_mb $size)
            modified=$(stat -c%y "$file")
            filename=$(basename "$file")
            
            echo "📄 $filename: ${size_mb}MB (Modified: $modified)"
            total_size=$((total_size + size))
            file_count=$((file_count + 1))
        fi
    done
    
    total_size_mb=$(bytes_to_mb $total_size)
    echo ""
    echo "📈 Total: $file_count files, ${total_size_mb}MB"
    echo ""
}

# Function to cleanup old files
cleanup_logs() {
    echo "🗑️  Starting manual cleanup..."
    echo ""
    
    # Check each log type
    for log_type in "app" "errors"; do
        echo "Cleaning up ${log_type}.log files..."
        
        # Find all related files and sort by modification time
        files=($(ls -t "$LOG_DIR"/${log_type}*.log 2>/dev/null))
        
        for i in "${!files[@]}"; do
            file="${files[$i]}"
            
            if [ ! -f "$file" ]; then
                continue
            fi
            
            size=$(stat -c%s "$file")
            size_mb=$(bytes_to_mb $size)
            
            # Remove files beyond max count
            if [ $i -ge $MAX_FILES ]; then
                echo "  ❌ Removing excess file: $(basename "$file")"
                rm "$file"
                continue
            fi
            
            # Check if file exceeds size limit
            max_size_bytes=$((MAX_SIZE_MB * 1024 * 1024))
            if [ $size -gt $max_size_bytes ]; then
                echo "  ⚠️  File $(basename "$file") exceeds ${MAX_SIZE_MB}MB (${size_mb}MB)"
                
                # If it's the main log file, rotate it
                if [ "$(basename "$file")" = "${log_type}.log" ]; then
                    timestamp=$(date +"%Y-%m-%d_%H-%M-%S")
                    rotated_name="${log_type}.log.${timestamp}"
                    echo "  🔄 Rotating to: $rotated_name"
                    mv "$file" "$LOG_DIR/$rotated_name"
                    touch "$file"
                else
                    echo "  ❌ Removing oversized rotated file: $(basename "$file")"
                    rm "$file"
                fi
            else
                echo "  ✅ File $(basename "$file") is within limits (${size_mb}MB)"
            fi
        done
        echo ""
    done
    
    echo "✅ Cleanup completed!"
    echo ""
}

# Function to show help
show_help() {
    echo "Usage: $0 [OPTION]"
    echo ""
    echo "Options:"
    echo "  stats    Show current log file statistics"
    echo "  cleanup  Perform manual log cleanup"
    echo "  help     Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 stats          # Show log statistics"
    echo "  $0 cleanup        # Clean up old log files"
    echo ""
}

# Main script logic
case "$1" in
    "stats")
        show_stats
        ;;
    "cleanup")
        show_stats
        cleanup_logs
        show_stats
        ;;
    "help"|"--help"|"-h")
        show_help
        ;;
    "")
        echo "❓ No option specified. Use 'help' for usage information."
        echo ""
        show_help
        ;;
    *)
        echo "❌ Unknown option: $1"
        echo ""
        show_help
        exit 1
        ;;
esac
