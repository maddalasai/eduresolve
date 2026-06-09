-- ============================================================
-- EduResolve — Run this in pgAdmin Query Tool
-- This adds any missing columns needed for the new features
-- ============================================================

-- 1. Add routes_to column to complaint_categories
--    This tells the system which role handles each category
ALTER TABLE complaint_categories 
ADD COLUMN IF NOT EXISTS routes_to VARCHAR(50) DEFAULT 'SUPPORT_STAFF';

-- 2. Update existing categories with correct routing
--    Adjust these based on your actual category names
UPDATE complaint_categories SET routes_to = 'WARDEN' 
WHERE LOWER(name) LIKE '%hostel%' OR LOWER(name) LIKE '%room%' OR LOWER(name) LIKE '%mess%';

UPDATE complaint_categories SET routes_to = 'LIBRARIAN' 
WHERE LOWER(name) LIKE '%librar%' OR LOWER(name) LIKE '%book%';

UPDATE complaint_categories SET routes_to = 'TRANSPORT_MANAGER' 
WHERE LOWER(name) LIKE '%transport%' OR LOWER(name) LIKE '%bus%';

-- 3. Make sure upvotes table exists
CREATE TABLE IF NOT EXISTS upvotes (
    id SERIAL PRIMARY KEY,
    complaint_id INTEGER REFERENCES complaints(id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(complaint_id, user_id)  -- prevents double upvoting
);

-- 4. Make sure upvote_count column exists on complaints
ALTER TABLE complaints 
ADD COLUMN IF NOT EXISTS upvote_count INTEGER DEFAULT 0;

-- 5. Make sure escalation columns exist
ALTER TABLE complaints 
ADD COLUMN IF NOT EXISTS escalation_level INTEGER DEFAULT 0;

ALTER TABLE complaints 
ADD COLUMN IF NOT EXISTS escalation_reason TEXT;

ALTER TABLE complaints 
ADD COLUMN IF NOT EXISTS assigned_to INTEGER REFERENCES users(id);

-- 6. Check what categories you have (run this to see)
SELECT id, name, routes_to FROM complaint_categories ORDER BY name;
