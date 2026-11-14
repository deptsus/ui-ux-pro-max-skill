#!/usr/bin/env bash
# Netlify runs this before every build of the production branch (netlify.toml,
# [build] ignore). Exit 0 = skip the build, exit 1 = build.
#
# Deploys cost Netlify credits, so pushes only save work on GitHub; the site is
# rebuilt only when the SUBJECT LINE (first line) of the newest commit contains
# "[deploy]". The body is ignored, so a message that merely mentions the marker
# does not deploy. All commits pushed since the last deploy go live together.
#
# Emergency switch: set the Netlify environment variable LENTERA_ALWAYS_BUILD=1
# (Project configuration -> Environment variables) to build every push again,
# including "Trigger deploy" from the Netlify UI on a commit without [deploy].
if [ "${LENTERA_ALWAYS_BUILD:-}" = "1" ]; then
  echo "netlify-ignore: LENTERA_ALWAYS_BUILD=1, building"
  exit 1
fi
msg=$(git log -1 --format=%s "${COMMIT_REF:-HEAD}" 2>/dev/null)
case "$msg" in
  *"[deploy]"*) echo "netlify-ignore: commit asks for [deploy], building"; exit 1 ;;
esac
echo "netlify-ignore: no [deploy] in the commit subject, skipping this build (work is saved on GitHub)"
exit 0
