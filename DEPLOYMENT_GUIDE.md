# Deployment Guide: Meal Planner App

This guide covers everything needed to take this app from a local development project to a full production application with user accounts, database persistence, and app store deployment.

---

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Technology Stack Options](#technology-stack-options)
3. [What You Need to Build](#what-you-need-to-build)
4. [Cost Estimates](#cost-estimates)
5. [Timeline Estimate](#timeline-estimate)
6. [Recommended Approach](#recommended-approach)
7. [Key Decisions](#key-decisions)

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                        FRONTEND                              │
│  React App (Web) ←──── Capacitor ────→ iOS/Android Apps     │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                        BACKEND                               │
│  API Server (handles auth, data, AI proxy)                  │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                        DATABASE                              │
│  User data, meals, favorites, chat history                  │
└─────────────────────────────────────────────────────────────┘
```

---

## Technology Stack Options

### Option A: Firebase/Supabase (Backend-as-a-Service) - Recommended for Solo Dev

| Component | Technology | Notes |
|-----------|------------|-------|
| Auth | Firebase Auth or Supabase Auth | Google, Apple, Email login |
| Database | Firestore or Supabase (Postgres) | Real-time sync built-in |
| API Proxy | Cloud Functions / Edge Functions | Secure your Gemini API key |
| Hosting | Vercel / Firebase Hosting | Auto-deploys from GitHub |
| Mobile | Capacitor | Wraps your React app |

**Pros:** Faster to build, less infrastructure to manage  
**Cons:** Less control, can get expensive at scale

### Option B: Custom Backend - More Control

| Component | Technology | Notes |
|-----------|------------|-------|
| Auth | Auth0, Clerk, or custom JWT | More flexibility |
| Backend | Node.js/Express or Next.js API routes | Full control |
| Database | PostgreSQL (via Railway, Neon, or Supabase) | Relational data |
| Hosting | Vercel, Railway, or Render | Various options |
| Mobile | Capacitor | Same approach |

---

## What You Need to Build

### 1. Authentication System

- Sign up / Login (email, Google, Apple Sign-In required for iOS)
- Password reset
- Session management
- Account deletion (required by app stores)

### 2. Database Schema

```sql
users
  - id, email, name, avatar, settings, created_at

meals
  - id, user_id, name, meal_type, date, ingredients[], created_at

favorites
  - id, user_id, name, meal_type, ingredients[], created_at

chat_history
  - id, user_id, conversation_id, messages[], created_at
```

### 3. API Endpoints

- CRUD for meals, favorites, chat history
- Gemini API proxy (keeps your API key server-side)
- User settings sync

### 4. Mobile App Setup (Capacitor)

- Xcode project for iOS
- Android Studio project for Android
- App icons, splash screens
- Push notifications (optional)

### 5. App Store Requirements

- **Apple Developer Account** - $99/year
- **Google Play Developer Account** - $25 one-time
- Privacy policy & terms of service
- Apple Sign-In (required if you offer social login)
- App review process (can take days to weeks)

---

## Cost Estimates

### Development Phase (One-time Setup)

| Item | DIY | Hire Developer |
|------|-----|----------------|
| Backend + Auth + Database | Your time | $3,000 - $8,000 |
| Mobile app setup (Capacitor) | Your time | $1,000 - $3,000 |
| App store assets & submission | Your time | $500 - $1,000 |
| **Total** | **Free (your time)** | **$4,500 - $12,000** |

### Monthly Operating Costs

| Service | Free Tier | Typical Usage | At Scale |
|---------|-----------|---------------|----------|
| **Supabase** | 50K MAU, 500MB DB | Free | $25-100/mo |
| **Firebase** | Generous free tier | Free - $25/mo | $50-200/mo |
| **Vercel** | 100GB bandwidth | Free | $20/mo |
| **Gemini API** | Free tier available | $0-10/mo | $20-100/mo |
| **Domain** | - | $12/year | $12/year |
| **Total** | **~$0/mo** | **$0-35/mo** | **$100-400/mo** |

### Annual Fixed Costs

| Item | Cost |
|------|------|
| Apple Developer Account | $99/year |
| Google Play Account | $25 one-time |
| Domain name | ~$12/year |
| **Total Year 1** | **~$136** |
| **Total Year 2+** | **~$111** |

---

## Timeline Estimate

For a solo developer working part-time:

| Phase | Duration |
|-------|----------|
| Learn & set up backend (Supabase/Firebase) | 1-2 weeks |
| Migrate app to use backend instead of localStorage | 1-2 weeks |
| Add authentication | 1 week |
| Set up Capacitor + build mobile apps | 1 week |
| Testing & bug fixes | 1-2 weeks |
| App store submission & approval | 1-2 weeks |
| **Total** | **6-10 weeks** |

---

## Recommended Approach

Based on this project's current state:

### 1. Use Supabase

- Great developer experience
- Generous free tier
- Postgres database
- Built-in auth
- Real-time subscriptions
- Works well with React

### 2. Keep Vercel for Web Hosting

- Zero config deploys
- Automatic GitHub integration
- Free tier is generous

### 3. Use Capacitor for Mobile

- Minimal changes to existing React code
- Single codebase for web + iOS + Android
- Access to native features when needed

### 4. Start with Free Tiers

- You can run everything for ~$0/month until you have significant users
- Scale up as needed

---

## Key Decisions

Before starting, decide on:

1. **Authentication method**
   - Email only?
   - Social login (Google/Apple)?
   - Note: Apple Sign-In is required if you offer any social login on iOS

2. **Real-time sync**
   - Do you need changes to sync instantly across devices?
   - Supabase/Firebase both support this

3. **Monetization plan**
   - Free forever?
   - Freemium (free with premium features)?
   - Subscription model?

4. **Priority**
   - Web first, then mobile?
   - Both simultaneously?

---

## Web Deployment Options (Quick Reference)

### Vercel (Recommended)
- Free tier available
- Automatic deploys from GitHub
- Just connect your repo and it auto-detects Vite
- Custom domain support

### Netlify
- Similar to Vercel
- Free tier, GitHub integration
- Drag-and-drop deploy option

### GitHub Pages
- Free, but requires config for SPA routing
- Good for portfolio projects

---

## Mobile Deployment Options (Quick Reference)

### Option A: Progressive Web App (PWA) - Easiest
- Add manifest file and service worker
- Users can "Add to Home Screen"
- **Pros:** Minimal work, single codebase
- **Cons:** No app store presence, iOS limitations

### Option B: Capacitor - Best Balance (Recommended)
- Wraps existing React app in native shell
- Deploy to App Store & Google Play
- **Pros:** Keep current codebase, real app store apps
- **Cons:** Requires Xcode/Android Studio setup

### Option C: React Native - Most Work
- Rewrite UI using React Native components
- **Pros:** Best native performance
- **Cons:** Significant rewrite required

---

## Important Considerations

### API Key Security
Your `.env` file has a Gemini API key. For production:
- Never expose API keys in frontend code
- Proxy API calls through your backend
- Use environment variables on your server

### Data Migration
Currently using localStorage. Migration path:
1. Set up database schema
2. Create API endpoints
3. Replace localStorage calls with API calls
4. Add authentication checks

### App Store Review Tips
- Have a clear privacy policy
- Implement account deletion feature
- Test thoroughly before submission
- Be prepared for rejection feedback and resubmission

---

## Resources

- [Supabase Docs](https://supabase.com/docs)
- [Firebase Docs](https://firebase.google.com/docs)
- [Capacitor Docs](https://capacitorjs.com/docs)
- [Vercel Docs](https://vercel.com/docs)
- [Apple App Store Guidelines](https://developer.apple.com/app-store/review/guidelines/)
- [Google Play Guidelines](https://developer.android.com/distribute/best-practices/launch/launch-checklist)
