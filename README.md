<div align="center">

# 📚 StudyMate

### A Personal Study Planning and Progress Companion

**Plan realistically. Study with focus. Recover when life changes.**

A responsive, interactive study-planning prototype built with **HTML, CSS, and vanilla JavaScript**.

</div>

---

## 🌟 Project Overview

**StudyMate** helps students turn multiple course deadlines, assignments, revision goals, and limited free time into a manageable weekly study plan. Instead of requiring students to constantly decide *what to study next* or manually rebuild a timetable after missing a session, StudyMate provides a clear next action, schedules work around real availability, and supports practical re-planning.

The project is based on an **Initial Product Definition (IPD)** prepared for **Product Discovery and Requirements Engineering (SE ZG507)**. It is designed as a *personal planning companion*, not a replacement for a university Learning Management System (LMS).

> **Project status:** Functional front-end MVP / product-discovery prototype. The site uses example data initially and stores each user's changes locally in their browser. It does not have accounts, a backend, or cloud synchronization.

## 🎯 The Problem

Students often track their work across an LMS, notes, calendars, reminders, and chat groups. These tools may hold information about *what* is due, but they do not always help a student decide:

- Which task should I work on **today**?
- How can I fit study sessions around classes, work, and other commitments?
- What should happen if I **miss a scheduled session**?
- Am I ready for an exam, or have I merely **finished a task once**?

**StudyMate's central idea:** Turn fragmented academic commitments into a realistic plan that students can understand, adjust, and follow.

## 👥 Intended Users

| Persona | Context | Primary need |
| --- | --- | --- |
| **Working learner** | Balances a job, personal responsibilities, and part-time education | A realistic study schedule that adapts to changing availability |
| **Full-time student** | Balances lectures, assignments, quizzes, and exam preparation | Clear priorities, steady progress, and reminders to review weaker topics |

The initial product is for individual students. Instructor and institution management features are outside the MVP scope.

## ✨ Features

### 1. 📊 Overview / Today Dashboard

A single starting point for the student's day:

- Highlights a **next best study action**, with its course, estimated effort, and deadline.
- Shows scheduled sessions for today.
- Summarizes overall progress and upcoming deadlines.
- Calls attention to missed sessions and tasks that need new time slots.
- Offers quick actions to create a course, add a task, start focusing, or open the planner.

**Value:** Students can spend less time deciding what to do and more time studying.

### 2. 🗓️ Weekly Study Planner

A seven-day view of scheduled study sessions:

- Navigate between weeks and inspect the plan by day.
- View booked study time against available time.
- Add a new task for a selected day.
- Open sessions to manage, complete, or mark them missed.
- **Auto-plan** eligible unscheduled tasks into available slots.
- See warnings for missed work, unscheduled tasks, and overload.

**Value:** Makes study commitments visible alongside realistic time constraints.

### 3. 📘 Courses and Study Tasks

Keep academic commitments organized in one place:

- Create courses with a course name, short code, and color.
- Add tasks with a title, course, task type, deadline, and estimated duration.
- Let the app suggest a time, select a time manually, or leave a task unscheduled.
- Filter tasks by course and review their statuses.
- Mark tasks **completed**, **missed**, or reopen them.
- Remove tasks or courses when they are no longer needed.

**Value:** Connects individual tasks to the courses and deadlines they support.

### 4. 🔄 Adaptive Re-planning — Core Differentiator

The key StudyMate workflow is recovering from a disrupted plan:

1. A task is missed, or its scheduled study time passes without completion.
2. StudyMate identifies that the session needs attention.
3. The student chooses **Re-plan**.
4. The planner proposes available future slots, taking other sessions and the deadline into account.
5. The student accepts a suggestion or selects a different valid slot.
6. If no feasible slot is available, StudyMate explains the scheduling conflict rather than pretending everything fits.

**Value:** A missed session doesn't have to invalidate the entire week's plan.

### 5. ⏰ Study Availability and Capacity

Students can describe their **actual** weekly availability:

- Define study windows for each day of the week (up to two per day in this prototype).
- Set days with no study availability.
- View total weekly study capacity.
- Use these windows as constraints for automatic scheduling and re-planning.
- Review planner overload when existing commitments no longer fit.

**Value:** Plans are based on available time, not an idealized timetable.

### 6. 🎯 Topic Mastery and Revision

Tracks learning confidence separately from task completion:

- Add course topics and set their review dates.
- Label each topic **Strong**, **Developing**, or **Needs review**.
- View a simple course-level readiness indicator.
- Identify topics due for review.
- Create a revision task directly from a topic.

**Value:** Helps students revisit weak areas instead of treating completion as mastery.

**Note:** Readiness percentages are simple illustrative scores based on self-reported confidence, **not** measured learning outcomes or predictive AI.

### 7. 📈 Study Progress

Provides lightweight visibility into study activity:

- Overall task completion percentage.
- Total scheduled duration of tasks marked complete.
- Number of re-planned sessions.
- Progress grouped by course.
- Distribution of completed, planned, and missed sessions.

**Value:** Gives students a basic way to see whether they are following and adjusting their plan.

### 8. ⏳ Focus Session Timer

- Start a countdown using the task's estimated duration.
- Pause or resume while the focus dialog is open.
- Mark the task complete when finished.

**Note:** This is a simple in-page timer, not a background timer or a time-tracking service.

### 9. 💾 Personal Workspace and Data

- Opens with a ready-to-explore sample workspace.
- Saves courses, tasks, topics, and availability using browser **localStorage**.
- Allows editing the displayed student name.
- Exports workspace data to a **JSON backup file**.
- Resets the workspace to its original sample data for demonstration and testing.

**Important:** Data is not synced between devices or browsers, and importing a backup is not included in this version.

## 🖼️ Application Preview

![StudyMate desktop dashboard](assets/preview-desktop.png)

<details>
<summary>View mobile layout</summary>

![StudyMate mobile dashboard](assets/preview-mobile.png)

</details>

## 🔁 Example User Journey

```text
Create courses
      ↓
Add tasks, deadlines, and effort estimates
      ↓
Set available study hours
      ↓
Auto-plan tasks / choose time slots
      ↓
Open Today dashboard → Start studying
      ↓
Complete a session? ── Yes → Update progress
      │
      No
      ↓
Mark missed / identify overdue session
      ↓
See feasible alternative slots
      ↓
Accept or manually adjust a slot
      ↓
Continue with the updated weekly plan
```

## ⚙️ How Scheduling Works

StudyMate uses a **rule-based scheduling heuristic**, not machine learning. It attempts to find usable study periods while applying these constraints:

- A session must fit **completely** within one configured availability window.
- Proposed sessions must **not overlap** other scheduled, unfinished future sessions.
- Sessions must finish **on or before the task deadline**.
- The slot search looks ahead up to **21 days** and can present up to **three** suggestions.
- When a task cannot fit, it stays unresolved and the interface communicates that limitation.
- Students remain in control of schedule changes; manual slots are validated against the same constraints.

The **next best action** is ranked with an explainable priority heuristic considering urgency, missed/overdue status, estimated effort, and task type. The system does not use an AI model or claim to optimize every possible study schedule.

## 🧰 Technology Stack

| Layer | Technology | Purpose |
| --- | --- | --- |
| Structure | **HTML5** | Accessible markup and application layout |
| Styling | **CSS3** | Responsive interface, dashboard cards, forms, tables, and visual feedback |
| Interaction | **Vanilla JavaScript (ES6+)** | View switching, forms, task actions, scheduling, and timer |
| Persistence | **Browser localStorage** | Retain the local prototype workspace across page refreshes |
| Data export | **Browser Blob API / JSON** | Download a local workspace backup |

There are no frameworks, package dependencies, API keys, or external services required.

## 📂 Project Structure

```text
studymate/
├── index.html                 # Main app shell and navigation
├── styles.css                 # Responsive design and component styling
├── app.js                     # State, sample data, scheduling and UI logic
├── assets/
│   ├── favicon.svg            # StudyMate favicon
│   ├── preview-desktop.png     # Dashboard screenshot
│   └── preview-mobile.png      # Mobile screenshot
├── README.md                  # Project documentation
└── .nojekyll                  # Static-site compatibility file
```

## ▶️ Running the Project Locally

Open **`index.html`** in a modern browser. No setup or installation is required.

For a local development server, you can also run:

```bash
python -m http.server 8000
```

Then visit `http://localhost:8000`.

## ✅ MVP Scope and Requirements Alignment

The IPD prioritizes validating whether a student benefits from **clear prioritization** and **re-planning after disruptions**.

| Priority | Capability | Prototype status |
| --- | --- | --- |
| Must have | Course and deadline setup | Implemented |
| Must have | Study availability and effort estimates | Implemented |
| Must have | Today dashboard and next action | Implemented |
| Must have | Weekly plan | Implemented |
| Must have | Manual task completion | Implemented |
| Must have | Re-plan missed work | Implemented with a rule-based slot finder |
| Should have | Topic confidence and review tracking | Implemented |
| Should have | Calendar import/export | Not implemented |
| Should have | Notifications / reminders | Not implemented |
| Later | LMS integrations and collaboration | Not implemented |
| Later | Gamification, advanced analytics, instructor dashboard | Not implemented |

## 🧪 Suggested Usability Evaluation

StudyMate is a **testable product hypothesis**, not a fully validated solution. Prototype evaluation should focus on the workflows that distinguish it from a calendar or a simple to-do list.

Ask student participants to:

1. Add a course with a realistic deadline.
2. Create tasks and specify their available study times.
3. Find their next recommended study action.
4. Mark a planned session as missed and re-plan it.
5. Attempt to schedule work when capacity is insufficient.
6. Update the confidence of a topic and create a revision session.

For each task, record whether the participant succeeds independently, how long it takes, confusion or errors observed, and whether the proposed schedule is understandable and trustworthy.

The originating IPD suggests testing with **5–7 prototype users**, alongside interviews and diary studies. Its proposed outcome measures are **targets**, not results already achieved:

- At least **70%** of planned sessions completed or intentionally rescheduled.
- At least **75%** of pilot users finding weekly planning easier than their previous method.
- At least **40%** of activated pilot users active in week four.
- Median re-planning time **under five minutes**.

## 🚧 Current Limitations

This version intentionally focuses on the study-planning workflow:

- **No login or accounts:** The experience is for one local browser workspace at a time.
- **No server or database:** Clearing browser storage may delete the local data.
- **No cloud sync:** A workspace on one browser is not shared with another.
- **No automatic notifications:** Students must open the app to see the plan and alerts.
- **No LMS/calendar connection:** Tasks are entered manually.
- **No AI predictions:** Prioritization and slot suggestions are heuristic-based.
- **No assessment-based mastery:** Confidence is entered manually.
- **No guaranteed background timing or offline mode.**

These are deliberate MVP boundaries, not claims of completed capabilities.

## 🛣️ Future Enhancements

Potential next iterations, subject to student feedback:

- Account-based workspaces and secure cloud synchronization.
- Calendar import/export and calendar event syncing.
- Optional reminders for deadlines, reviews, and missed sessions.
- Better handling of recurring sessions and complex schedule constraints.
- Improved progress insights based on real, consented usage data.
- Quiz-based mastery signals to complement self-reported confidence.
- Accessibility refinements from usability testing.
- Later, deeper LMS integration or collaborative learning features, **only if validated as valuable**.

## 🎓 Academic Context

**Project:** StudyMate — A Personal Study Planning and Progress Companion  
**Original IPD author:** Kaushal Joshi  
**Course:** Product Discovery and Requirements Engineering (SE ZG507)  
**Type:** Functional front-end prototype developed from the initial product concept

The goal is to demonstrate how an initial problem and product idea can be refined into a usable design and an interactive MVP, then evaluated with prospective users.

---

<div align="center">

**StudyMate — Make every study session count.**

</div>
