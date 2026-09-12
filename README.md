# IoT Club Learning, Innovation & Lab Management Platform

> **We Learn. We Build. We Innovate.**

A complete digital operating system for university IoT clubs covering the entire student journey:
**Discover → Apply → Get Selected → Learn → Practice → Build → Use Lab → Collaborate → Compete → Get Certified → Mentor Others**

---

## 1. System Architecture & Portals

The platform is a unified fullstack **Next.js 15+ (App Router)** application written in **TypeScript** and **Tailwind CSS**, designed to support 5 distinct user experiences under Role-Based Access Control (RBAC):

1. **Public Portal (`/`)**:
   - Hero section with live telemetry status ticker
   - Vision & Mission statements
   - 6 Technical Domain specializations (Embedded Systems, Networking, AIoT, Robotics, Security, Cloud)
   - Active hardware projects showcase (CareGrid, Autonomous Rover, AgriSense)
   - Upcoming workshops and SIH/IEEE hackathon podium finishes
   - Seed statistics strip (186 Members, 17 Projects, 268 Lab Assets, 5 Wins)

2. **Applicant Portal (`/apply`)**:
   - 6-Step recruitment wizard (Personal Information, Technical Interests, Skills with Beginner/Intermediate/Advanced levels, Portfolios, Questions, Review & Submit)
   - Candidate Dashboard with visual **Recruitment Pipeline Tracker**:
     `Submitted → Review → Assessment → Practical Round → Interview → Selected`

3. **Student Portal (`/dashboard`, `/learn`, `/projects`, `/lab`, `/opportunities`, `/profile`)**:
   - Level 4 IoT Builder dashboard for **Hari Dharanesh SP**
   - 8 Structured LMS tracks with circuit wiring diagrams, C++/FreeRTOS code, and assignment submission
   - **Interactive Visual Skill Tree (`/learn/skills`)** with prerequisite dependency graph and locked node inspector
   - XP Transaction Ledger (+100, +200, +30, +500 XP)
   - Project workspace with sprint task board and hardware BOM
   - Team formation board (`/projects/teams`) with open role applications
   - Monthly Innovation Challenge (`/challenges`) with Smart Energy Monitoring

4. **Teacher & Mentor Portal (`/teacher`)**:
   - Evaluation Center with multi-criteria rubric sliders (Circuit Design /20, Code Quality /20, MQTT /25, Error Handling /15, Docs /10, Demo /10 = 100)
   - Hardware Checkout Approval Queue (Approve/Reject student requests with return date tracking)
   - **Batch-Level Skill Analytics (`/teacher/analytics`)** identifying cohort competencies (ESP32 81%, Linux 44%, IoT Security 31%)
   - Workshop Dynamic QR Attendance Generator with short-lived auto-rotating signed tokens

5. **Club & Lab Admin Portal (`/admin`, `/lab`)**:
   - Recruitment Pipeline Kanban board with drag-to-advance stage controls
   - Complete Hardware Inventory (268+ assets) with search, filter, and QR code generator
   - **QR Asset Resolution Route (`/lab/assets/[assetId]`)** for component checkouts, returns, and damage reporting
   - **Live IoT Lab Telemetry (`/lab/live`)** simulating MQTT sensor feeds (Temperature, Humidity, Air Quality, Power, Occupancy, active nodes)
   - Immutable System Audit Trail (`/admin/audit`) logging all state mutations

6. **Public Student Portfolio (`/member/[username]`)**:
   - Public view for `iotclub.org/member/hari` displaying verified skills, projects, and certifications without leaking private student data.

7. **Certificate Public Verification (`/verify`)**:
   - Cryptographic registry verifying credentials such as `IOT-2026-ESP32-0042` with digital seal.

8. **Interactive AI IoT Mentor**:
   - Diagnostic assistant answering questions on ESP32 pinouts (strapping pins), I2C address scanning (`0x23` vs `0x5C`), MQTT retain flags vs QoS, and curriculum guidance.

---

## 2. Configurable Product Identity (`club_config`)

To ensure no fake college, faculty name, or private contact details are hardcoded, all institutional branding is managed in `lib/clubConfig.ts`:

```typescript
export const defaultClubConfig = {
  clubName: "IoT Club",
  subtitle: "Learning • Building • Innovating",
  collegeName: "Engineering Institute",
  department: "Interdisciplinary Technology & Innovation Center",
  primaryContact: "Faculty Mentor / Lab Admin",
  email: "contact@iotclub.org",
  address: "IoT & Embedded Systems Laboratory, Tech Block, Level 3",
  githubOrg: "iot-club-org",
};
```

---

## 3. Database Schema

Production-ready PostgreSQL / Supabase SQL schema is included in `database/schema.sql`, featuring all 44 core entities, enums, foreign keys, and Row Level Security (RLS) policies.

---

## 4. Development & Build Scripts

```bash
# Run local development server
npm run dev

# Check TypeScript static types
npm run typecheck

# Build optimized production bundle
npm run build
```

---

## 5. End-to-End Presentation Flow (Section 61)

1. **Public**: Open homepage → Explore projects and workshops → Click "Apply to Join".
2. **Applicant**: Complete 6-step recruitment wizard → Submit → View live pipeline status.
3. **Student**: Switch to "Student" in demo bar → View dashboard → Check active tasks → Open Track 2 Module 202 → Inspect Skill Tree → Request ESP32 borrow.
4. **Teacher**: Switch to "Teacher" → Open Evaluation Center → Grade with rubric sliders → Approve hardware checkout → Rotate dynamic QR attendance.
5. **Admin**: Switch to "Admin" → Advance candidate in Kanban → Open Hardware Inventory → Inspect Asset #ESP024 QR Code → Review audit trail.
6. **Live Lab**: Open `/lab/live` → Inspect real-time fluctuating temperature, power, and MQTT raw payload stream.
7. **Verify**: Open `/verify` → Search `IOT-2026-ESP32-0042` → View verified credential.
