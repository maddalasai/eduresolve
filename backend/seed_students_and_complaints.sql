-- ============================================================
-- EduResolve — Add 10 New Students + Their Complaints
-- Run this in pgAdmin Query Tool
-- All student passwords = 'password'
-- ============================================================

-- ─── STEP 1: ADD 10 NEW STUDENTS ─────────────────────────────────────────────

INSERT INTO users (name, email, password, role) VALUES
('Priya Sharma',    'priya@college.com',    '$2b$10$6SbWTxlH1SLey0KB.HL51OebV2z3M1ma7tHHGirVQYDKyy.sbq.HG', 'STUDENT'),
('Rahul Verma',     'rahul@college.com',    '$2b$10$6SbWTxlH1SLey0KB.HL51OebV2z3M1ma7tHHGirVQYDKyy.sbq.HG', 'STUDENT'),
('Anjali Reddy',    'anjali@college.com',   '$2b$10$6SbWTxlH1SLey0KB.HL51OebV2z3M1ma7tHHGirVQYDKyy.sbq.HG', 'STUDENT'),
('Kiran Kumar',     'kiran@college.com',    '$2b$10$6SbWTxlH1SLey0KB.HL51OebV2z3M1ma7tHHGirVQYDKyy.sbq.HG', 'STUDENT'),
('Sneha Patel',     'sneha@college.com',    '$2b$10$6SbWTxlH1SLey0KB.HL51OebV2z3M1ma7tHHGirVQYDKyy.sbq.HG', 'STUDENT'),
('Arjun Nair',      'arjun@college.com',    '$2b$10$6SbWTxlH1SLey0KB.HL51OebV2z3M1ma7tHHGirVQYDKyy.sbq.HG', 'STUDENT'),
('Divya Menon',     'divya@college.com',    '$2b$10$6SbWTxlH1SLey0KB.HL51OebV2z3M1ma7tHHGirVQYDKyy.sbq.HG', 'STUDENT'),
('Vikram Singh',    'vikram@college.com',   '$2b$10$6SbWTxlH1SLey0KB.HL51OebV2z3M1ma7tHHGirVQYDKyy.sbq.HG', 'STUDENT'),
('Meera Iyer',      'meera@college.com',    '$2b$10$6SbWTxlH1SLey0KB.HL51OebV2z3M1ma7tHHGirVQYDKyy.sbq.HG', 'STUDENT'),
('Rohit Gupta',     'rohit@college.com',    '$2b$10$6SbWTxlH1SLey0KB.HL51OebV2z3M1ma7tHHGirVQYDKyy.sbq.HG', 'STUDENT');


-- ─── STEP 2: ADD COMPLAINTS FROM EACH STUDENT ────────────────────────────────
-- Each student submits 2-3 complaints across different categories

-- PRIYA SHARMA — Electrical + Library
INSERT INTO complaints (title, description, student_id, category_id, status, upvote_count, escalation_level, created_at)
VALUES (
  'Tube lights flickering in Room 101',
  'The tube lights in classroom 101 have been flickering for a week. It causes eye strain during long lectures. Multiple students have complained of headaches.',
  (SELECT id FROM users WHERE email = 'priya@college.com'),
  (SELECT id FROM complaint_categories WHERE name = 'Electrical'),
  'OPEN', 7, 0, NOW() - INTERVAL '2 days'
);

INSERT INTO complaints (title, description, student_id, category_id, status, upvote_count, escalation_level, created_at)
VALUES (
  'New semester textbooks not yet added to library',
  'The 5th semester syllabus changed 2 months ago but the library still has not added the new prescribed textbooks. Students are buying expensive books themselves.',
  (SELECT id FROM users WHERE email = 'priya@college.com'),
  (SELECT id FROM complaint_categories WHERE name = 'Library'),
  'IN_PROGRESS', 29, 0, NOW() - INTERVAL '6 days'
);

-- RAHUL VERMA — IT Support + Transport
INSERT INTO complaints (title, description, student_id, category_id, status, upvote_count, escalation_level, created_at)
VALUES (
  'College email IDs not working for freshers',
  'All 2024 batch students have not received their official college email IDs yet. We cannot access Google Classroom, Microsoft Teams, or any college portal. Classes started 3 weeks ago.',
  (SELECT id FROM users WHERE email = 'rahul@college.com'),
  (SELECT id FROM complaint_categories WHERE name = 'IT Support'),
  'OPEN', 54, 0, NOW() - INTERVAL '3 days'
);

INSERT INTO complaints (title, description, student_id, category_id, status, upvote_count, escalation_level, created_at)
VALUES (
  'Bus Route 2 skips stop near Ameerpet metro',
  'The driver of Bus Route 2 regularly skips the Ameerpet metro stop without stopping. Around 20 students board from there daily and are left stranded.',
  (SELECT id FROM users WHERE email = 'rahul@college.com'),
  (SELECT id FROM complaint_categories WHERE name = 'Transport'),
  'OPEN', 21, 0, NOW() - INTERVAL '1 day'
);

-- ANJALI REDDY — Hostel + Plumbing
INSERT INTO complaints (title, description, student_id, category_id, status, upvote_count, escalation_level, created_at)
VALUES (
  'Hostel room allocation is unfair',
  'Final year students are being given smaller rooms on higher floors while 1st year students got bigger rooms on ground floor. The allocation process is not transparent. Please publish the criteria.',
  (SELECT id FROM users WHERE email = 'anjali@college.com'),
  (SELECT id FROM complaint_categories WHERE name = 'Hostel'),
  'OPEN', 38, 0, NOW() - INTERVAL '4 days'
);

INSERT INTO complaints (title, description, student_id, category_id, status, upvote_count, escalation_level, assigned_to, created_at)
VALUES (
  'Bathroom taps leaking in Girls Hostel Block A',
  'Almost all bathroom taps in Girls Hostel Block A are leaking continuously. This is wasting a huge amount of water and the constant dripping sound disturbs sleep at night.',
  (SELECT id FROM users WHERE email = 'anjali@college.com'),
  (SELECT id FROM complaint_categories WHERE name = 'Plumbing'),
  'IN_PROGRESS', 14, 0,
  (SELECT id FROM users WHERE email = 'staff@college.com'),
  NOW() - INTERVAL '5 days'
);

-- KIRAN KUMAR — Electrical + IT Support
INSERT INTO complaints (title, description, student_id, category_id, status, upvote_count, escalation_level, created_at)
VALUES (
  'No power sockets in the new library reading room',
  'The newly renovated reading room has no power sockets for students to charge laptops. Students have to leave mid-session when battery dies. Please install charging points.',
  (SELECT id FROM users WHERE email = 'kiran@college.com'),
  (SELECT id FROM complaint_categories WHERE name = 'Electrical'),
  'OPEN', 45, 0, NOW() - INTERVAL '7 days'
);

INSERT INTO complaints (title, description, student_id, category_id, status, upvote_count, escalation_level, escalation_reason, created_at)
VALUES (
  'Online exam portal crashes during exams',
  'The online exam portal crashes repeatedly during internal assessments. During the last exam, 15 students lost their answers and had to restart. This is causing unfair evaluation.',
  (SELECT id FROM users WHERE email = 'kiran@college.com'),
  (SELECT id FROM complaint_categories WHERE name = 'IT Support'),
  'ESCALATED', 76, 1,
  'Portal crashes during exams affecting student grades. IT staff unable to fix — requires coordinator to contact software vendor.',
  NOW() - INTERVAL '8 days'
);

-- SNEHA PATEL — Library + Hostel
INSERT INTO complaints (title, description, student_id, category_id, status, upvote_count, escalation_level, created_at)
VALUES (
  'Library silent zone is too noisy',
  'The designated silent study zone in the library is constantly noisy because staff members have loud phone conversations there. Students cannot concentrate. Please enforce silence rules.',
  (SELECT id FROM users WHERE email = 'sneha@college.com'),
  (SELECT id FROM complaint_categories WHERE name = 'Library'),
  'OPEN', 17, 0, NOW() - INTERVAL '2 days'
);

INSERT INTO complaints (title, description, student_id, category_id, status, upvote_count, escalation_level, created_at)
VALUES (
  'Hostel mess timings clash with evening classes',
  'Dinner is served from 7 PM to 8 PM but many students have classes till 7:30 PM. By the time they reach the mess, food is over. Please extend dinner timing to 8:30 PM.',
  (SELECT id FROM users WHERE email = 'sneha@college.com'),
  (SELECT id FROM complaint_categories WHERE name = 'Hostel'),
  'IN_PROGRESS', 62, 0, NOW() - INTERVAL '9 days'
);

-- ARJUN NAIR — Transport + Electrical
INSERT INTO complaints (title, description, student_id, category_id, status, upvote_count, escalation_level, created_at)
VALUES (
  'No bus service on Saturdays for lab students',
  'Students who have Saturday lab sessions have no college bus service. They have to arrange private transport at their own expense. Saturday labs are compulsory for all 3rd year students.',
  (SELECT id FROM users WHERE email = 'arjun@college.com'),
  (SELECT id FROM complaint_categories WHERE name = 'Transport'),
  'OPEN', 33, 0, NOW() - INTERVAL '3 days'
);

INSERT INTO complaints (title, description, student_id, category_id, status, upvote_count, escalation_level, created_at)
VALUES (
  'Inverter backup not working in exam hall',
  'During the last power cut, the inverter in Exam Hall 1 did not switch on. Students sat in complete darkness for 20 minutes. This cannot happen during final exams.',
  (SELECT id FROM users WHERE email = 'arjun@college.com'),
  (SELECT id FROM complaint_categories WHERE name = 'Electrical'),
  'RESOLVED', 11, 0, NOW() - INTERVAL '16 days'
);

-- DIVYA MENON — Plumbing + Hostel
INSERT INTO complaints (title, description, student_id, category_id, status, upvote_count, escalation_level, created_at)
VALUES (
  'Water supply cut off during morning hours',
  'Water supply to the academic block is cut off every morning from 6 AM to 9 AM for maintenance. This is the peak time when students need water. Please schedule maintenance at night.',
  (SELECT id FROM users WHERE email = 'divya@college.com'),
  (SELECT id FROM complaint_categories WHERE name = 'Plumbing'),
  'OPEN', 26, 0, NOW() - INTERVAL '4 days'
);

INSERT INTO complaints (title, description, student_id, category_id, status, upvote_count, escalation_level, escalation_reason, created_at)
VALUES (
  'Hostel security guard misbehaves with students',
  'The night security guard at the hostel main gate is rude and uses inappropriate language with female students. Multiple students have complained but no action has been taken.',
  (SELECT id FROM users WHERE email = 'divya@college.com'),
  (SELECT id FROM complaint_categories WHERE name = 'Hostel'),
  'ESCALATED', 83, 2,
  'Serious misconduct complaint. Warden and Hostel Manager both escalated — requires Admin-level HR action against the security guard.',
  NOW() - INTERVAL '13 days'
);

-- VIKRAM SINGH — IT Support + Transport
INSERT INTO complaints (title, description, student_id, category_id, status, upvote_count, escalation_level, created_at)
VALUES (
  'CCTV cameras not working in parking area',
  'The CCTV cameras in the two-wheeler parking area have been non-functional for a month. Two bikes were stolen last week. Students feel unsafe parking their vehicles on campus.',
  (SELECT id FROM users WHERE email = 'vikram@college.com'),
  (SELECT id FROM complaint_categories WHERE name = 'IT Support'),
  'OPEN', 48, 0, NOW() - INTERVAL '5 days'
);

INSERT INTO complaints (title, description, student_id, category_id, status, upvote_count, escalation_level, created_at)
VALUES (
  'Bus seats are broken and uncomfortable',
  'More than half the seats in Bus Route 4 are broken — torn cushions, missing backrests, and sharp metal edges. Students are getting minor injuries from the broken seats during the journey.',
  (SELECT id FROM users WHERE email = 'vikram@college.com'),
  (SELECT id FROM complaint_categories WHERE name = 'Transport'),
  'IN_PROGRESS', 16, 0, NOW() - INTERVAL '6 days'
);

-- MEERA IYER — Library + Electrical
INSERT INTO complaints (title, description, student_id, category_id, status, upvote_count, escalation_level, created_at)
VALUES (
  'Library catalogue system is outdated',
  'The library catalogue software is from 2015 and does not show real-time book availability. Students waste time going to shelves only to find books already issued. Please upgrade to a modern system.',
  (SELECT id FROM users WHERE email = 'meera@college.com'),
  (SELECT id FROM complaint_categories WHERE name = 'Library'),
  'OPEN', 22, 0, NOW() - INTERVAL '7 days'
);

INSERT INTO complaints (title, description, student_id, category_id, status, upvote_count, escalation_level, created_at)
VALUES (
  'AC not working in the placement training hall',
  'The air conditioner in the placement training hall has been broken for 2 weeks. With 60 students attending training sessions in a closed room, the heat is unbearable and affecting concentration.',
  (SELECT id FROM users WHERE email = 'meera@college.com'),
  (SELECT id FROM complaint_categories WHERE name = 'Electrical'),
  'IN_PROGRESS', 37, 0, NOW() - INTERVAL '4 days'
);

-- ROHIT GUPTA — Hostel + Plumbing
INSERT INTO complaints (title, description, student_id, category_id, status, upvote_count, escalation_level, created_at)
VALUES (
  'Hostel study room has no proper lighting',
  'The common study room in Boys Hostel Block B has only 2 working tube lights for a room meant for 30 students. The dim lighting is causing eye strain during night study sessions.',
  (SELECT id FROM users WHERE email = 'rohit@college.com'),
  (SELECT id FROM complaint_categories WHERE name = 'Hostel'),
  'OPEN', 19, 0, NOW() - INTERVAL '3 days'
);

INSERT INTO complaints (title, description, student_id, category_id, status, upvote_count, escalation_level, created_at)
VALUES (
  'Overhead water tank not cleaned regularly',
  'The overhead water tanks supplying the academic block have not been cleaned in over a year. The water has a yellowish tint and bad smell. Students are falling sick due to contaminated water.',
  (SELECT id FROM users WHERE email = 'rohit@college.com'),
  (SELECT id FROM complaint_categories WHERE name = 'Plumbing'),
  'ESCALATED', 59, 1,
  'Water contamination is a health emergency. Requires coordinator approval for emergency tank cleaning and water testing.',
  NOW() - INTERVAL '10 days'
);


-- ─── STEP 3: ADD UPVOTE RECORDS ───────────────────────────────────────────────
-- Students upvoting each other's complaints (simulates community engagement)

-- Priya upvotes Rahul's complaint
INSERT INTO upvotes (complaint_id, user_id)
SELECT c.id, (SELECT id FROM users WHERE email = 'priya@college.com')
FROM complaints c
WHERE c.student_id = (SELECT id FROM users WHERE email = 'rahul@college.com')
LIMIT 1
ON CONFLICT DO NOTHING;

-- Rahul upvotes Anjali's complaint
INSERT INTO upvotes (complaint_id, user_id)
SELECT c.id, (SELECT id FROM users WHERE email = 'rahul@college.com')
FROM complaints c
WHERE c.student_id = (SELECT id FROM users WHERE email = 'anjali@college.com')
LIMIT 1
ON CONFLICT DO NOTHING;

-- Kiran upvotes the WiFi complaint (most popular)
INSERT INTO upvotes (complaint_id, user_id)
SELECT c.id, (SELECT id FROM users WHERE email = 'kiran@college.com')
FROM complaints c
WHERE c.title LIKE '%WiFi%' OR c.title LIKE '%wifi%'
LIMIT 1
ON CONFLICT DO NOTHING;

-- Sneha upvotes the hostel food complaint
INSERT INTO upvotes (complaint_id, user_id)
SELECT c.id, (SELECT id FROM users WHERE email = 'sneha@college.com')
FROM complaints c
WHERE c.title LIKE '%mess food%' OR c.title LIKE '%Hostel mess food%'
LIMIT 1
ON CONFLICT DO NOTHING;


-- ─── STEP 4: VERIFY EVERYTHING ───────────────────────────────────────────────

-- Show all students
SELECT id, name, email FROM users WHERE role = 'STUDENT' ORDER BY id;

-- Show complaint summary
SELECT 
    cat.name as category,
    c.status,
    COUNT(*) as count
FROM complaints c
LEFT JOIN complaint_categories cat ON c.category_id = cat.id
GROUP BY cat.name, c.status
ORDER BY cat.name, c.status;

-- Show total complaints
SELECT COUNT(*) as total_complaints FROM complaints;
