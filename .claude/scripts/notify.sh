#!/bin/bash
# Claude Code 跨平台通知脚本
# Windows: PowerShell Toast  |  macOS: osascript  |  Linux: notify-send
# 用法: notify.sh [标题] [内容]

TITLE="${1:-Claude Code}"
MESSAGE="${2:-任务已完成}"
OS="$(uname -s)"

case "$OS" in
  Darwin*)
    # macOS
    osascript -e "display notification \"$MESSAGE\" with title \"$TITLE\" sound name \"default\""
    ;;

  MINGW*|MSYS*|CYGWIN*)
    # Windows: 调用 PowerShell Toast 通知
    SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
    powershell.exe -NoProfile -ExecutionPolicy Bypass -File "$SCRIPT_DIR/notify.ps1" -Title "$TITLE" -Message "$MESSAGE" 2>/dev/null
    ;;

  Linux*)
    if command -v notify-send &>/dev/null; then
      notify-send "$TITLE" "$MESSAGE" --icon=dialog-information
    fi
    ;;
esac
