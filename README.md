# CourseMaker

CourseMaker is a modern, premium course playback and tracking platform. It allows users to watch and track their progress on locally stored video courses while securely syncing their progress and course structures to the cloud via Supabase.

## Features

- **Lightning Fast Local Playback:** Never wait for a massive video to upload or buffer. CourseMaker streams your video files directly from your hard drive using the modern **File System Access API**.
- **Cloud-Synced Progress:** Your course structures, lesson names, and completion progress are securely saved to the cloud via Supabase. You can log in from anywhere and instantly see where you left off.
- **Smart Directory Parsing:** Simply point CourseMaker at a folder containing your course materials. It automatically categorizes subfolders into Modules and detects `.mp4`, `.pdf`, and image files seamlessly.
- **Persistent Folder Access:** Thanks to IndexedDB and the File System Access API, CourseMaker remembers your selected folders. You won't have to manually browse for the folder every time you refresh the page—just click to grant permission!
- **Premium Dark Mode UI:** Built with an emphasis on stunning aesthetics, featuring glassmorphism, responsive flex layouts, dynamic modals, and smooth micro-animations.

## Technology Stack

- **Frontend Framework:** React 19 + Vite
- **Styling:** Vanilla CSS with custom design tokens (no Tailwind dependencies)
- **Database / Auth:** Supabase (PostgreSQL)
- **Icons:** Lucide React
- **Browser APIs:** File System Access API (`showDirectoryPicker`), IndexedDB (`idb-keyval`)

## Setup & Installation

1. **Clone the repository:**
   ```bash
   git clone <your-repo-url>
   cd course-maker
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up Supabase:**
   - Create a project on Supabase.
   - Enable Email/Password authentication.
   - Create a `user_courses` table with the following schema:
     - `user_id` (uuid, foreign key to auth.users)
     - `course_id` (text)
     - `course_data` (jsonb)
   - Add your Supabase URL and Anon Key to `.env`:
     ```
     VITE_SUPABASE_URL=your_supabase_url
     VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
     ```

4. **Run the development server:**
   ```bash
   npm run dev
   ```

## License
MIT License
