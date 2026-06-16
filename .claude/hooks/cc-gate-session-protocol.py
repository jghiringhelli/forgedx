#!/usr/bin/env python3
"""
cc-gate-session-protocol.py — Session Loop protocol gate
Enforces that session steps are completed before certain commit types:
- test: [RED] commits require steps 0-2 done
- feat: commits require step 4 (RED) done
- Session close requires all steps completed
"""
import sys
import subprocess
import os
import re
from pathlib import Path

REPO_ROOT = Path(subprocess.check_output(['git', 'rev-parse', '--show-toplevel'], text=True).strip())
SESSION_MANIFEST = REPO_ROOT / '.claude' / 'session' / 'active-manifest.md'

def get_manifest_steps():
    if not SESSION_MANIFEST.exists():
        return {}
    content = SESSION_MANIFEST.read_text()
    steps = {}
    for match in re.finditer(r'## Step (\d+(?:\.\d+)?): (.+)', content):
        step_num = match.group(1)
        # Check if any checkbox in this step is checked
        step_section = content[match.start():]
        next_step = re.search(r'\n## ', step_section[4:])
        section = step_section[:next_step.start()+4] if next_step else step_section
        steps[step_num] = '[x]' in section.lower()
    return steps

def get_staged_commit_type():
    """Read commit msg from stdin if available, or from COMMIT_EDITMSG."""
    msg_file = REPO_ROOT / '.git' / 'COMMIT_EDITMSG'
    if msg_file.exists():
        msg = msg_file.read_text().strip()
        match = re.match(r'^(feat|fix|test|refactor|docs|chore|ci|build)', msg)
        return match.group(1) if match else None
    return None

def main():
    steps = get_manifest_steps()
    commit_type = get_staged_commit_type()
    errors = []

    if commit_type == 'test':
        # test: [RED] requires steps 0, 1, 2
        for s in ['0', '1', '2']:
            if not steps.get(s, False):
                errors.append(f"Step {s} not completed before test: [RED] commit")

    elif commit_type == 'feat':
        # feat: requires step 4 (RED tests exist)
        if not steps.get('4', False):
            errors.append("Step 4 (RED) not completed. Write failing tests first.")

    if errors:
        print("\n  ✗ [Session Protocol Gate] Session loop steps incomplete:")
        for e in errors:
            print(f"  → {e}")
        print("\n  See .claude/standards/session-loop.md for the full protocol.")
        print()
        sys.exit(1)

    sys.exit(0)

if __name__ == '__main__':
    main()
