# StudyMate — GitHub Pages website

A responsive, static HTML/CSS/JavaScript **working front-end prototype** for the StudyMate Initial Product Definition (IPD): *A Personal Study Planning and Progress Companion*.

No Node/npm, backend, build tool, paid services, or API keys are needed. The site can be deployed directly on **GitHub Pages**.

## Quick start

1. Extract this ZIP.
2. Open `index.html` in a browser, **or** serve the directory locally with `python -m http.server 8000` and visit `http://localhost:8000`.
3. Click through the preloaded sample data (4 courses, study sessions, topic confidence and study hours).
4. Add a course and task to test the full workflow.

## Deploy on GitHub Pages

1. Create a **public GitHub repository**, e.g. `studymate`.
2. Upload **the extracted contents** (`index.html`, `styles.css`, `app.js`, `assets/`, `README.md`, `.nojekyll`) to the repository's root. **Do not upload only the ZIP**.
3. Commit the files to the `main` branch.
4. Go to **Settings → Pages → Build and deployment**.
5. Choose **Deploy from a branch**; select `main` and `/ (root)`; save.
6. Once published, visit `https://YOUR-USERNAME.github.io/studymate/` (replace with the actual repository and account names).

The site uses relative paths for styles and scripts, so it also works inside a GitHub Pages project subdirectory.

## Features and IPD traceability

| Source requirement | Website functionality |
| --- | --- |
| Semester setup | Add/delete courses; enter deadlines and estimated effort; set daily study availability |
| Today view | Next best study action, today’s plan, progress, upcoming deadlines, at-risk/overdue indicators |
| Weekly plan | Seven-day calendar, booked versus available capacity, add tasks to individual days, auto-plan unscheduled tasks |
| Missed-session recovery | Mark missed or detect expired slots, propose available slots before deadline; manual move; conflict warnings |
| Manual completion | Mark a session complete, reopen a completed task |
| Topic mastery (IPD “should have”) | Track Strong, Developing, Needs review; due-review indicator; create a review session |
| Usability test support | Seed demo workspace, editable data, repeatable scenarios, clear navigation |
| Data portability | Export local workspace as JSON backup |

The original IPD explicitly says the first version is a *planning layer*, not a replacement LMS. Accordingly, **LMS integrations, study groups, gamification, institutional dashboards, payment, AI learning recommendations, multi-user accounts, and real notifications are out of scope**.

## Scheduling rules (prototype)

- A session must fit entirely within one availability window.
- Suggested slots cannot overlap other **future**, uncompleted sessions.
- Session end must occur on or before the task's deadline date.
- The suggestion engine considers up to **21 days ahead** and proposes up to **3** available slots.
- If there is insufficient capacity, it explains the conflict and retains the task without making an impossible promise.
- Planning and re-planning are editable: accepted slots update the weekly schedule immediately.
- “Next best study action” uses a simple explainable heuristic based on overdue/missed status, upcoming deadlines, task type and estimated effort; it is **not a trained AI model**.
- Changes to study availability do not automatically rearrange existing sessions; conflicting workloads are highlighted for the student to review.

## Important technical limitations

- **LocalStorage only:** all data stays in the browser/device where the user opened the site. There is **no authentication, server, database, sync or multi-user capability**. Different browsers or visitors will get their own local workspaces.
- Preloaded records are clearly **sample data**, not observed student results.
- Browser cache/site-data clearing can erase local data. The JSON export allows a manual backup, but JSON import is not included in v1.
- The focus timer runs only while its modal is open; it is not a background timer.
- No guaranteed offline experience, push notifications, LMS/calendar sync, or analytics tracking.
- The simple day/window scheduling algorithm is a feasibility prototype, not an optimized semester scheduler for complex recurring constraints.
- Calendar “due date” is treated as the end of the chosen local calendar day; input dates and times use the user's browser locale.

## Recommended requirements-engineering deliverables

1. **Refine and baseline the product definition:** stakeholders, problems, scope, terminology, assumptions and constraints.
2. **Document prioritization:** MoSCoW list separating must-have recovery flows from should-have confidence tracking.
3. **Create 6–10 user stories** with acceptance criteria using Given / When / Then, especially the no-capacity scenario.
4. **Draw workflows:** add course → add task → suggest slot → complete OR miss → re-plan; also state transitions and edge cases.
5. **Conduct prototype usability tests** with 5–7 students: set up tasks, identify next action, intentionally miss a slot, re-plan, check overload feedback. Collect task success rate, task time and issues.
6. **Validate discovery hypotheses H1–H6** from the IPD through interviews, diary entries and usability findings (do not claim they are validated yet).
7. **Revise designs from evidence**; track proposed changes and decide whether backend development is justified.

## Project files

- `index.html` — accessible application shell, navigation, icon SVGs
- `styles.css` — responsive design system and all screen styles
- `app.js` — data model, sample data, scheduling logic, front-end interactions and persistence
- `assets/favicon.svg` — app icon
- `.nojekyll` — GitHub Pages compatibility
- `README.md` — this file

Source: *StudyMate — A Personal Study Planning and Progress Companion*, submitted as an Initial Product Definition for **SE ZG507 Product Discovery and Requirements Engineering**.
