# BlinkMoney Momentum

A React Native feature concept for BlinkMoney designed to make consistent investing more engaging, and rewarding.

## Overview

**Momentum** adds a habit-building layer to BlinkMoney through investing challenges, streaks, and milestones.

The goal is simple:

> **Build wealth. Build consistency. Build together.**

Instead of only tracking an investment transaction, Momentum gives users a reason to return, complete their daily action, and invite others into the journey.

## Why I Built This

BlinkMoney already makes investing simple through its Save → Grow → Borrow journey. I saw an opportunity to focus on the next behavioral problem: **helping users stay consistent with investing**.

Momentum was designed around three outcomes:

- **Engagement:** encourage users to return and complete their daily investment action.
- **Wealth gamification:** make consistency and progress visible through streaks and milestones.

This follows the assignment's focus on building a genuinely new feature that can improve engagement, wealth gamification.

## Key Features

### 21-Day Investing Challenges

Users can choose from different challenge durations and daily investment amounts, with the 21-Day Builder as the main experience.

### Streak Tracking

Users can see their current investing streak and challenge progress at a glance.

### Milestones

Completing a challenge unlocks a milestone experience with a visual celebration.

### Streak Shield

A missed day can be handled through a limited streak shield, making the experience more forgiving without removing the importance of consistency.

## Tech Stack

- React Native
- Expo
- JavaScript
- NativeWind
- React Navigation
- AsyncStorage
- React Native Reanimated
- React Native Safe Area Context

## Design Approach

The UI follows BlinkMoney's visual direction while creating a distinct experience for Momentum.

The design focuses on:

- Clear visual hierarchy
- Minimal and premium financial UI
- Strong primary actions
- Consistent spacing and typography
- Meaningful animations instead of decorative motion
- Mobile-first responsive layouts

## Edge Cases Considered

- Duplicate completion taps
- Starting an already active challenge
- Opening a completed challenge
- App restart during an active challenge
- Missed investing day
- Streak shield already used
- Progress save failure
- Empty challenge history
- Long content and challenge titles
- Small-screen devices
- Large accessibility font sizes
- Interrupted animations
- Navigation during progress updates

## Performance Considerations

The feature is intentionally lightweight and focused on the core user journey.

- Local persistence with AsyncStorage
- Reusable components
- Limited state updates
- Flat lists for scalable collections
- Reanimated for UI animations
- No unnecessary third-party dependencies
- No large assets or expensive background processing

## Running the Project

Clone the repository:

```bash
git clone <repository-url>
cd blink-money
```

Install dependencies:

```bash
npm install
```

Start Expo:

```bash
npm start
```

Run on Android:

```bash
npm run android
```

Run on iOS:

```bash
npm run ios
```

Run on web:

```bash
npm run web
```
