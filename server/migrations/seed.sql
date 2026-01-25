-- Seed data for Sinaesta database
-- Password for all demo accounts: admin123
-- bcrypt hash for 'admin123': $2b$10$k/6jWn1jSMmHHftYQSK.nu7Qn7O.hG/ywRVhdIFfA6pAZ7OAS/tVu

-- Insert admin user (if not exists)
INSERT INTO users (id, email, password_hash, name, role, status, target_specialty)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'admin@sinaesta.com',
  '$2b$10$k/6jWn1jSMmHHftYQSK.nu7Qn7O.hG/ywRVhdIFfA6pAZ7OAS/tVu',
  'System Administrator',
  'SUPER_ADMIN',
  'VERIFIED',
  'Internal Medicine'
)
ON CONFLICT (id) DO NOTHING;

-- Insert mentor users
INSERT INTO users (id, email, password_hash, name, role, status, target_specialty, institution)
VALUES
  ('00000000-0000-0000-0000-000000000002', 'mentor1@sinaesta.com', '$2b$10$k/6jWn1jSMmHHftYQSK.nu7Qn7O.hG/ywRVhdIFfA6pAZ7OAS/tVu', 'Dr. Sarah Johnson', 'MENTOR', 'VERIFIED', 'Internal Medicine', 'Medical University'),
  ('00000000-0000-0000-0000-000000000003', 'mentor2@sinaesta.com', '$2b$10$k/6jWn1jSMmHHftYQSK.nu7Qn7O.hG/ywRVhdIFfA6pAZ7OAS/tVu', 'Dr. Michael Chen', 'MENTOR', 'VERIFIED', 'Cardiology', 'Medical University'),
  ('00000000-0000-0000-0000-000000000005', 'mentor3@sinaesta.com', '$2b$10$k/6jWn1jSMmHHftYQSK.nu7Qn7O.hG/ywRVhdIFfA6pAZ7OAS/tVu', 'Dr. Emily Davis', 'MENTOR', 'VERIFIED', 'Surgery', 'Medical University')
ON CONFLICT (id) DO NOTHING;

-- Insert student users
INSERT INTO users (id, email, password_hash, name, role, status, target_specialty, batch_id, institution)
VALUES
  ('00000000-0000-0000-0000-000000000004', 'student1@sinaesta.com', '$2b$10$k/6jWn1jSMmHHftYQSK.nu7Qn7O.hG/ywRVhdIFfA6pAZ7OAS/tVu', 'John Doe', 'STUDENT', 'VERIFIED', 'Internal Medicine', 'BATCH-2025-01', 'Medical University')
ON CONFLICT (id) DO NOTHING;

-- Insert sample blueprint
INSERT INTO blueprints (title, specialty, total_items, topics, domains, difficulty)
VALUES (
  'Internal Medicine Board Exam 2025',
  'Internal Medicine',
  200,
  '[{"name":"Cardiology","targetPercent":15},{"name":"Pulmonology","targetPercent":12},{"name":"Gastroenterology","targetPercent":10},{"name":"Nephrology","targetPercent":8},{"name":"Endocrinology","targetPercent":10},{"name":"Hematology","targetPercent":8},{"name":"Infectious Disease","targetPercent":10},{"name":"Rheumatology","targetPercent":7},{"name":"Dermatology","targetPercent":5},{"name":"Neurology","targetPercent":10},{"name":"Geriatrics","targetPercent":5}]'::jsonb,
  '[{"name":"Diagnosis","targetPercent":40},{"name":"Therapy","targetPercent":30},{"name":"Investigation","targetPercent":15},{"name":"Mechanism","targetPercent":10},{"name":"Patient Safety","targetPercent":5}]'::jsonb,
  '[{"name":"Easy","targetPercent":30},{"name":"Medium","targetPercent":50},{"name":"Hard","targetPercent":20}]'::jsonb
)
ON CONFLICT DO NOTHING;

-- Insert sample exams
INSERT INTO exams (title, description, duration_minutes, topic, difficulty, mode, created_by)
SELECT
  'Cardiovascular System Assessment',
  'Comprehensive assessment of cardiovascular system including anatomy, physiology, and common pathologies.',
  60,
  'Cardiology',
  'Medium',
  'STANDARD',
  id
FROM users
WHERE email = 'mentor2@sinaesta.com'
ON CONFLICT DO NOTHING;

INSERT INTO exams (title, description, duration_minutes, topic, difficulty, mode, created_by)
SELECT
  'Respiratory System Evaluation',
  'Evaluation of respiratory system covering common respiratory conditions and management.',
  45,
  'Internal Medicine',
  'Easy',
  'STANDARD',
  id
FROM users
WHERE email = 'mentor1@sinaesta.com'
ON CONFLICT DO NOTHING;

-- Insert sample flashcards
INSERT INTO flashcards (user_id, front, back, category, mastered)
SELECT
  id,
  'What are the four stages of heart failure?',
  '1. Stage A: At risk for heart failure but without structural heart disease or symptoms of heart failure. 2. Stage B: Structural heart disease but without signs or symptoms of heart failure. 3. Stage C: Structural heart disease with prior or current symptoms of heart failure. 4. Stage D: Refractory heart failure requiring specialized interventions.',
  'Cardiology',
  false
FROM users
WHERE email = 'student1@sinaesta.com'
ON CONFLICT DO NOTHING;

INSERT INTO flashcards (user_id, front, back, category, mastered)
SELECT
  id,
  'What is the Wells score used for?',
  'The Wells score is a clinical prediction rule for assessing the probability of pulmonary embolism (PE). It considers factors like clinical signs of DVT, heart rate >100, immobilization/surgery, previous PE/DVT, hemoptysis, and cancer.',
  'Internal Medicine',
  true
FROM users
WHERE email = 'student1@sinaesta.com'
ON CONFLICT DO NOTHING;

-- Insert sample OSCE stations
INSERT INTO osce_stations (title, scenario, instruction, duration_minutes, checklist, examiner_id)
SELECT
  'Cardiovascular Examination',
  'You are examining a 45-year-old male presenting with chest pain. Perform a focused cardiovascular examination.',
  'Perform a systematic examination of the cardiovascular system. Include inspection, palpation, percussion, and auscultation. Document your findings and provide a differential diagnosis.',
  15,
  '[{"item":"Inspection of chest","points":2,"category":"Physical Exam"},{"item":"Palpation of precordium","points":2,"category":"Physical Exam"},{"item":"Auscultation of heart sounds","points":3,"category":"Physical Exam"},{"item":"Peripheral pulses assessment","points":2,"category":"Physical Exam"},{"item":"Documentation of findings","points":3,"category":"Diagnosis"},{"item":"Differential diagnosis","points":3,"category":"Diagnosis"}]'::jsonb,
  id
FROM users
WHERE email = 'mentor2@sinaesta.com'
ON CONFLICT DO NOTHING;

INSERT INTO osce_stations (title, scenario, instruction, duration_minutes, checklist, examiner_id)
SELECT
  'History Taking - Acute Abdomen',
  'A 35-year-old female presents with acute abdominal pain. Take a focused history.',
  'Take a comprehensive history focusing on the abdominal pain. Include onset, location, character, radiation, associated symptoms, and relevant medical/surgical history. Present your summary and differential diagnosis.',
  10,
  '[{"item":"Onset and duration","points":2,"category":"Anamnesis"},{"item":"Character and radiation","points":2,"category":"Anamnesis"},{"item":"Associated symptoms","points":2,"category":"Anamnesis"},{"item":"Past medical history","points":1,"category":"Anamnesis"},{"item":"Surgical history","points":1,"category":"Anamnesis"},{"item":"Summary of history","points":3,"category":"Diagnosis"},{"item":"Differential diagnosis","points":4,"category":"Diagnosis"}]'::jsonb,
  id
FROM users
WHERE email = 'mentor3@sinaesta.com'
ON CONFLICT DO NOTHING;

-- Insert sample flashcard decks
INSERT INTO flashcard_decks (user_id, title, topic, cards, is_system_deck)
SELECT
  id,
  'Cardiology Fundamentals',
  'Cardiology',
  '[{"front":"What are the three main coronary arteries?","back":"1. Left Anterior Descending (LAD) artery 2. Left Circumflex (LCx) artery 3. Right Coronary Artery (RCA)"},{"front":"What are the classic symptoms of angina?","back":"Chest discomfort described as pressure, squeezing, fullness, or pain in the center of the chest. May radiate to arms, neck, jaw, or back. Often precipitated by exertion and relieved by rest or nitroglycerin."},{"front":"What is the TIMI score used for?","back":"TIMI (Thrombolysis in Myocardial Infarction) score is used to risk-stratify patients with unstable angina/NSTEMI. It considers age, risk factors, aspirin use, severe angina, ECG changes, cardiac biomarkers."}]'::jsonb,
  false
FROM users
WHERE email = 'student1@sinaesta.com'
ON CONFLICT DO NOTHING;

-- Print success message
DO $
BEGIN
  RAISE NOTICE 'Seed data inserted successfully!';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'DEMO ACCOUNTS (Password: admin123)';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Admin:      admin@sinaesta.com    (Full system access)';
  RAISE NOTICE 'Mentor 1:   mentor1@sinaesta.com  (Create exams, grade OSCE)';
  RAISE NOTICE 'Mentor 2:   mentor2@sinaesta.com  (Create exams, grade OSCE)';
  RAISE NOTICE 'Student 1:  student1@sinaesta.com (Take exams, view results)';
  RAISE NOTICE '========================================';
END $;
