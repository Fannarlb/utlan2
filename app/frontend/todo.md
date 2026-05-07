# Dealership Car Loan Tracker - Development Plan

## Design Guidelines

### Design References
- Simple, clean, mobile-first dealership tool
- Style: Clean utility UI, easy tap targets for mobile

### Color Palette
- Primary: #1e40af (Blue-800 - main actions)
- Secondary: #f8fafc (Slate-50 - backgrounds)
- Accent: #16a34a (Green-600 - returned/success)
- Warning: #dc2626 (Red-600 - active loans)
- Text: #0f172a (Slate-900), #64748b (Slate-500 - secondary)

### Typography
- Headings: Inter font-weight 700
- Body: Inter font-weight 400 (16px)
- Large tap targets for mobile use

### Key Component Styles
- Buttons: Large, full-width on mobile, rounded-lg
- Cards: White background, subtle shadow, rounded-xl
- Forms: Large inputs for easy mobile entry

---

## Development Tasks

### Files to Create/Modify:
1. **src/lib/api.ts** - API helper using web-sdk for all backend calls
2. **src/pages/Index.tsx** - Home page with navigation to New Loan, Active Loans, History
3. **src/pages/NewLoan.tsx** - Multi-step loan creation (salesman → car → form → confirm)
4. **src/pages/ActiveLoans.tsx** - Active loans list with mark-returned action
5. **src/pages/LoanHistory.tsx** - Searchable loan history
6. **src/App.tsx** - Update routes

### Data Flow:
- Salesmen list: query from `salesmen` entity
- Cars list: query from `cars` entity, filter out those with active loans
- Loans: create/query/update from `loans` entity
- Active loans: query loans where returned="no"
- Mark returned: update loan returned="yes" + return_time