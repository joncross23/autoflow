-- Fix questionnaire description to avoid numeric characters
-- This prevents Playwright test failures due to ambiguous getByText('1') selectors

UPDATE questionnaires
SET description = 'Help us understand your automation opportunities. This takes a few minutes and your responses will be analysed by AI to identify high-impact improvements.'
WHERE slug = 'automation-audit';
