# UniteX App Design (Community)

This is a code bundle for UniteX App Design (Community). The original project is available
at https://www.figma.com/design/SRq4dwDGQ1PhY1SSfOXAZt/UniteX-App-Design--Community-.

## Running the code

Run `npm i` to install the dependencies.

Run `npm run dev` to start the development server.

## Recent Updates

### ✨ Pull-to-Refresh Feature (Latest)

- Instagram-style pull-to-refresh on the home feed
- Smooth animations and visual feedback
- See `PULL_TO_REFRESH.md` for details

### 🔧 Posts Feed Fix

- Fixed posts not displaying issue
- Improved database queries
- Added real-time post updates
- See `QUICK_FIX.md` for setup instructions

## Building for Android

1. Build the web app: `npm run build`
2. Sync with Capacitor: `npx cap sync android`
3. Open in Android Studio: `npx cap open android`

## Important Setup

**First-time setup**: Run the SQL scripts in `src/utils/database-fixes.sql` in your Supabase
dashboard to enable proper database permissions.

See `QUICK_FIX.md` for detailed instructions.

## Features

- 📱 Social feed with posts, likes, comments
- 🔄 Pull-to-refresh (Instagram-style)
- ⚡ Real-time updates
- 👤 User profiles and following
- 💼 Job postings
- 💬 Messaging
- 🌐 Communities and spaces
- 🔖 Bookmarks
- 🔍 Search

## Documentation

- `QUICK_FIX.md` - Database setup (IMPORTANT - Read first!)
- `PULL_TO_REFRESH.md` - Pull-to-refresh feature guide
- `FIXES_SUMMARY.md` - Complete list of recent fixes
- `DATABASE_FIX_INSTRUCTIONS.md` - Detailed troubleshooting