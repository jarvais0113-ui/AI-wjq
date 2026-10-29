# Learning tracks implementation plan

Goal: Horizontal sticky switching between AI learning, Korean learning and school tasks, with separate progress and journals.
Architecture: Continue buildless modules. Preserve the existing storage key and migrate v1 AI state into v2 workspace.tracks.ai; Korean starts empty. School tasks contain only user-entered titles, courses and due dates.
Spec: User requests a floating horizontal switch, progressive Korean plan for a Japanese N2 speaker who is near-zero in Korean, alongside AI and university work. Default Korean pace proposed: 8 weeks / 24 sessions / 20-30 minutes plus 5-minute review.

- [x] Test legacy migration, track isolation, backup round-trip and deadline validation; implement workspace state.
- [x] Add switching, Korean lessons with on-page teaching, Japanese comparisons and official resources; adapt progress and journals by track.
- [x] Add school task entry/completion/deadlines and a separate journal.
- [x] Verify desktop/narrow layout, AI-data migration, switches, Korean lesson exercises, school CRUD and backup. Publish the existing Site with its existing audience.

Constraints: keep existing AI progress/records; no invented school tasks, audio recordings, language proficiency guarantees or cloud sync. Japanese is a bridge, not a pronunciation transcription system.
Review focus: old-state migration; per-track IDs; malformed imports; overdue date-only comparison; safe user-text rendering.

Validation: 9 state/backup tests green. Browser checked existing AI-state migration; school create/view/complete and journal reload; Korean 24 lessons, answer expansion, completion advance, isolated notes; combined backup downloaded, schema-validated and restored; narrow390 layout and sticky switch at y70 while scrolled; no browser console errors. Review fixed duplicate journal IDs. Native publication is the remaining handoff.
