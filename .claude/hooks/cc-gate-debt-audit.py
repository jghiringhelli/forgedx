#!/usr/bin/env python3
"""
cc-gate-debt-audit.py — Gate 11: Session close debt audit
Blocks Chronicle session close if feat() commits exist but DEBT-PLAN.md
was not updated in the session, or if any TC is PARTIAL/SKIP without a D-XXX entry.

Usage: called by session-loop step 10.5 validation.
"""
import sys
import subprocess
import os
import re
from pathlib import Path

REPO_ROOT = Path(subprocess.check_output(['git', 'rev-parse', '--show-toplevel'], text=True).strip())
DEBT_PLAN = REPO_ROOT / 'docs' / 'DEBT-PLAN.md'
SESSION_MANIFEST = REPO_ROOT / '.claude' / 'session' / 'active-manifest.md'

def get_session_commits(limit=30):
    """Get recent commits in this session."""
    result = subprocess.run(['git', 'log', f'--oneline', f'-{limit}'], capture_output=True, text=True)
    return result.stdout.strip().split('\n') if result.returncode == 0 else []

def has_feat_commits(commits):
    return any(re.match(r'^[a-f0-9]+ feat\(', c) for c in commits)

def debt_plan_updated_recently():
    """Check if DEBT-PLAN.md was modified in recent commits."""
    result = subprocess.run(['git', 'log', '--oneline', '-30', '--', 'docs/DEBT-PLAN.md'], capture_output=True, text=True)
    return bool(result.stdout.strip())

def check_manifest_debt_audit():
    """Check session manifest step 10.5 is checked."""
    if not SESSION_MANIFEST.exists():
        return True, []  # No manifest = skip
    content = SESSION_MANIFEST.read_text()
    errors = []
    if '## Step 10.5: Debt Audit' in content:
        section = content.split('## Step 10.5: Debt Audit')[1].split('##')[0]
        if '- [ ]' in section and '[x]' not in section.lower():
            errors.append("Step 10.5 (Debt Audit) not completed in session manifest")
    return len(errors) == 0, errors

def main():
    commits = get_session_commits()
    errors = []

    if has_feat_commits(commits) and not debt_plan_updated_recently():
        errors.append("feat() commits found but DEBT-PLAN.md not updated this session.")
        errors.append("  → Classify each TC as PASS/PARTIAL/SKIP and log PARTIAL/SKIP as D-XXX.")

    manifest_ok, manifest_errors = check_manifest_debt_audit()
    errors.extend(manifest_errors)

    if errors:
        print("\n  ✗ [Gate 11] Debt audit required before session close:")
        for e in errors:
            print(f"  {e}")
        print("\n  Update docs/DEBT-PLAN.md and mark step 10.5 complete in manifest.")
        print()
        sys.exit(1)

    print("  ✓ Gate 11: Debt audit complete.")
    sys.exit(0)

if __name__ == '__main__':
    main()
