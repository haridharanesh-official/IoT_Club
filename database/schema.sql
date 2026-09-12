-- ============================================================================
-- IoT Club Digital Ecosystem - Complete PostgreSQL / Supabase Schema
-- Covers: RBAC, Recruitment, LMS, Visual Skills, Projects, Lab Inventory,
-- Workshops with Dynamic QR, Hackathons, Certificates, Audit Logs & Telemetry
-- ============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. ENUMS
CREATE TYPE user_role_type AS ENUM (
    'APPLICANT', 'STUDENT', 'MENTOR', 'PROJECT_LEAD',
    'TEACHER', 'FACULTY', 'LAB_ADMIN', 'CLUB_ADMIN', 'SUPER_ADMIN'
);

CREATE TYPE application_status_type AS ENUM (
    'DRAFT', 'SUBMITTED', 'UNDER_REVIEW', 'ASSESSMENT',
    'PRACTICAL_TASK', 'INTERVIEW', 'SELECTED', 'WAITLISTED', 'REJECTED'
);

CREATE TYPE hardware_status_type AS ENUM (
    'AVAILABLE', 'RESERVED', 'ISSUED', 'PROJECT_ALLOCATED',
    'UNDER_TESTING', 'DAMAGED', 'UNDER_REPAIR', 'MISSING', 'RETIRED'
);

CREATE TYPE project_lifecycle_type AS ENUM (
    'IDEA', 'PROPOSAL', 'REVIEW', 'APPROVED', 'RESEARCH',
    'PROTOTYPE', 'DEVELOPMENT', 'TESTING', 'DEPLOYMENT', 'COMPLETED', 'ARCHIVED'
);

CREATE TYPE task_status_type AS ENUM (
    'BACKLOG', 'TODO', 'IN_PROGRESS', 'REVIEW', 'COMPLETED'
);

-- 3. IDENTITY & PROFILES
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    full_name VARCHAR(150) NOT NULL,
    username VARCHAR(60) UNIQUE NOT NULL,
    headline VARCHAR(255),
    level INT DEFAULT 1,
    level_title VARCHAR(100) DEFAULT 'Explorer',
    roll_number VARCHAR(50),
    department VARCHAR(100),
    year VARCHAR(20),
    section VARCHAR(20),
    college_email VARCHAR(255),
    personal_email VARCHAR(255),
    phone VARCHAR(30),
    avatar_url TEXT,
    github_url TEXT,
    linkedin_url TEXT,
    portfolio_url TEXT,
    bio TEXT,
    is_public BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS user_roles (
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    role user_role_type NOT NULL,
    assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    assigned_by UUID REFERENCES users(id),
    PRIMARY KEY (user_id, role)
);

-- 4. RECRUITMENT
CREATE TABLE IF NOT EXISTS recruitment_batches (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(150) NOT NULL,
    code VARCHAR(50) UNIQUE NOT NULL,
    is_open BOOLEAN DEFAULT true,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS applications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    batch_id UUID REFERENCES recruitment_batches(id),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    full_name VARCHAR(150) NOT NULL,
    roll_number VARCHAR(50) NOT NULL,
    department VARCHAR(100) NOT NULL,
    year VARCHAR(20) NOT NULL,
    section VARCHAR(20) NOT NULL,
    college_email VARCHAR(255) NOT NULL,
    personal_email VARCHAR(255),
    phone VARCHAR(30),
    interests JSONB DEFAULT '[]'::jsonb,
    skills JSONB DEFAULT '[]'::jsonb,
    github_url TEXT,
    linkedin_url TEXT,
    portfolio_url TEXT,
    why_join TEXT,
    what_to_learn TEXT,
    hours_per_week VARCHAR(20),
    hackathon_interest BOOLEAN DEFAULT false,
    research_interest BOOLEAN DEFAULT false,
    status application_status_type DEFAULT 'SUBMITTED',
    applied_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS application_reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    application_id UUID REFERENCES applications(id) ON DELETE CASCADE,
    reviewer_id UUID REFERENCES users(id),
    stage VARCHAR(50) NOT NULL,
    score INT,
    feedback TEXT,
    decision VARCHAR(50),
    reviewed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. LEARNING MANAGEMENT (LMS)
CREATE TABLE IF NOT EXISTS learning_tracks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    slug VARCHAR(100) UNIQUE NOT NULL,
    title VARCHAR(150) NOT NULL,
    description TEXT,
    icon VARCHAR(50),
    color VARCHAR(30),
    display_order INT DEFAULT 0
);

CREATE TABLE IF NOT EXISTS modules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    track_id UUID REFERENCES learning_tracks(id) ON DELETE CASCADE,
    title VARCHAR(150) NOT NULL,
    overview TEXT,
    level VARCHAR(30) DEFAULT 'Beginner',
    estimated_hours INT DEFAULT 4,
    badge_title VARCHAR(100),
    display_order INT DEFAULT 0
);

CREATE TABLE IF NOT EXISTS lessons (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    module_id UUID REFERENCES modules(id) ON DELETE CASCADE,
    title VARCHAR(150) NOT NULL,
    duration VARCHAR(30),
    concept_summary TEXT,
    simulation_note TEXT,
    circuit_diagram_note TEXT,
    code_snippet TEXT,
    hardware_demonstration TEXT,
    display_order INT DEFAULT 0
);

CREATE TABLE IF NOT EXISTS assignments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    module_id UUID REFERENCES modules(id) ON DELETE CASCADE,
    title VARCHAR(150) NOT NULL,
    description TEXT,
    submission_requirements JSONB DEFAULT '[]'::jsonb,
    rubrics JSONB NOT NULL,
    max_xp INT DEFAULT 100,
    badge_reward VARCHAR(100),
    due_date TIMESTAMP WITH TIME ZONE
);

CREATE TABLE IF NOT EXISTS assignment_submissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    assignment_id UUID REFERENCES assignments(id) ON DELETE CASCADE,
    student_id UUID REFERENCES users(id) ON DELETE CASCADE,
    github_repo TEXT NOT NULL,
    demo_url TEXT,
    circuit_diagram_url TEXT,
    documentation_text TEXT,
    status VARCHAR(50) DEFAULT 'PENDING',
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS evaluations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    submission_id UUID REFERENCES assignment_submissions(id) ON DELETE CASCADE,
    evaluator_id UUID REFERENCES users(id),
    scores JSONB NOT NULL,
    total_score INT NOT NULL,
    feedback TEXT,
    passed BOOLEAN NOT NULL,
    xp_awarded INT DEFAULT 0,
    badge_awarded VARCHAR(100),
    evaluated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. SKILL GRAPH & XP TRANSACTIONS
CREATE TABLE IF NOT EXISTS skill_nodes (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    category VARCHAR(50) NOT NULL,
    prerequisites JSONB DEFAULT '[]'::jsonb,
    xp_reward INT DEFAULT 50,
    description TEXT,
    icon VARCHAR(50),
    grid_x INT DEFAULT 0,
    grid_y INT DEFAULT 0
);

CREATE TABLE IF NOT EXISTS student_skills (
    student_id UUID REFERENCES users(id) ON DELETE CASCADE,
    skill_id VARCHAR(50) REFERENCES skill_nodes(id) ON DELETE CASCADE,
    status VARCHAR(30) DEFAULT 'LOCKED',
    unlocked_at TIMESTAMP WITH TIME ZONE,
    PRIMARY KEY (student_id, skill_id)
);

CREATE TABLE IF NOT EXISTS xp_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    amount INT NOT NULL,
    reason VARCHAR(255) NOT NULL,
    category VARCHAR(50) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. PROJECTS & COLLABORATION
CREATE TABLE IF NOT EXISTS projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(150) NOT NULL,
    tagline VARCHAR(255),
    description TEXT,
    lifecycle project_lifecycle_type DEFAULT 'PROPOSAL',
    lead_id UUID REFERENCES users(id),
    faculty_mentor VARCHAR(150),
    tech_stack JSONB DEFAULT '[]'::jsonb,
    progress_percent INT DEFAULT 0,
    github_url TEXT,
    architecture_summary TEXT,
    featured BOOLEAN DEFAULT false,
    category VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS project_members (
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    role VARCHAR(100) NOT NULL,
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    PRIMARY KEY (project_id, user_id)
);

CREATE TABLE IF NOT EXISTS project_tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    title VARCHAR(150) NOT NULL,
    description TEXT,
    assignee_id UUID REFERENCES users(id),
    priority VARCHAR(20) DEFAULT 'MEDIUM',
    status task_status_type DEFAULT 'TODO',
    due_date DATE
);

-- 8. IOT LAB & HARDWARE ASSETS
CREATE TABLE IF NOT EXISTS hardware_assets (
    asset_id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    category VARCHAR(100) NOT NULL,
    model VARCHAR(100),
    serial_number VARCHAR(100),
    location VARCHAR(100) NOT NULL,
    condition VARCHAR(50) DEFAULT 'GOOD',
    status hardware_status_type DEFAULT 'AVAILABLE',
    current_holder_id UUID REFERENCES users(id),
    project_id UUID REFERENCES projects(id),
    issued_date DATE,
    expected_return_date DATE,
    specs JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS hardware_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    asset_id VARCHAR(50) REFERENCES hardware_assets(asset_id),
    student_id UUID REFERENCES users(id) ON DELETE CASCADE,
    project_id UUID REFERENCES projects(id),
    purpose TEXT NOT NULL,
    duration_days INT DEFAULT 7,
    status VARCHAR(30) DEFAULT 'PENDING',
    approved_by UUID REFERENCES users(id),
    requested_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    resolved_at TIMESTAMP WITH TIME ZONE
);

CREATE TABLE IF NOT EXISTS lab_resources (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    category VARCHAR(100) NOT NULL,
    capacity INT DEFAULT 1,
    description TEXT,
    equipment JSONB DEFAULT '[]'::jsonb
);

CREATE TABLE IF NOT EXISTS lab_bookings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    resource_id VARCHAR(50) REFERENCES lab_resources(id),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    project_title VARCHAR(150),
    booking_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    status VARCHAR(30) DEFAULT 'CONFIRMED',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 9. WORKSHOPS, ATTENDANCE & OPPORTUNITIES
CREATE TABLE IF NOT EXISTS events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(150) NOT NULL,
    type VARCHAR(50) NOT NULL,
    description TEXT,
    trainer VARCHAR(150),
    venue VARCHAR(150),
    event_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    capacity INT DEFAULT 50,
    prerequisites JSONB DEFAULT '[]'::jsonb,
    attendance_secret VARCHAR(100)
);

CREATE TABLE IF NOT EXISTS event_attendance (
    event_id UUID REFERENCES events(id) ON DELETE CASCADE,
    student_id UUID REFERENCES users(id) ON DELETE CASCADE,
    scanned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    verified_by VARCHAR(50) DEFAULT 'DYNAMIC_QR',
    PRIMARY KEY (event_id, student_id)
);

CREATE TABLE IF NOT EXISTS certificates (
    certificate_id VARCHAR(100) PRIMARY KEY,
    student_id UUID REFERENCES users(id) ON DELETE CASCADE,
    student_name VARCHAR(150) NOT NULL,
    student_roll VARCHAR(50),
    track_or_topic VARCHAR(150) NOT NULL,
    level VARCHAR(50),
    issue_date DATE DEFAULT CURRENT_DATE,
    issuer_title VARCHAR(150),
    is_valid BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 10. AUDIT LOGS & NOTIFICATIONS
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id),
    user_label VARCHAR(150) NOT NULL,
    action VARCHAR(100) NOT NULL,
    entity VARCHAR(100) NOT NULL,
    entity_id VARCHAR(100) NOT NULL,
    details TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(150) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) NOT NULL,
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Row Level Security (RLS) policies template
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE assignment_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE hardware_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE certificates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public certificates are viewable by anyone" ON certificates
    FOR SELECT USING (true);

CREATE POLICY "Public profiles are viewable by everyone" ON profiles
    FOR SELECT USING (is_public = true);
