-- ============================================================
-- EduResolve — Sample Complaints Seed Data
-- Run this in pgAdmin Query Tool
-- Covers: all categories, all statuses, escalation levels,
--         upvotes, assigned complaints, and escalation reasons
-- ============================================================

-- First, let's see what user IDs we have (run this first to check)
-- SELECT id, name, email, role FROM users ORDER BY id;

-- We use subqueries to find user IDs by email so this works on any machine

-- ─── ELECTRICAL COMPLAINTS (routes to SUPPORT_STAFF) ─────────────────────────

INSERT INTO complaints (title, description, student_id, category_id, status, upvote_count, escalation_level, created_at)
VALUES (
  'Street lights not working near Block C',
  'The street lights on the path from Block C to the main gate have been non-functional for the past 2 weeks. Students walking at night face safety issues especially during late library hours.',
  (SELECT id FROM users WHERE email = 'student@college.com'),
  (SELECT id FROM complaint_categories WHERE name = 'Electrical'),
  'OPEN', 12, 0, NOW() - INTERVAL '5 days'
);

INSERT INTO complaints (title, description, student_id, category_id, status, upvote_count, escalation_level, assigned_to, created_at)
VALUES (
  'Power cuts in Lab 3 during practical sessions',
  'Lab 3 on the 2nd floor experiences frequent power cuts during afternoon sessions between 2 PM and 4 PM. This is causing data loss and disrupting our practical exams. The UPS is also not functioning.',
  (SELECT id FROM users WHERE email = 'student@college.com'),
  (SELECT id FROM complaint_categories WHERE name = 'Electrical'),
  'IN_PROGRESS', 8, 0,
  (SELECT id FROM users WHERE email = 'staff@college.com'),
  NOW() - INTERVAL '3 days'
);

INSERT INTO complaints (title, description, student_id, category_id, status, upvote_count, escalation_level, escalation_reason, created_at)
VALUES (
  'Electrical short circuit in Girls Hostel corridor',
  'There was a minor short circuit in the 3rd floor corridor of Girls Hostel last Tuesday. The wiring is exposed and poses a serious fire hazard. Immediate attention required.',
  (SELECT id FROM users WHERE email = 'student@college.com'),
  (SELECT id FROM complaint_categories WHERE name = 'Electrical'),
  'ESCALATED', 25, 1,
  'Issue not resolved after 5 days. Exposed wiring is a safety hazard requiring coordinator intervention.',
  NOW() - INTERVAL '7 days'
);

INSERT INTO complaints (title, description, student_id, category_id, status, upvote_count, escalation_level, created_at)
VALUES (
  'Classroom fans not working in Room 204',
  'All 4 ceiling fans in Room 204 have stopped working. With summer temperatures above 40°C, it is impossible to sit through 2-hour lectures. Multiple students have complained of heat exhaustion.',
  (SELECT id FROM users WHERE email = 'student@college.com'),
  (SELECT id FROM complaint_categories WHERE name = 'Electrical'),
  'RESOLVED', 18, 0, NOW() - INTERVAL '10 days'
);

INSERT INTO complaints (title, description, student_id, category_id, status, upvote_count, escalation_level, escalation_reason, created_at)
VALUES (
  'Generator failure during semester exams',
  'The backup generator failed during the mid-semester examination on 15th March. Students lost 30 minutes of exam time. This is the third time this has happened this semester.',
  (SELECT id FROM users WHERE email = 'student@college.com'),
  (SELECT id FROM complaint_categories WHERE name = 'Electrical'),
  'ESCALATED', 42, 2,
  'Repeated generator failure during exams. Coordinator escalated to HOD as this requires departmental budget for generator replacement.',
  NOW() - INTERVAL '12 days'
);

-- ─── IT SUPPORT COMPLAINTS (routes to SUPPORT_STAFF) ─────────────────────────

INSERT INTO complaints (title, description, student_id, category_id, status, upvote_count, escalation_level, created_at)
VALUES (
  'College WiFi not working in academic block',
  'The WiFi network "GNITS_Academic" has been down since Monday morning. Over 200 students are unable to access online resources, submit assignments, or attend online classes. The issue affects all floors of the academic block.',
  (SELECT id FROM users WHERE email = 'student@college.com'),
  (SELECT id FROM complaint_categories WHERE name = 'IT Support'),
  'OPEN', 67, 0, NOW() - INTERVAL '2 days'
);

INSERT INTO complaints (title, description, student_id, category_id, status, upvote_count, escalation_level, assigned_to, created_at)
VALUES (
  'Student portal login not working for 3rd year students',
  'All 3rd year CSE students are unable to log into the student portal since the system update on 10th March. We cannot view our attendance, marks, or download hall tickets. Exams are in 2 weeks.',
  (SELECT id FROM users WHERE email = 'student@college.com'),
  (SELECT id FROM complaint_categories WHERE name = 'IT Support'),
  'IN_PROGRESS', 89, 0,
  (SELECT id FROM users WHERE email = 'staff@college.com'),
  NOW() - INTERVAL '4 days'
);

INSERT INTO complaints (title, description, student_id, category_id, status, upvote_count, escalation_level, created_at)
VALUES (
  'Projector in Seminar Hall not working',
  'The projector in the main seminar hall has been malfunctioning for 2 weeks. Guest lectures and presentations are being disrupted. The HDMI port is broken and the remote is missing.',
  (SELECT id FROM users WHERE email = 'student@college.com'),
  (SELECT id FROM complaint_categories WHERE name = 'IT Support'),
  'RESOLVED', 5, 0, NOW() - INTERVAL '15 days'
);

INSERT INTO complaints (title, description, student_id, category_id, status, upvote_count, escalation_level, escalation_reason, created_at)
VALUES (
  'Biometric attendance system not recording properly',
  'The biometric attendance machine on the 4th floor is marking students as absent even when they scan their fingerprints. This is affecting attendance percentage and scholarship eligibility for many students.',
  (SELECT id FROM users WHERE email = 'student@college.com'),
  (SELECT id FROM complaint_categories WHERE name = 'IT Support'),
  'ESCALATED', 34, 1,
  'Biometric issue affecting 80+ students attendance records. Requires coordinator approval to manually correct attendance data.',
  NOW() - INTERVAL '6 days'
);

INSERT INTO complaints (title, description, student_id, category_id, status, upvote_count, escalation_level, created_at)
VALUES (
  'Computer lab systems running very slow',
  'All 40 computers in Computer Lab 2 are extremely slow. It takes 10 minutes just to open Visual Studio. The RAM appears to be insufficient for current software requirements. This is affecting our programming practicals.',
  (SELECT id FROM users WHERE email = 'student@college.com'),
  (SELECT id FROM complaint_categories WHERE name = 'IT Support'),
  'OPEN', 23, 0, NOW() - INTERVAL '1 day'
);

-- ─── PLUMBING COMPLAINTS (routes to SUPPORT_STAFF) ───────────────────────────

INSERT INTO complaints (title, description, student_id, category_id, status, upvote_count, escalation_level, created_at)
VALUES (
  'Water leakage in ground floor washroom',
  'There is a major water pipe leakage in the ground floor mens washroom near the canteen. Water is flooding the corridor and creating a slipping hazard. The issue has been present for 3 days.',
  (SELECT id FROM users WHERE email = 'student@college.com'),
  (SELECT id FROM complaint_categories WHERE name = 'Plumbing'),
  'OPEN', 15, 0, NOW() - INTERVAL '3 days'
);

INSERT INTO complaints (title, description, student_id, category_id, status, upvote_count, escalation_level, assigned_to, created_at)
VALUES (
  'No water supply in 2nd floor washrooms',
  'The water supply to all washrooms on the 2nd floor of the academic block has been cut off since yesterday morning. Students are forced to use ground floor facilities causing long queues between classes.',
  (SELECT id FROM users WHERE email = 'student@college.com'),
  (SELECT id FROM complaint_categories WHERE name = 'Plumbing'),
  'IN_PROGRESS', 31, 0,
  (SELECT id FROM users WHERE email = 'staff@college.com'),
  NOW() - INTERVAL '2 days'
);

INSERT INTO complaints (title, description, student_id, category_id, status, upvote_count, escalation_level, escalation_reason, created_at)
VALUES (
  'Sewage overflow near the canteen area',
  'The sewage drain near the main canteen has been overflowing since last week. The smell is unbearable and is affecting students eating in the canteen. Health hazard for the entire campus.',
  (SELECT id FROM users WHERE email = 'student@college.com'),
  (SELECT id FROM complaint_categories WHERE name = 'Plumbing'),
  'ESCALATED', 56, 2,
  'Sewage overflow is a serious health hazard. Staff and coordinator unable to resolve — requires HOD intervention for emergency maintenance budget.',
  NOW() - INTERVAL '8 days'
);

INSERT INTO complaints (title, description, student_id, category_id, status, upvote_count, escalation_level, created_at)
VALUES (
  'Drinking water cooler not working on 3rd floor',
  'The RO water purifier and cooler on the 3rd floor has not been working for 10 days. Students have to go all the way to the ground floor for drinking water during class breaks.',
  (SELECT id FROM users WHERE email = 'student@college.com'),
  (SELECT id FROM complaint_categories WHERE name = 'Plumbing'),
  'RESOLVED', 9, 0, NOW() - INTERVAL '14 days'
);

-- ─── LIBRARY COMPLAINTS (routes to LIBRARIAN) ────────────────────────────────

INSERT INTO complaints (title, description, student_id, category_id, status, upvote_count, escalation_level, created_at)
VALUES (
  'Reference books for Data Structures not available',
  'The library does not have sufficient copies of "Introduction to Algorithms" by CLRS. There are only 2 copies for 180 students in 3rd year CSE. Students are unable to prepare for exams properly.',
  (SELECT id FROM users WHERE email = 'student@college.com'),
  (SELECT id FROM complaint_categories WHERE name = 'Library'),
  'OPEN', 44, 0, NOW() - INTERVAL '4 days'
);

INSERT INTO complaints (title, description, student_id, category_id, status, upvote_count, escalation_level, created_at)
VALUES (
  'Library closes too early during exam season',
  'The library closes at 6 PM but during exam season students need access until at least 10 PM. Other colleges in the city keep their libraries open till midnight during exams. Please extend library hours.',
  (SELECT id FROM users WHERE email = 'student@college.com'),
  (SELECT id FROM complaint_categories WHERE name = 'Library'),
  'IN_PROGRESS', 78, 0, NOW() - INTERVAL '5 days'
);

INSERT INTO complaints (title, description, student_id, category_id, status, upvote_count, escalation_level, created_at)
VALUES (
  'Library fine system is unfair for medical leave',
  'Students who were on medical leave are being charged late return fines even though they submitted medical certificates. The system should automatically waive fines for students with approved medical leave.',
  (SELECT id FROM users WHERE email = 'student@college.com'),
  (SELECT id FROM complaint_categories WHERE name = 'Library'),
  'OPEN', 33, 0, NOW() - INTERVAL '1 day'
);

INSERT INTO complaints (title, description, student_id, category_id, status, upvote_count, escalation_level, escalation_reason, created_at)
VALUES (
  'Digital library access not working from hostel',
  'The NPTEL and IEEE digital library access is blocked from the hostel network. Students can only access it from the college network. This prevents studying after college hours.',
  (SELECT id FROM users WHERE email = 'student@college.com'),
  (SELECT id FROM complaint_categories WHERE name = 'Library'),
  'ESCALATED', 61, 1,
  'Digital library access issue affects all hostel students. Librarian escalated to Admin as it requires IT network policy change.',
  NOW() - INTERVAL '9 days'
);

INSERT INTO complaints (title, description, student_id, category_id, status, upvote_count, escalation_level, created_at)
VALUES (
  'Reading room chairs are broken and uncomfortable',
  'More than 15 chairs in the reading room have broken armrests or wobbly legs. Students cannot sit comfortably for long study sessions. Some chairs are a safety hazard.',
  (SELECT id FROM users WHERE email = 'student@college.com'),
  (SELECT id FROM complaint_categories WHERE name = 'Library'),
  'RESOLVED', 7, 0, NOW() - INTERVAL '20 days'
);

-- ─── TRANSPORT COMPLAINTS (routes to TRANSPORT_MANAGER) ──────────────────────

INSERT INTO complaints (title, description, student_id, category_id, status, upvote_count, escalation_level, created_at)
VALUES (
  'Bus Route 7 always arrives 30 minutes late',
  'Bus Route 7 covering Dilsukhnagar to college is consistently 25-35 minutes late every morning. Students are missing the first period regularly and getting marked absent. This has been happening for the past month.',
  (SELECT id FROM users WHERE email = 'student@college.com'),
  (SELECT id FROM complaint_categories WHERE name = 'Transport'),
  'OPEN', 52, 0, NOW() - INTERVAL '3 days'
);

INSERT INTO complaints (title, description, student_id, category_id, status, upvote_count, escalation_level, created_at)
VALUES (
  'Bus driver behavior is reckless and dangerous',
  'The driver of Bus Route 3 drives at very high speed and brakes suddenly. Several students have fallen and been injured. He also uses his mobile phone while driving. This is a serious safety concern.',
  (SELECT id FROM users WHERE email = 'student@college.com'),
  (SELECT id FROM complaint_categories WHERE name = 'Transport'),
  'IN_PROGRESS', 38, 0, NOW() - INTERVAL '2 days'
);

INSERT INTO complaints (title, description, student_id, category_id, status, upvote_count, escalation_level, escalation_reason, created_at)
VALUES (
  'No bus service for students staying in Mehdipatnam',
  'There is no college bus route covering Mehdipatnam area where approximately 45 students reside. They have to spend Rs. 150-200 daily on auto/cab which is a financial burden. Please add a new route.',
  (SELECT id FROM users WHERE email = 'student@college.com'),
  (SELECT id FROM complaint_categories WHERE name = 'Transport'),
  'ESCALATED', 71, 1,
  'New bus route requires Admin approval and budget allocation. Transport Manager escalated as this is beyond operational authority.',
  NOW() - INTERVAL '11 days'
);

INSERT INTO complaints (title, description, student_id, category_id, status, upvote_count, escalation_level, created_at)
VALUES (
  'Bus AC not working during summer',
  'The AC in Bus Route 5 has not been working for 3 weeks. With temperatures above 42°C, the 45-minute journey is extremely uncomfortable. Students are arriving at college sweaty and exhausted.',
  (SELECT id FROM users WHERE email = 'student@college.com'),
  (SELECT id FROM complaint_categories WHERE name = 'Transport'),
  'RESOLVED', 29, 0, NOW() - INTERVAL '18 days'
);

INSERT INTO complaints (title, description, student_id, category_id, status, upvote_count, escalation_level, created_at)
VALUES (
  'Bus pass renewal process is too complicated',
  'The bus pass renewal requires visiting 3 different offices and takes 2-3 days. Other colleges have online renewal. The current process causes students to travel without valid passes and face fines.',
  (SELECT id FROM users WHERE email = 'student@college.com'),
  (SELECT id FROM complaint_categories WHERE name = 'Transport'),
  'OPEN', 19, 0, NOW() - INTERVAL '6 days'
);

-- ─── HOSTEL COMPLAINTS (routes to WARDEN) ────────────────────────────────────

INSERT INTO complaints (title, description, student_id, category_id, status, upvote_count, escalation_level, created_at)
VALUES (
  'Hostel mess food quality is very poor',
  'The quality of food served in the hostel mess has deteriorated significantly over the past month. The food is often undercooked, lacks nutrition, and sometimes has insects. Many students have fallen sick.',
  (SELECT id FROM users WHERE email = 'student@college.com'),
  (SELECT id FROM complaint_categories WHERE name = 'Hostel'),
  'OPEN', 93, 0, NOW() - INTERVAL '4 days'
);

INSERT INTO complaints (title, description, student_id, category_id, status, upvote_count, escalation_level, created_at)
VALUES (
  'Hot water not available in hostel bathrooms',
  'The geysers in the boys hostel Block B have not been working for 2 weeks. Students are forced to bathe with cold water even in winter mornings. This is causing health issues.',
  (SELECT id FROM users WHERE email = 'student@college.com'),
  (SELECT id FROM complaint_categories WHERE name = 'Hostel'),
  'IN_PROGRESS', 41, 0, NOW() - INTERVAL '3 days'
);

INSERT INTO complaints (title, description, student_id, category_id, status, upvote_count, escalation_level, escalation_reason, created_at)
VALUES (
  'Hostel room roof is leaking during rains',
  'Rooms 301, 302, and 305 in Block A have severe roof leakage during rains. Students belongings including laptops and books are getting damaged. The issue has been reported 3 times but not fixed.',
  (SELECT id FROM users WHERE email = 'student@college.com'),
  (SELECT id FROM complaint_categories WHERE name = 'Hostel'),
  'ESCALATED', 47, 1,
  'Roof repair requires structural work beyond warden authority. Escalated to Hostel Manager for emergency maintenance approval.',
  NOW() - INTERVAL '10 days'
);

INSERT INTO complaints (title, description, student_id, category_id, status, upvote_count, escalation_level, created_at)
VALUES (
  'Hostel gate closes too early at 9 PM',
  'The hostel gate closes at 9 PM which is too early. Students returning from library, labs, or evening sports activities are locked out. Other hostels in the city allow entry till 10:30 PM.',
  (SELECT id FROM users WHERE email = 'student@college.com'),
  (SELECT id FROM complaint_categories WHERE name = 'Hostel'),
  'OPEN', 66, 0, NOW() - INTERVAL '2 days'
);

INSERT INTO complaints (title, description, student_id, category_id, status, upvote_count, escalation_level, escalation_reason, created_at)
VALUES (
  'Hostel WiFi speed is extremely slow after 8 PM',
  'The hostel WiFi becomes unusable after 8 PM when all students are online. Speed drops to below 0.5 Mbps making it impossible to study online, attend webinars, or submit assignments.',
  (SELECT id FROM users WHERE email = 'student@college.com'),
  (SELECT id FROM complaint_categories WHERE name = 'Hostel'),
  'ESCALATED', 88, 2,
  'WiFi bandwidth upgrade requires Admin-level budget approval. Hostel Manager escalated as this affects 300+ hostel students.',
  NOW() - INTERVAL '14 days'
);

INSERT INTO complaints (title, description, student_id, category_id, status, upvote_count, escalation_level, created_at)
VALUES (
  'Cockroach infestation in hostel mess kitchen',
  'There is a severe cockroach infestation in the hostel mess kitchen. Students have found cockroaches in their food on multiple occasions. This is a serious hygiene and health issue.',
  (SELECT id FROM users WHERE email = 'student@college.com'),
  (SELECT id FROM complaint_categories WHERE name = 'Hostel'),
  'RESOLVED', 55, 0, NOW() - INTERVAL '22 days'
);

INSERT INTO complaints (title, description, student_id, category_id, status, upvote_count, escalation_level, created_at)
VALUES (
  'Hostel laundry machines not working',
  'Both washing machines in the hostel laundry room have been out of order for 3 weeks. Students are washing clothes by hand which is time-consuming. Please repair or replace the machines.',
  (SELECT id FROM users WHERE email = 'student@college.com'),
  (SELECT id FROM complaint_categories WHERE name = 'Hostel'),
  'IN_PROGRESS', 22, 0, NOW() - INTERVAL '5 days'
);

-- ─── ADD SOME UPVOTE RECORDS ──────────────────────────────────────────────────
-- This simulates students upvoting complaints
-- We add upvotes from the student account for the most popular complaints

-- Note: The upvote_count is already set above in the complaints.
-- The upvotes table tracks WHO upvoted WHICH complaint to prevent duplicates.
-- We skip inserting into upvotes table here since we don't have multiple student accounts
-- but the counts are already set realistically above.

-- ─── VERIFY: Show all complaints with their details ───────────────────────────
SELECT 
    c.id,
    c.title,
    cat.name as category,
    c.status,
    c.upvote_count,
    c.escalation_level,
    c.created_at::date as date
FROM complaints c
LEFT JOIN complaint_categories cat ON c.category_id = cat.id
ORDER BY c.created_at DESC;
