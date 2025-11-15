# Changelog

All notable changes to the UniteX app.

## [Latest] - 2025-11-13

### Added - Pull-to-Refresh Feature ✨

- **Instagram-style pull-to-refresh** on home feed
- Touch gesture detection for pull-down action
- Visual feedback with rotating indicator
- Smooth animations and transitions
- Progress indicator showing pull distance
- "Pull to refresh" / "Release to refresh" text
- Loading spinner during refresh
- Only activates when scrolled to top

### Removed

- Manual refresh button from header (replaced by pull-to-refresh)

### Technical Changes

- Added `isPulling`, `pullDistance` state management
- Implemented touch event handlers (`onTouchStart`, `onTouchMove`, `onTouchEnd`)
- Added animated pull indicator component
- 80px threshold for refresh activation
- 120px maximum pull distance
- 500ms delay before reset after refresh

### Files Modified

- `src/components/HomeFeed.tsx` - Added pull-to-refresh implementation
- `README.md` - Updated with new features
- `PULL_TO_REFRESH.md` - New documentation file

---

## [1.1.0] - 2025-11-13

### Fixed - Posts Not Displaying Issue 🔧

- Fixed Row Level Security (RLS) policies blocking posts
- Improved database query logic
- Split posts and profiles queries for better error handling
- Removed restrictive `is_approved` filter

### Added

- Real-time post updates via Supabase subscription
- Debug counter showing total posts in database
- Better time formatting (e.g., "2h ago", "3d ago")
- Comprehensive console logging for debugging
- Post count query for troubleshooting

### Documentation

- `QUICK_FIX.md` - Quick database setup guide
- `DATABASE_FIX_INSTRUCTIONS.md` - Detailed troubleshooting
- `FIXES_SUMMARY.md` - Complete technical documentation
- `src/utils/database-fixes.sql` - SQL scripts for RLS policies

### Technical Changes

- Separated posts and profiles queries
- Implemented Map-based profile lookup
- Added real-time subscription to posts table
- Enhanced error handling and logging
- Improved date formatting with relative time

### Files Modified

- `src/components/HomeFeed.tsx` - Complete query rewrite
- `src/lib/supabase.ts` - Database types

---

## [1.0.0] - Initial Release

### Features

- Social feed with posts
- User authentication
- Profile management
- Post creation with media
- Like, comment, share functionality
- User following system
- Job postings
- Messaging
- Communities
- Spaces (voice/video rooms)
- Bookmarks
- Search
- Settings
- Dark/Light theme support

### Tech Stack

- React + TypeScript
- Vite
- Capacitor (for mobile)
- Supabase (backend)
- TailwindCSS + shadcn/ui
- Framer Motion (animations)

---

## Future Improvements

### Planned Features

- [ ] Infinite scroll optimization
- [ ] Image compression for posts
- [ ] Push notifications
- [ ] Offline mode
- [ ] Post drafts
- [ ] Advanced search filters
- [ ] User blocking
- [ ] Report functionality
- [ ] Analytics dashboard
- [ ] Story/Reels feature

### Known Issues

- None currently reported

---

## Contributing

If you make changes to the app, please update this changelog with:

- Date of change
- Description of what changed
- Files modified
- Any breaking changes
