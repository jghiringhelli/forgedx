"""
ForgeDX + VairixDX Pathology PCA
Goal: find which pathologies load on independent signal dimensions,
identify collinear clusters, produce a maximally-discriminative master list.
"""

import numpy as np
from collections import defaultdict

# ─── SIGNAL DICTIONARY ───────────────────────────────────────────────────────
SIGNALS = [
    # GS structure
    "no_navigation_root",        # 0
    "no_claude_md",              # 1
    "no_adr_files",              # 2
    "no_spec_document",          # 3
    "no_spec_index",             # 4
    "no_session_protocol",       # 5
    "no_decision_log",           # 6
    "spec_last_workflow",        # 7
    "no_defended_spec",          # 8
    "monolithic_spec_file",      # 9
    "high_file_count_no_index",  # 10
    # Testing
    "no_test_files",             # 11
    "no_coverage_config",        # 12
    "no_contract_tests",         # 13
    "no_e2e_tests",              # 14
    "no_executable_spec",        # 15
    "no_regression_fixtures",    # 16
    "tests_not_behavioral",      # 17
    # Architecture
    "no_layer_enforcement",      # 18
    "no_dependency_rules",       # 19
    "no_interface_definitions",  # 20
    "no_api_spec_doc",           # 21
    # Gates / process
    "no_ci_gate",                # 22
    "no_pre_commit_hooks",       # 23
    "no_conventional_commits",   # 24
    "no_forbidden_patterns",     # 25
    # Code health
    "no_duplication_gate",       # 26
    "no_dead_code_gate",         # 27
    "no_shared_utilities",       # 28
    # Vocabulary / naming
    "no_domain_vocabulary",      # 29
    "inconsistent_naming",       # 30
    # Operational
    "no_env_example",            # 31
    "no_readme",                 # 32
    "no_deployment_doc",         # 33
    # AI-specific (ForgeDX)
    "llm_used_for_scoring",      # 34
    "no_deterministic_scoring",  # 35
    # Team / org (from VairixDX)
    "bus_factor_risk",           # 36
    "no_ai_security_policy",     # 37
    "unauthorized_ai_tools",     # 38
    "no_ai_measurement",         # 39
    "no_prompt_library",         # 40
    "no_code_review_standards",  # 41
    "no_onboarding_docs",        # 42
    "skill_atrophy_signs",       # 43
    "no_team_ai_playbook",       # 44
    "no_ai_rollout_plan",        # 45
    "no_model_version_pinning",  # 46
    "infra_misconfig_signals",   # 47
    "no_tech_debt_tracking",     # 48
    "context_window_violations", # 49
    "phase_collapse_signs",      # 50
]

N = len(SIGNALS)
sig = {name: i for i, name in enumerate(SIGNALS)}

def w(primary, secondary=None, tertiary=None):
    vec = np.zeros(N)
    for s in (primary or []):
        vec[sig[s]] = 1.0
    for s in (secondary or []):
        vec[sig[s]] = 0.5
    for s in (tertiary or []):
        vec[sig[s]] = 0.25
    return vec

# ─── ALL PATHOLOGIES ─────────────────────────────────────────────────────────
PATHOLOGIES = [
    # ForgeDX
    ("P-001", "Architectural Drift",        "FDX", "CRITICAL",
     w(["no_navigation_root","no_layer_enforcement"], ["no_adr_files","inconsistent_naming"])),
    ("P-002", "Session Amnesia",            "FDX", "HIGH",
     w(["no_navigation_root","no_session_protocol"], ["no_adr_files"])),
    ("P-003", "Implicit Contract Syndrome", "FDX", "HIGH",
     w(["no_contract_tests","no_interface_definitions"], ["no_api_spec_doc"])),
    ("P-004", "Specification Debt",         "FDX", "CRITICAL",
     w(["no_spec_document","no_navigation_root"], ["no_adr_files","no_claude_md"])),
    ("P-005", "Context Overload",           "FDX", "HIGH",
     w(["monolithic_spec_file","no_spec_index"], ["high_file_count_no_index"])),
    ("P-006", "Verification Gap",           "FDX", "HIGH",
     w(["no_test_files","no_coverage_config"], ["no_ci_gate"])),
    ("P-007", "Rationale Loss",             "FDX", "MEDIUM",
     w(["no_adr_files","no_conventional_commits"], ["no_decision_log"])),
    ("P-008", "Layer Violation",            "FDX", "HIGH",
     w(["no_layer_enforcement","no_interface_definitions"], ["no_dependency_rules"])),
    ("P-009", "Naming Anarchy",             "FDX", "MEDIUM",
     w(["no_domain_vocabulary","inconsistent_naming"])),
    ("P-010", "Test Surface Blindness",     "FDX", "HIGH",
     w(["no_contract_tests","no_e2e_tests"], ["tests_not_behavioral"])),
    ("P-011", "ADR Absence",                "FDX", "MEDIUM",
     w(["no_adr_files","no_decision_log"])),
    ("P-012", "Contract Drift",             "FDX", "HIGH",
     w(["no_contract_tests","no_api_spec_doc"], ["no_executable_spec"])),
    ("P-013", "Unchecked Generation",       "FDX", "CRITICAL",
     w(["no_ci_gate","no_pre_commit_hooks"], ["no_test_files"])),
    ("P-014", "Silent Assumption",          "FDX", "HIGH",
     w(["no_forbidden_patterns","no_navigation_root"], ["no_defended_spec"])),
    ("P-015", "Stale Specification",        "FDX", "HIGH",
     w(["no_spec_document","no_adr_files"], ["no_session_protocol"])),
    ("P-016", "Dependency Tangle",          "FDX", "HIGH",
     w(["no_layer_enforcement","no_dependency_rules"], ["no_interface_definitions"])),
    ("P-017", "Code Duplication Creep",     "FDX", "MEDIUM",
     w(["no_duplication_gate","no_shared_utilities"], ["no_layer_enforcement"])),
    ("P-018", "Dead Code Accumulation",     "FDX", "LOW",
     w(["no_dead_code_gate","no_dependency_rules"])),
    ("P-019", "Environment Opacity",        "FDX", "MEDIUM",
     w(["no_env_example","no_readme"])),
    ("P-020", "Gate Erosion",               "FDX", "CRITICAL",
     w(["no_pre_commit_hooks","no_ci_gate"], ["no_forbidden_patterns"])),
    ("P-021", "Scope Creep Blindness",      "FDX", "HIGH",
     w(["no_spec_document","no_navigation_root"], ["no_adr_files"])),
    ("P-022", "Vocabulary Drift",           "FDX", "MEDIUM",
     w(["no_domain_vocabulary","inconsistent_naming"])),
    ("P-023", "Probe Absence",              "FDX", "HIGH",
     w(["no_contract_tests","no_executable_spec"], ["no_e2e_tests"])),
    ("P-024", "Spec-Last Development",      "FDX", "CRITICAL",
     w(["no_spec_document","spec_last_workflow"], ["no_session_protocol"])),
    ("P-025", "Port Rigidity",              "FDX", "MEDIUM",
     w(["no_interface_definitions","no_dependency_rules"], ["no_layer_enforcement"])),
    ("P-026", "Confidence Inflation",       "FDX", "HIGH",
     w(["llm_used_for_scoring","no_deterministic_scoring"], ["no_test_files"])),
    ("P-027", "Navigation Blindness",       "FDX", "HIGH",
     w(["no_navigation_root","no_spec_index","no_claude_md"])),
    ("P-028", "Regression Blindness",       "FDX", "HIGH",
     w(["no_regression_fixtures","no_pre_commit_hooks"], ["no_ci_gate"])),
    ("P-029", "Deployment Opacity",         "FDX", "MEDIUM",
     w(["no_deployment_doc","no_env_example"], ["no_executable_spec"])),
    # VairixDX-only
    ("V-001", "AI Security Blindspot",      "VDX", "CRITICAL",
     w(["no_ai_security_policy"], ["unauthorized_ai_tools","no_code_review_standards"])),
    ("V-002", "Bus Factor",                 "VDX", "CRITICAL",
     w(["bus_factor_risk","no_onboarding_docs"], ["no_team_ai_playbook","no_adr_files"])),
    ("V-003", "Shadow AI",                  "VDX", "HIGH",
     w(["unauthorized_ai_tools","no_ai_rollout_plan"], ["no_team_ai_playbook"])),
    ("V-004", "Skill Atrophy Syndrome",     "VDX", "HIGH",
     w(["skill_atrophy_signs","no_code_review_standards"])),
    ("V-005", "AI Hallucination Blindspot", "VDX", "HIGH",
     w(["no_code_review_standards","no_contract_tests"], ["no_test_files"])),
    ("V-006", "AI Output Drift",            "VDX", "HIGH",
     w(["no_session_protocol","no_navigation_root"], ["no_team_ai_playbook"])),
    ("V-007", "AI Productivity Paradox",    "VDX", "HIGH",
     w(["no_ai_measurement","no_tech_debt_tracking"])),
    ("V-008", "Prompt Illiteracy",          "VDX", "MEDIUM",
     w(["no_prompt_library","no_team_ai_playbook"])),
    ("V-009", "No Code Review Culture",     "VDX", "HIGH",
     w(["no_code_review_standards","no_pre_commit_hooks"], ["no_ci_gate"])),
    ("V-010", "Context Window Blindness",   "VDX", "MEDIUM",
     w(["context_window_violations","no_team_ai_playbook"])),
    ("V-011", "Phase Collapse TDD",         "VDX", "MEDIUM",
     w(["phase_collapse_signs","no_test_files"], ["no_ci_gate"])),
    ("V-012", "Broken Context Anti-Pattern","VDX", "MEDIUM",
     w(["no_team_ai_playbook","inconsistent_naming"], ["no_navigation_root"])),
    ("V-013", "Test Theater",               "VDX", "HIGH",
     w(["tests_not_behavioral","no_coverage_config"], ["no_contract_tests"])),
    ("V-014", "Ghost Failure Cascade",      "VDX", "HIGH",
     w(["infra_misconfig_signals","no_deployment_doc"])),
    ("V-015", "Accountability Vacuum",      "VDX", "HIGH",
     w(["no_ai_security_policy","no_code_review_standards"], ["no_ai_measurement"])),
    ("V-016", "Technical Debt Blindness",   "VDX", "HIGH",
     w(["no_tech_debt_tracking","no_adr_files"])),
    ("V-017", "Silent Upgrade Regression",  "VDX", "MEDIUM",
     w(["no_model_version_pinning","no_regression_fixtures"])),
    ("V-018", "AI-Accelerated Tech Debt",   "VDX", "HIGH",
     w(["no_tech_debt_tracking","no_duplication_gate"], ["no_dead_code_gate"])),
    ("V-019", "Stale Documentation Syndrome","VDX","HIGH",
     w(["no_spec_document","no_adr_files"], ["no_executable_spec"])),
    ("V-020", "Silo Syndrome",              "VDX", "HIGH",
     w(["bus_factor_risk","no_team_ai_playbook"], ["no_onboarding_docs"])),
    ("V-021", "Implicit Architecture",      "VDX", "CRITICAL",
     w(["no_navigation_root","no_layer_enforcement"], ["no_adr_files","no_claude_md"])),
    ("V-022", "Specification Absence",      "VDX", "CRITICAL",
     w(["no_spec_document","no_spec_index","no_navigation_root"])),
    ("V-023", "Vibe Coding Collapse",       "VDX", "CRITICAL",
     w(["spec_last_workflow","no_spec_document"], ["no_layer_enforcement","no_session_protocol"])),
    ("V-024", "DevOps Pipeline Fragility",  "VDX", "HIGH",
     w(["no_ci_gate","infra_misconfig_signals"], ["no_deployment_doc"])),
    ("V-025", "Uneven Adoption",            "VDX", "MEDIUM",
     w(["no_team_ai_playbook","no_ai_rollout_plan"])),
    ("V-026", "Mandate Without Method",     "VDX", "MEDIUM",
     w(["no_ai_rollout_plan","no_prompt_library","no_team_ai_playbook"])),
    ("V-027", "Junior Dev Death Spiral",    "VDX", "CRITICAL",
     w(["bus_factor_risk","skill_atrophy_signs","no_onboarding_docs"])),
    ("V-028", "Trust Erosion Cycle",        "VDX", "MEDIUM",
     w(["no_ai_measurement","no_code_review_standards"])),
]

codes   = [p[0] for p in PATHOLOGIES]
names   = [p[1] for p in PATHOLOGIES]
origins = [p[2] for p in PATHOLOGIES]
sevs    = [p[3] for p in PATHOLOGIES]
X = np.array([p[4] for p in PATHOLOGIES])

# ─── COSINE SIMILARITY MATRIX ────────────────────────────────────────────────
norms = np.linalg.norm(X, axis=1, keepdims=True)
norms[norms == 0] = 1e-9
X_norm = X / norms
COS = X_norm @ X_norm.T

# ─── PCA ─────────────────────────────────────────────────────────────────────
# Center the pathology matrix (pathologies as observations, signals as features)
Xc = X - X.mean(axis=0)
cov = Xc.T @ Xc / (len(X) - 1)
eigvals, eigvecs = np.linalg.eigh(cov)
idx = np.argsort(eigvals)[::-1]
eigvals = eigvals[idx]
eigvecs = eigvecs[:, idx]
explained = eigvals / (eigvals.sum() + 1e-9) * 100

print("=" * 75)
print("PRINCIPAL COMPONENTS — Top 12 Dimensions in Signal Space")
print("=" * 75)
cum = 0
for i in range(12):
    cum += explained[i]
    top_sigs = np.argsort(np.abs(eigvecs[:, i]))[::-1][:3]
    sig_names = [SIGNALS[j] for j in top_sigs]
    print(f"  PC{i+1:02d}  {explained[i]:5.1f}%  (cum {cum:5.1f}%)  "
          f"→ {sig_names[0]}")

# ─── HIGH COLLINEARITY PAIRS ─────────────────────────────────────────────────
print("\n" + "=" * 75)
print("HIGH COLLINEARITY PAIRS  (cosine similarity ≥ 0.80)")
print("=" * 75)
n = len(PATHOLOGIES)
pairs = []
for i in range(n):
    for j in range(i+1, n):
        sim = COS[i, j]
        if sim >= 0.80:
            pairs.append((sim, i, j))
pairs.sort(reverse=True)
for sim, i, j in pairs:
    print(f"  {sim:.2f}  [{codes[i]}] {names[i]:36} ↔  [{codes[j]}] {names[j]}")

# ─── UNIQUENESS RANKING ──────────────────────────────────────────────────────
print("\n" + "=" * 75)
print("UNIQUENESS SCORE  (avg cosine sim vs all others — lower = more unique)")
print("=" * 75)
uniq = []
for i in range(n):
    others = [COS[i, j] for j in range(n) if j != i]
    avg_sim = np.mean(others)
    max_sim = np.max(others)
    uniq.append((avg_sim, max_sim, i))
uniq.sort()

for avg, mx, i in uniq:
    flag = "★ HIGHLY UNIQUE" if avg < 0.12 else ("⚠ OVERLAP" if mx > 0.88 else "")
    print(f"  {codes[i]:6}  avg={avg:.2f}  max={mx:.2f}  "
          f"{names[i]:36} [{origins[i]}]  {flag}")

# ─── GREEDY MAX-ORTHOGONALITY MASTER LIST ────────────────────────────────────
print("\n" + "=" * 75)
print("MASTER LIST — Greedy Max-Orthogonality Selection")
print("Merge threshold: cosine similarity > 0.82 → absorbed by already-selected entry")
print("=" * 75)

MERGE_THRESHOLD = 0.82
selected = []
absorbed = {}   # i -> best_selected_idx

# Priority queue: CRITICAL first, then by uniqueness (avg sim ascending)
priority = sorted(range(n), key=lambda i: (
    0 if sevs[i] == "CRITICAL" else
    1 if sevs[i] == "HIGH" else
    2 if sevs[i] == "MEDIUM" else 3,
    uniq[i][0]  # avg similarity
))
# Re-sort uniq for lookup
uniq_map = {i: (avg, mx) for avg, mx, i in uniq}

for i in priority:
    if selected:
        max_sim_to_selected = max(COS[i, s] for s in selected)
    else:
        max_sim_to_selected = 0.0

    if max_sim_to_selected > MERGE_THRESHOLD:
        # Find which selected it's most similar to
        best_s = max(selected, key=lambda s: COS[i, s])
        absorbed[i] = best_s
    else:
        selected.append(i)

# Dimension mapping
dim_map = {
    "no_spec_document": "SPECIFICATION",
    "no_spec_index": "SPECIFICATION",
    "spec_last_workflow": "SPECIFICATION",
    "no_navigation_root": "AI NAVIGATION",
    "no_claude_md": "AI NAVIGATION",
    "no_session_protocol": "AI NAVIGATION",
    "monolithic_spec_file": "AI NAVIGATION",
    "context_window_violations": "AI NAVIGATION",
    "no_layer_enforcement": "ARCHITECTURE",
    "no_dependency_rules": "ARCHITECTURE",
    "no_interface_definitions": "ARCHITECTURE",
    "infra_misconfig_signals": "ARCHITECTURE",
    "no_adr_files": "KNOWLEDGE",
    "no_decision_log": "KNOWLEDGE",
    "no_domain_vocabulary": "KNOWLEDGE",
    "bus_factor_risk": "KNOWLEDGE",
    "no_test_files": "TESTING",
    "no_contract_tests": "TESTING",
    "no_e2e_tests": "TESTING",
    "no_executable_spec": "TESTING",
    "no_regression_fixtures": "TESTING",
    "tests_not_behavioral": "TESTING",
    "phase_collapse_signs": "TESTING",
    "no_ci_gate": "GATES",
    "no_pre_commit_hooks": "GATES",
    "no_forbidden_patterns": "GATES",
    "no_code_review_standards": "GATES",
    "llm_used_for_scoring": "AI QUALITY",
    "no_deterministic_scoring": "AI QUALITY",
    "no_ai_security_policy": "AI QUALITY",
    "unauthorized_ai_tools": "AI QUALITY",
    "no_ai_measurement": "AI QUALITY",
    "no_model_version_pinning": "AI QUALITY",
    "no_prompt_library": "AI ADOPTION",
    "no_team_ai_playbook": "AI ADOPTION",
    "skill_atrophy_signs": "AI ADOPTION",
    "no_ai_rollout_plan": "AI ADOPTION",
    "no_tech_debt_tracking": "CODE HEALTH",
    "no_duplication_gate": "CODE HEALTH",
    "no_dead_code_gate": "CODE HEALTH",
    "no_env_example": "OPERATIONS",
    "no_deployment_doc": "OPERATIONS",
    "no_onboarding_docs": "OPERATIONS",
    "no_readme": "OPERATIONS",
}

dims = defaultdict(list)
for i in selected:
    top_sig = SIGNALS[np.argmax(X[i])]
    dim = dim_map.get(top_sig, "OTHER")
    dims[dim].append(i)

dim_order = ["SPECIFICATION","AI NAVIGATION","ARCHITECTURE","KNOWLEDGE",
             "TESTING","GATES","AI QUALITY","AI ADOPTION","CODE HEALTH","OPERATIONS","OTHER"]

num = 1
master = []
print(f"\n  {'#':>3}  {'Code':6}  {'Sev':8}  {'Name':38}  Orig  Dimension")
print(f"  {'-'*3}  {'-'*6}  {'-'*8}  {'-'*38}  ----  ---------")
for dim in dim_order:
    if dim not in dims:
        continue
    print(f"\n  ── {dim} ──")
    for i in dims[dim]:
        print(f"  {num:>3}.  {codes[i]:6}  {sevs[i]:8}  {names[i]:38}  {origins[i]}")
        master.append(i)
        num += 1

print(f"\n  Total selected: {len(master)}")
print(f"  ForgeDX kept:  {sum(1 for i in master if origins[i]=='FDX')}")
print(f"  VairixDX new:  {sum(1 for i in master if origins[i]=='VDX')}")
print(f"  Absorbed:      {len(absorbed)}")

print("\n" + "=" * 75)
print("ABSORBED ENTRIES (would add no new signal dimension)")
print("=" * 75)
for i, best_s in sorted(absorbed.items(), key=lambda x: COS[x[0], x[1]], reverse=True):
    sim = COS[i, best_s]
    print(f"  [{codes[i]}] {names[i]:38} sim={sim:.2f}  → merged into [{codes[best_s]}] {names[best_s]}")

# ─── EIGENVALUE SUMMARY ──────────────────────────────────────────────────────
print("\n" + "=" * 75)
print("EIGENVALUE SUMMARY — How many truly independent dimensions exist?")
print("=" * 75)
meaningful = sum(1 for e in explained if e > 2.0)
print(f"  Dimensions explaining >2% of variance: {meaningful}")
print(f"  Dimensions explaining >5% of variance: {sum(1 for e in explained if e > 5.0)}")
print(f"  Top 10 PCs explain: {sum(explained[:10]):.1f}% of variance")
print(f"  → This means ~{meaningful} truly independent pathology axes exist in the signal space.")
print(f"  → {len(master)} canonical pathologies covering all {meaningful} axes is the sweet spot.")
