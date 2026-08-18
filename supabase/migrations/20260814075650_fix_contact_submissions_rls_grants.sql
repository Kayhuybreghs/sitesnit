-- Revoke excessive privileges from anon and authenticated roles.
-- The contact form only needs INSERT. SELECT/UPDATE/DELETE allow
-- anyone with the anon key to read, modify, or delete all submissions.

REVOKE SELECT, UPDATE, DELETE ON contact_submissions FROM anon;
REVOKE SELECT, UPDATE, DELETE ON contact_submissions FROM authenticated;

-- Grant only INSERT to both roles (the form needs to write new rows)
GRANT INSERT ON contact_submissions TO anon;
GRANT INSERT ON contact_submissions TO authenticated;

-- Restrict insertable columns to only what the form actually uses.
-- First revoke the broad column-level grant, then grant only needed columns.
REVOKE INSERT (id, created_at, first_name, last_name, phone, email, project_type, approach, message, page, package_choice, company, call_date, call_time) ON contact_submissions FROM anon;
REVOKE INSERT (id, created_at, first_name, last_name, phone, email, project_type, approach, message, page, package_choice, company, call_date, call_time) ON contact_submissions FROM authenticated;

-- Grant insert only on the columns the form populates.
-- id and created_at have defaults, so the form doesn't need to set them.
GRANT INSERT (first_name, company, email, project_type, approach, package_choice, message, page, call_date, call_time) ON contact_submissions TO anon;
GRANT INSERT (first_name, company, email, project_type, approach, package_choice, message, page, call_date, call_time) ON contact_submissions TO authenticated;