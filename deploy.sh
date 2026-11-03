#!/usr/bin/env bash
# 一键更新 GitHub Pages：
#   1. 本地改好 project_page 下的文件后，在本目录执行  ./deploy.sh "更新说明"
#   2. 脚本会把当前目录内容推到 black1948/lab2sim 的 gh-pages 分支
set -euo pipefail

REPO="https://github.com/black1948/lab2sim.git"
MSG="${1:-Update project page}"
SRC="$(cd "$(dirname "$0")" && pwd)"
WORK="$(mktemp -d)/lab2sim_pages"

git clone --quiet "$REPO" "$WORK"
cd "$WORK"
if git ls-remote --heads origin | grep -q "gh-pages"; then
  git checkout --quiet gh-pages
  git rm -rfq -- . ':!.git' 2>/dev/null || git rm -rfq .
else
  git checkout --quiet --orphan gh-pages
  git rm -rfq --cached . 2>/dev/null || true
  rm -f README.md
fi
cp -R "$SRC/." .
touch .nojekyll
git add -A
git -c user.name="black1948" -c user.email="black1948@users.noreply.github.com" \
  commit --quiet -m "$MSG" || { echo "nothing to commit"; exit 0; }
git push --quiet origin gh-pages
echo "✓ pushed → https://black1948.github.io/lab2sim/ （约 1 分钟后生效）"
