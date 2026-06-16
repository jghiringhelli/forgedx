# ADR-006 — GS Pathology Catalog from White Paper

**Date:** 2026-06-11
**Status:** Accepted
**Context:**
VairixDX uses a generic AI maturity knowledge base (53 diseases, 27 vitamins). ForgeDX serves a different domain: GS readiness diagnostic. The knowledge base must encode GS-specific failure modes.

**Decision:** Derive the pathology catalog from the 29 named GS pathologies in the Generative Specification white paper (Juan Carlos Ghiringhelli, PragmaWorks, 2026).

**Rationale:**
1. **Domain specificity.** ForgeDX's value proposition is GS-specific diagnosis. A generic AI maturity catalog would produce generic advice. The white paper catalog produces precise, actionable GS-specific prescriptions.
2. **Evidence-backed.** The 29 pathologies are derived from 6 production projects and confirmed by controlled experiments (AX, DX, EX, KX, ALX, RX). Each pathology has observed production evidence.
3. **Complete in MVP.** All 29 pathologies can be scored in MVP (vs VairixDX's 10 of 53) because the catalog is well-defined and finite.
4. **Self-referential demonstration.** ForgeDX is itself built with GS discipline. Diagnosing teams using the GS catalog demonstrates the methodology in action — the tool IS the argument for the course.
5. **Authority.** Juan Carlos Ghiringhelli is the author of the GS methodology and the PragmaWorks Skool course. The catalog is the canonical source, not a third-party interpretation.

**Consequences:**
- ✅ Every pathology has a direct connection to a GS practice (remedy)
- ✅ The catalog is stable (29 pathologies from the white paper) — not subject to scope creep
- ✅ Demo value: showing teams their pathology map in the GS framework is a direct funnel to the course
- ⚠️ The catalog requires authoring 29 scoring rule sets — high authoring cost, done once, enduring value
- ⚠️ Pathologies are GS-specific, not general — ForgeDX is NOT a general AI maturity tool (by design)
