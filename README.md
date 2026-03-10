# ExpenseTrack - Smart Expense Management PWA

A modern, mobile-first expense tracking application built with Next.js, React, Firebase, and TypeScript. Features AI-powered categorization, smart budgeting, gamification, and expense splitting.

## Features

✨ **Core Features:**
- 📱 Mobile-first responsive PWA design
- 💰 Quick expense entry with auto-categorization
- 📊 Real-time analytics dashboard with charts
- 🎮 Gamification (streaks, badges, XP points)
- 🔐 Biometric security with WebAuthn (coming soon)
- 🤝 Split expenses with WhatsApp sharing
- 🎯 Smart budget alerts and tracking
- 🔐 Firebase Authentication
- 🎨 Modern UI with Tailwind CSS & shadcn/ui

## Tech Stack

- **Frontend:** Next.js 16, React 19.2, TypeScript
- **Database:** Firebase Firestore
- **Authentication:** Firebase Auth
- **Styling:** Tailwind CSS v4
- **Charts:** Recharts
- **UI Components:** shadcn/ui
- **Form Handling:** React Hook Form + Zod
- **Notifications:** Sonner
- **Animations:** Canvas Confetti

## Project Structure

```
/app
  /analytics          # Analytics dashboard page
  page.tsx           # Main home page
  layout.tsx         # Root layout with providers
  globals.css        # Global styles and theme

/components
  /ui               # shadcn/ui components
  add-expense-form.tsx      # Expense input form
  expense-list.tsx          # List of recent expenses
  analytics-dashboard.tsx   # Charts and analytics
  gamification-widget.tsx   # Streaks, badges, points
  split-expense-modal.tsx   # Split sharing modal
  auth-card.tsx            # Login/signup form
  dashboard-header.tsx     # Header with user info
  confetti-celebration.tsx # Celebration animation

/lib
  /services
    expense-service.ts     # Firebase expense operations
    budget-service.ts      # Budget management
    mock-data.ts          # Mock data for development
  firebase.ts           # Firebase config
  auth-context.tsx      # Auth state management
  categories.ts         # Category definitions & icons
  types.ts             # TypeScript type definitions
  utils.ts             # Utility functions
```

## Getting Started

### 1. Setup Firebase (Optional for Development)

The app includes mock data for development. To connect Firebase:

1. Create a Firebase project at [firebase.google.com](https://firebase.google.com)
2. Enable Firestore Database and Authentication
3. Add your Firebase config to environment variables:

```bash
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

### 2. Install Dependencies

```bash
npm install
# or
yarn install
```

### 3. Run Development Server

```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

## Features Breakdown

### Expense Management
- Add expenses with quick entry form
- Auto-categorize based on keywords
- View expenses by date
- Delete expenses
- Split expenses with friends

### Analytics Dashboard
- Spending by category (pie chart)
- Monthly trend (bar chart)
- Category breakdown with item counts
- Total spent and average expense metrics

### Gamification
- Daily streak tracker
- Achievement badges
- Experience points (XP) system
- User level progression
- Visual progress bars

### Categories

Predefined categories with icons:
- 🍔 Food
- 🚗 Transport
- 🎬 Entertainment
- 🛍️ Shopping
- 💊 Health
- 📚 Education
- 🏠 Housing
- 💼 Work
- Other

## Expense Data Structure

```typescript
interface Expense {
  id: string
  userId: string
  amount: number
  category: Category
  description: string
  date: Date
  createdAt: Date
  splitWith?: string[]
}
```

## Authentication Flow

1. **Sign Up / Login:** Email and password authentication via Firebase
2. **Session Management:** Automatic token refresh
3. **Protected Routes:** Only authenticated users can see dashboard
4. **Mock Mode:** Uses demo user if Firebase not configured

## Development Notes

### Using Mock Data

When Firebase is not configured, the app uses mock data from `/lib/services/mock-data.ts`. This includes:
- Sample expenses
- Budget limits
- Gamification stats

### Adding Firebase Later

1. Set environment variables in your Vercel project
2. The app automatically switches from mock to real Firebase when credentials are provided
3. No code changes needed!

### Category Configuration

Edit `/lib/categories.ts` to add or modify expense categories. Each category includes:
- Name and display color
- Icon (from lucide-react)
- Keyword patterns for auto-categorization

## API Routes (Coming Soon)

- `/api/expenses` - CRUD operations
- `/api/budgets` - Budget management
- `/api/share` - Generate shareable links
- `/api/gamification` - Update streaks and badges

## Keyboard Shortcuts (Coming Soon)

- `Cmd/Ctrl + K` - Command palette
- `Cmd/Ctrl + N` - New expense
- `Cmd/Ctrl + A` - View analytics

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## Performance

- ⚡ Fast load times with Next.js App Router
- 📦 Code splitting and lazy loading
- 🎯 Optimized images and assets
- 📱 PWA for offline support
- 🔄 SWR for efficient data fetching

## Accessibility

- ♿ WCAG 2.1 AA compliant
- 🎨 High contrast mode support
- ⌨️ Full keyboard navigation
- 🔊 Screen reader friendly
- 📱 Touch-friendly interface

## Troubleshooting

**Q: "Firebase not configured" error**
A: This is normal in development. The app will use mock data. To use real Firebase, add environment variables.

**Q: Expenses not saving**
A: Check that you're logged in. Mock mode doesn't persist data between sessions.

**Q: Charts not displaying**
A: Ensure at least one expense is created. Empty datasets may not render.

## Future Enhancements

- [ ] WebAuthn biometric security
- [ ] Receipt image OCR
- [ ] Budget recommendations via AI
- [ ] Expense predictions
- [ ] Group expense management
- [ ] Dark mode improvements
- [ ] Offline support improvements
- [ ] Multi-currency support
- [ ] Export to CSV/PDF
- [ ] Recurring expenses

## License

MIT

## Support

For issues or questions, please open an issue in the repository or contact the development team.

---

**Built with ❤️ for smart expense management**
