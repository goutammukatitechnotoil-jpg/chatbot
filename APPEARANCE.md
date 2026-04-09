# Appearance Publishing Workflow

## Overview
This document defines the appearance update workflow for the chatbot. It describes how appearance changes are staged, tested, published, versioned, and reverted.

## Pages and routes
- `/appearance` — Appearance configuration and draft workflow.
- `/test-chatbot` — Preview and validation list for chatbot appearance changes.

## Requirement summary
1. When any appearance change occurs, create an entry in a temporary collection.
2. Link that temporary entry to the same chatbot listing in `/test-chatbot`.
3. Keep the change private until it is fully tested and approved.
4. When the change is verified, mark it public and update the chatbot preview.
5. If published, update the main existing table with the new appearance record.
6. Support reverting any appearance publish request for the chatbot.
7. When submitting a publish request, require a version number and release note.

## Workflow details

### 1. Create temporary entry for appearance changes
- Any modification on `/appearance` should not immediately overwrite production data.
- Instead, save the change into a temporary collection/table.
- The temporary entry should reference the same chatbot identifier used by `/test-chatbot`.
- This enables preview and validation of the appearance update before final publish.

### 2. Display in `/test-chatbot`
- The `/test-chatbot` list should show temporary appearance updates as a preview item.
- The temporary entry should remain hidden from public view until approval.
- The list should indicate whether the appearance draft is ready for approval or still under editing.

### 3. Public listing and review
- Once an appearance draft is complete and verified, move it toward public state.
- The system should have a clear action to mark the temporary appearance draft as public.
- The chatbot preview should reflect the appearance draft only after the public approval step.

### 4. Publish to main table
- When the appearance draft is published successfully, update the main existing table with the new appearance data.
- The published version becomes the current active appearance record for the chatbot.
- Keep the temporary draft for audit/history, but the live data is sourced from the main table.

### 5. Revert request support
- The system must be able to reject or revert any appearance publish request.
- Revert workflow may include:
  - canceling the temporary draft before publish,
  - restoring the previous published appearance data if a published update is rolled back,
  - marking a request as rejected with a reason.
- The revert action should preserve the safe backup of the last known good appearance.

### 6. Publish submission metadata
- When the user submits an appearance publish request, require:
  - `version` — semantic or release version identifier.
  - `release note` — short human-readable summary of the changes.
- This metadata is attached to the published appearance and stored in the main table.

## Data model suggestions
- `appearance_drafts` or `temporary_appearance_changes`
  - `id`
  - `chatbot_id`
  - `status` — draft, pending, approved, rejected, published
  - `data` — appearance settings JSON
  - `created_at`, `updated_at`
  - `submitted_by`
  - `version`
  - `release_note`
  - `review_comments`

- `appearance` or `chatbot_appearance`
  - `id`
  - `chatbot_id`
  - `data`
  - `version`
  - `release_note`
  - `published_at`
  - `published_by`

## User flow
1. User opens `/appearance` and updates appearance settings.
2. The app saves the changes as a draft in the temporary collection.
3. User visits `/test-chatbot` to preview the draft against the same chatbot listing.
4. When satisfied, the user submits a publish request.
5. The publish form asks for version and release note.
6. After approval, the draft is promoted to public and the main appearance table is updated.
7. If needed, the user can revert the request or rollback to the previous published appearance.

## Testing checklist
- [ ] Appearance edits create a temporary draft record.
- [ ] `/test-chatbot` shows the temporary draft linked to the correct chatbot.
- [ ] Temporary draft remains private until explicitly published.
- [ ] Publish request requires version and release note.
- [ ] Approved publish updates the main appearance table.
- [ ] Revert action cancels or rolls back requested appearance changes.
- [ ] Published chatbot preview reflects the most recent active appearance version.

## Notes
- The document is intended as a functional specification for implementing `/appearance` and the publish workflow.
- If any UI or route naming changes are required, the same workflow should apply to the new routes.
