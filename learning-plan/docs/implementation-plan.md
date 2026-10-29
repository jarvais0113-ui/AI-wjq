# 起步学习工作台 Implementation Plan

> For agentic workers: Execute inline with superpowers:executing-plans. Track steps here.

Goal: A Chinese personal learning workspace that gives one clear next action and supports the agreed 24-lesson route and learning records.
Architecture: Buildless HTML/CSS and ES modules; curriculum from the existing teaching PDFs; browser-local versioned JSON state with export/import. Owner-private Sites hosting.
Tech Stack: Native browser APIs, Node test runner, Sites.
Spec: ../../outputs/Codex_第01课_学习工作台需求清单.pdf (canonical copy is in task outputs).

## Constraints and decisions
- Today, route, records are the three primary views; all 24 lessons have goal, steps, prompt, completion checks.
- Existing lesson01 is completed based on this conversation, so initial recommendation is lesson02.
- Initial creation is private. Progress stays in the current browser; no embedded AI or cloud sync.
- User authorized implementation after discussing the one-page requirements; execute without another plan approval.

## Review focus
- Resume an unfinished lesson before recommending a later one.
- All lessons complete yields a completion state, never an invalid lesson.
- Reject corrupt backups without replacing current data.
- No false saved status if browser storage is unavailable.
- Escape all user-authored text and preserve Unicode in export/import.

## Tasks
- [x] 1. Test next-task selection and backup validation; implement state.mjs. Run node --test tests/*.test.mjs.
- [x] 2. Implement responsive today/route/records UI, full curriculum, lesson steps, completion, notes and backups.
- [ ] 3. Check desktop and narrow layout; exercise resume, completion, records, reload and backup behavior. Package and deploy the same private Site.

## Progress
- Site identity registered; source manifest persisted.

- Browser QA: desktop1280 and narrow390 layouts; 24 lessons/8 weeks; step and draft persistence; completion advances to03; record edit/reload and literal angle brackets; JSON export, invalid backup rejection and successful initial-backup restore verified.
- Fresh review: fixed invalid step indices, keyboard-inaccessible import, skip-link navigation. Same-hash navigation reproduced and fixed. Four state tests pass.
- URL now tracks the open view/lesson and refresh restores the lesson.
- No user records are shipped; local browser test records were cleared by verified backup restore.
