# macOS (Darwin) System Commands

The project is running on macOS (Darwin 25.2.0). Here are important system-specific
considerations:

## Standard Unix Commands Available

Most standard Unix commands work on macOS:

- `ls`, `cd`, `pwd`, `mkdir`, `rm`, `cp`, `mv`
- `cat`, `less`, `head`, `tail`
- `grep`, `find`, `sed`, `awk`
- `chmod`, `chown`
- `ps`, `kill`, `top`

## macOS-Specific Considerations

### Package Management

This project uses **pnpm** for Node.js packages, enforced by preinstall hook.

### File System

- **Case-insensitive** by default (but case-preserving)
- Be careful with file naming to avoid cross-platform issues
- Use forward slashes (/) in paths, not backslashes

### Command Differences from Linux

Some commands have different options or behavior:

- `sed -i` requires an extension argument: `sed -i '' 's/foo/bar/g'`
- `readlink` doesn't have `-f` flag (use `greadlink` from coreutils if needed)
- `stat` has different syntax than GNU stat
- `xargs` may have different default behavior

### Git

Standard git commands work as expected:

```bash
git status
git add .
git commit -m "message"
git push
git pull
git branch
git checkout
git diff
```

### Node.js & pnpm

```bash
# Node version
node --version  # Should be >= 20.13

# pnpm commands
pnpm install
pnpm test
pnpm build
pnpm format
```

### Common Development Tasks

#### File Search

```bash
# Find files by name
find . -name "*.tsx"

# Find files excluding node_modules
find . -name "*.tsx" -not -path "*/node_modules/*"

# Using grep for content search
grep -r "searchTerm" packages/
```

#### Process Management

```bash
# List processes
ps aux | grep node

# Kill process by PID
kill <pid>

# Kill process by name
pkill -f "process-name"
```

#### File Operations

```bash
# View file contents
cat file.txt
less file.txt

# View end of log file
tail -f logfile.txt

# Count lines
wc -l file.txt

# Find and replace (macOS-specific)
sed -i '' 's/old/new/g' file.txt
```

#### Permissions

```bash
# Make script executable
chmod +x script.sh

# Fix permission issues
chmod 644 file.txt  # rw-r--r--
chmod 755 file.sh   # rwxr-xr-x
```

### Environment

#### Shell

Default shell on macOS is zsh (as of Catalina+):

- Shell scripts should use `#!/usr/bin/env bash` or `#!/bin/sh`
- Environment variables work standard way: `export VAR=value`

#### Paths

- Home directory: `~` or `$HOME`
- Current directory: `.`
- Parent directory: `..`
- Absolute paths start with `/`

### Performance Monitoring

```bash
# CPU and memory usage
top

# Better alternative (if installed)
htop

# Disk usage
du -sh *

# Disk free space
df -h
```

### Networking (if needed)

```bash
# Check port usage
lsof -i :3000

# Check network connections
netstat -an | grep LISTEN
```

## Project-Specific Commands

### Most Used Git Operations

```bash
# Check status
git status

# View changes
git diff

# Add all changes
git add .

# Commit (pre-commit hook will run Prettier automatically)
git commit -m "feat: add new feature"

# Push
git push

# Pull with rebase
git pull --rebase
```

### Testing Individual Files

```bash
# Run specific test file (after building)
node --test dist/test/specific-test.test.js
```

### Debugging

```bash
# Run with inspector
node --inspect dist/test/test-file.js

# Run with more verbose output
NODE_OPTIONS="--trace-warnings" pnpm test
```
