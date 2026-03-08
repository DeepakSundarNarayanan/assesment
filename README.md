# Work Order Timeline

An interactive Work Order Schedule Timeline built with Angular 21, designed for manufacturing ERP systems. It allows planners to visualize, create, and edit work orders across multiple work centers.

---

## Setup & Running

### Prerequisites
- Node.js 18+
- npm

### Install dependencies
```bash
npm install
```

### Run development server
```bash
ng serve
```

Open your browser at `http://localhost:4200/`

### Run unit tests
```bash
ng test
```

### Run E2E tests (Playwright)
```bash
npm run test:e2e
```

### Run E2E tests with UI
```bash
npm run test:e2e:ui
```

---

## Features Built

### Core Features

#### Timeline Grid
- Horizontally scrollable timeline grid with a fixed left panel showing work center names
- Four zoom levels switchable via a **Timescale** dropdown:
  - **Hour** — shows individual hours (48-hour range centred on now)
  - **Day** — shows individual days (~29 day range centred on today)
  - **Week** — shows week starting dates (~17 week range centred on current week)
  - **Month** — shows months (~13 month range centred on current month)
- Current period highlighted with a light purple column background and a **"Current month / week / Today / Now"** badge in the header
- **Today indicator** — a vertical purple line showing the exact current date/time position within the grid
- Row hover state with highlighted background
- **Auto-scroll to current period** — on initial load and after switching timescale, the grid automatically scrolls to center the current column in the viewport
- **Infinite scroll** — scrolling to either edge automatically prepends or appends date columns, allowing navigation to any past or future date without limits; scroll position is preserved when prepending so the view never jumps

#### Work Order Bars
- Each work order renders as a horizontal bar positioned precisely by start/end date
- Bar width and position calculated as a percentage of the visible date range
- Status indicated by colour-coded background and border:
  - **Open** — blue/indigo
  - **In Progress** — purple
  - **Complete** — green
  - **Blocked** — amber/yellow
- Status badge displayed inside the bar
- Three-dot (**⋯**) action menu on hover with **Edit** and **Delete** options
- **Tooltip on hover** showing work order name, status, and full date range

#### Create Work Order Panel
- Triggered by clicking any empty timeline cell
- Start date pre-filled from the clicked column; end date pre-filled to start + 7 days
- Slides in from the right with a smooth animation
- Click outside or press **Escape** to close without saving
- Form fields: Work Order Name, Status (ng-select dropdown), End Date, Start Date
- Status dropdown shows a **coloured pill** matching the selected status

#### Edit Work Order Panel
- Triggered via the three-dot menu → Edit
- Same panel as Create, pre-populated with existing work order data
- Save button updates the work order in place

#### Form Validation
- All fields required
- End date must be after start date (cross-field validator)
- Overlap detection — shows an error if the work order dates conflict with an existing order on the same work center

#### Delete Work Order
- Available from the three-dot menu on any work order bar
- Removes immediately with no confirmation dialog

---

### Bonus Features

#### Smooth Animations
- Panel slides in from the right on open (`slideIn` keyframe)
- Panel slides out on close with an animation before unmounting (`slideOut` keyframe)
- Overlay fades in/out (`fadeIn` / `fadeOut` keyframes)

#### Inline Date Picker with Custom Navigation
- Dates are picked via an inline `ngb-datepicker` toggled by a calendar icon button
- Custom previous/next month navigation buttons using Bootstrap Icons chevrons
- Only one picker open at a time (opening one closes the other)

#### Keyboard Navigation
- **Escape** key closes the panel with the slide-out animation from anywhere on the page
- **Tab** navigates through all form fields in logical order

#### "Click to Add Dates" Hover Hint
- Empty timeline cells show a **"Click to add dates"** label on hover, guiding users to create work orders
- Tooltip is automatically suppressed when a work order's action menu (Edit / Delete) is open to prevent visual overlap

#### Custom Cursor
- Timeline cells use a custom pointer SVG cursor on hover

#### OnPush Change Detection
- All three components (`TimelineComponent`, `WorkOrderBarComponent`, `WorkOrderPanelComponent`) use `ChangeDetectionStrategy.OnPush` for optimal rendering performance

#### trackBy Functions
- All `*ngFor` loops in the timeline use `trackBy` functions to prevent unnecessary DOM re-renders when data changes

#### Unit Test Suite (Vitest via `ng test`)
52 unit tests covering core logic and component behavior:

**`WorkOrderService`** (16 tests)
- Service creation, work center list, seed data fallback
- `addWorkOrder` — count, persistence, localStorage write
- `updateWorkOrder` — name change, count unchanged
- `deleteWorkOrder` — removal, count decrease
- `hasOverlap` — overlapping, contained, adjacent, different center, self-exclude on update
- `generateId` format

**`TimelineComponent`** (34 tests)
- `colMinWidth` — correct pixel value for all 4 timescales
- `generateColumns` — correct column count and start conditions per timescale
- `totalColumnsMinWidth` — arithmetic for all timescales
- `isCurrentColumn` — true/false cases for all 4 modes
- `todayLineLeftAbsolute` — range validation and out-of-range `-1px` sentinel
- `getMondayOfWeek` — Wednesday, Sunday, and Monday inputs
- `currentColumnLabel` — all 4 label strings
- `getWorkOrdersForCenter` — filtering and empty-list case

**`App`** (2 tests)
- Component creation
- Renders `h1` with "Work Orders"

#### E2E Test Suite (Playwright)
Three automated end-to-end tests covering the critical user flows:
1. **Creates a work order and deletes it** — clicks an empty cell, fills the form, saves, verifies the bar appears, then deletes it
2. **Shows error when end date is before start date** — navigates to a previous month, selects an end date before the start date, verifies the validation error
3. **Shows overlap error when work orders conflict** — attempts to create a work order that overlaps an existing one on the same work center, verifies the overlap error message

---

## Libraries Used

| Library | Purpose |
|---|---|
| **Angular 21** | Framework — standalone components, signals, reactive forms |
| **@ng-bootstrap/ng-bootstrap** | Inline `ngb-datepicker` for date selection |
| **@ng-select/ng-select** | Styled dropdown for the Status field |
| **Bootstrap 5** | Base CSS utilities and layout |
| **Bootstrap Icons** | Icon font for calendar, chevron, and three-dot icons |
| **Playwright** | E2E testing |

---

## Project Structure

```
src/
  app/
    components/
      timeline/           # Main timeline grid, header, rows, today line
      work-order-bar/     # Individual work order bar with tooltip and menu
      work-order-panel/   # Create/Edit slide-out panel with form
    models/               # TypeScript interfaces (WorkOrder, WorkCenter, etc.)
    services/
      work-order.service  # Data layer — CRUD, overlap detection, ID generation
public/
  Group 3.png             # Naologic logo
  Pointing.svg            # Custom cursor for timeline cells
  Triangle.svg            # Custom dropdown arrow for status select
```

---

### Architecture & Setup
- *"Build an Angular 21 standalone work order timeline. It should have a horizontally scrollable grid with work centers as rows and months as columns. Each work order should render as a bar positioned by start/end date."*
- *"Add a WorkOrderService with in-memory CRUD, localStorage persistence, and an overlap detection method."*

### Styling & UX
- *"Highlight the current month/week/day column with a light purple background and a badge in the header cell."*
- *"Add a custom SVG pointer cursor on timeline cell hover."*

### Testing
- *"How do I setup playwright in angular application"*

### Data
- *"Add more seed data — at least 7 work centers and 12 work orders spread across different statuses and date ranges."*

---

## Approach

The timeline positioning is entirely CSS-percentage based. Given a visible date range (first column start → last column end), each work order bar's `left` and `width` are calculated as:

```
left  = (barStart - rangeStart) / totalDuration * 100%
width = (barEnd   - barStart)   / totalDuration * 100%
```

This means bars automatically reposition and resize when the zoom level changes without any additional layout calculations.

State is managed entirely through Angular signals — no RxJS, no NgRx. The `WorkOrderService` holds the source of truth as in-memory arrays, and components pull fresh data after every create/update/delete.

---

## Future Improvements (`@upgrade`)

| Tag | File | Description |
|-----|------|-------------|
| `@upgrade` | `timeline.component.ts` · `scrollToToday()` | Work center column width is hardcoded as `300` in the scroll-to-today and today-line calculations. Extract it as a shared constant or a responsive getter so it stays correct when the column is resized (e.g. on mobile). |
| `@upgrade` | `timeline.component.ts` · `todayLineLeftAbsolute` | Same hardcoded `300` issue — the today line pixel offset will be wrong on mobile where the column is 120px. |
| `@upgrade` | `timeline.component.ts` · `onDeleteWorkOrder()` | Delete is instant with no confirmation dialog. Add a confirmation prompt to prevent accidental data loss. |
| `@upgrade` | `timeline.component.ts` · `loadData()` | Work centers and work orders are plain arrays assigned directly on the component. Converting them to signals would let `OnPush` react to updates automatically without needing `cdr.detectChanges()`. |
| `@upgrade` | `work-order-bar.component.ts` · `barStyle` | Bar position recalculates on every change detection cycle. Memoize the result or use a computed signal to avoid redundant calculations when many bars are rendered. |
| `@upgrade` | `work-order-panel.component.ts` · `closeWithAnimation()` | The 250ms close delay is hardcoded. Tie it to the actual CSS animation duration via a shared constant so they can't drift out of sync. |
| `@upgrade` | `work-order.service.ts` · `generateId()` | Uses `Math.random()` which can theoretically produce collisions. Replace with `crypto.randomUUID()` for guaranteed uniqueness. |
| `@upgrade` | `work-order.service.ts` | All data is stored in `localStorage` — it is lost if the user clears browser storage and is not shared across devices. Replace with a real backend API (REST or Firestore). |
| `@upgrade` | `styles.scss` | The `:has(.bar-menu)` tooltip suppression rule is in global styles as a workaround for Angular's CSS encapsulation. A cleaner long-term fix is an `@Output` from the bar component that lets the timeline add a host class, keeping the logic inside the component boundary. |
