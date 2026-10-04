# MusiOrg Timetable

A peripatetic music teacher timetable management, rotation, and schedule optimization application. Designed for multi-school, multi-cycle (Week A/B or Week 1/2), and complex student availability constraints.

## Architecture

- **Frontend**: React 19 SPA built with Vite and Tailwind CSS. Modern typography with Plus Jakarta Sans, Geist, and tabular numerals.
- **Backend & Database**: Google Cloud Firestore (provisioned cloud database) with document-level and subcollection-level relational hierarchy:
  ```
  /users/{userId} (Teacher Profile)
    ├── /schools/{schoolId}
    ├── /yearGroups/{yearGroupId}
    ├── /subgroups/{subgroupId}
    ├── /students/{studentId}
    ├── /restrictions/{restrictionId}
    ├── /temporaryExceptions/{exceptionId}
    └── /timetableSlots/{slotId}
  ```
- **Authentication**: Firebase Authentication with Email and Password, secure persistent sessions, and self-serve Password Reset.
- **Zero-Trust Security**: Firestore Security Rules enforce strict owner-isolation (`request.auth.uid == userId`) preventing cross-teacher access at the database level.
- **Real-Time Multi-Device Synchronization**: Live `onSnapshot` listeners update schedule changes across all connected devices (phones, tablets, laptops) simultaneously without page reloads.

## Key Capabilities

1. **Independent School Week Cycles**:
   - Each school maintains its own active cycle (`Week A` or `Week B`, or `Week 1` or `Week 2`).
   - One school can be on Week A while another is on Week B (e.g. after INSET days or bank holidays).
   - "All A" and "All B" preview modes allow viewing blueprints without overwriting stored school cycles.

2. **Student Timetable Limitations & Availability Windows**:
   - **Must Only / Can Only Do Windows**: Enforce specific hours a student can attend lessons per week cycle (e.g. Leo can only do 9–10 on Week 1 and 10–11 on Week 2).
   - **Blocked Times / Sports**: Mark clashes with sports, PE, orchestra, or other commitments (e.g. John has sports 9–10 on Week B).
   - Distinguishes between **Hard Conflicts** (impossible slots) and **Soft Warnings** (preference violations).

3. **Interactive Timetable Grid**:
   - Drag-and-drop lesson rescheduling with 15-minute slot snapping and ghost previews.
   - Direct lesson-to-lesson swaps with automatic duration handling.
   - Subtle red conflict indicators with hover explanations and one-click inspection.
   - Quick limitation editing directly from calendar lesson cards.

4. **Multi-User Clean Slate Guarantee**:
   - New accounts start with an empty database. Prototype data does not leak into newly registered accounts.
   - Optional "Load Sample Data" action available in Settings for testing.
   - One-click migration of previous local browser prototype data into the authenticated cloud database.

## Getting Started

### Local Development

1. Install dependencies:
   ```bash
   npm install
   ```

2. Configure environment variables:
   Copy `.env.example` to `.env.local` and add your Firebase credentials:
   ```bash
   cp .env.example .env.local
   ```

3. Start development server:
   ```bash
   npm run dev
   ```

4. Build for production:
   ```bash
   npm run build
   ```

## Security & Deployment

- Rules are defined in `firestore.rules` and enforce that users can only read and write documents inside `/users/$(request.auth.uid)/...`.
- Passwords are encrypted by Firebase Authentication and never stored in plain text or local storage.
