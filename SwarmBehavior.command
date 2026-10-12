#!/bin/bash

cd -- "$(dirname -- "$0")" || exit 1
export PATH="$PATH:/opt/homebrew/bin:/usr/local/bin"

fail() {
  printf '\n%s\n' "$1"
  if [ "${check_only:-0}" -eq 0 ]; then
    read -r -p 'Enter 키를 누르면 종료합니다. ' _
  fi
  exit 1
}

check_only=0
[ "${1:-}" = '--check' ] && check_only=1
[ "$(uname -s)" = Darwin ] || fail '이 파일은 macOS 전용입니다. Windows에서는 SwarmBehavior.cmd를 실행하세요.'
command -v node >/dev/null 2>&1 || fail 'Node.js LTS를 설치한 뒤 다시 실행해주세요.'
command -v npm >/dev/null 2>&1 || fail 'npm을 찾지 못했습니다. Node.js 설치 상태를 확인해주세요.'
node -e 'const [a,b] = process.versions.node.split(".").map(Number); process.exit((a === 20 && b >= 19) || (a === 22 && b >= 12) || a > 22 ? 0 : 1)' || fail 'Node.js 버전이 낮습니다. 최신 LTS로 업데이트해주세요.'

if [ ! -f node_modules/vite/bin/vite.js ]; then
  printf '%s\n' '최초 구성요소를 설치합니다. 인터넷 연결이 필요합니다.'
  npm ci --no-audit --no-fund || fail '구성요소 설치에 실패했습니다. 위 오류를 확인해주세요.'
fi

if [ "$check_only" -eq 1 ]; then
  npm run build || fail '빌드에 실패했습니다.'
  node scripts/start-kiosk.mjs --check || fail '실행 준비 점검에 실패했습니다.'
else
  npm run sb || fail '실행에 실패했습니다. 위 오류를 확인해주세요.'
fi
