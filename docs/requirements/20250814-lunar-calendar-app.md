# Lunar Calendar/Reminder Web Application - Requirements Document

**Document Version**: 1.0  
**Date**: August 14, 2025  
**Project**: Am Lich (Lunar Calendar)  
**Status**: Draft  

## Executive Summary

This document outlines the requirements for developing a lunar calendar and reminder web application that allows users to view lunar dates, manage events, and receive notifications for important lunar calendar dates. The application will support both authenticated and unauthenticated users with different feature sets, and will be delivered as a Progressive Web App (PWA).

## Business Context and Problem Statement

### Problem Statement
Users need a reliable way to track and receive reminders for important dates in the lunar calendar system, particularly the 1st and 15th days of each lunar month, which hold cultural and religious significance. Currently, users must manually track these dates and may miss important observances.

### Business Objectives
- Provide accurate lunar calendar information to users
- Enable users to set and manage reminders for lunar calendar events
- Deliver notifications through multiple channels (push notifications and email)
- Ensure accessibility across devices through PWA functionality
- Support both casual browsers and registered users with different feature sets

## Stakeholder Analysis

### Primary Stakeholders
- **End Users**: Individuals interested in lunar calendar tracking and reminders
- **Development Team**: Full-stack developers, UI/UX designers, QA engineers
- **Product Owner**: Responsible for feature prioritization and business value

### Secondary Stakeholders
- **System Administrators**: Responsible for deployment and maintenance
- **Email Service Provider**: For email notification delivery
- **Push Notification Service**: For real-time notifications

## Functional Requirements

### 1. User Authentication and Management

#### 1.1 User Registration and Login
**Priority**: High  
**Description**: Users can create accounts and authenticate using existing NextAuth.js infrastructure.

**Acceptance Criteria**:
- Users can register with email/password or GitHub OAuth
- Users can log in and maintain sessions
- Users can reset passwords via email
- User data is securely stored and encrypted

#### 1.2 User Profile Management
**Priority**: Medium  
**Description**: Authenticated users can manage their profile and notification preferences.

**Acceptance Criteria**:
- Users can update their name and email
- Users can configure notification preferences (push notifications, email, or both)
- Users can set global reminder preferences (1, 3, or 7 days before events)
- Users can delete their accounts and associated data

### 2. Lunar Calendar Display

#### 2.1 Current Date Display
**Priority**: High  
**Description**: All users can view the current lunar date and corresponding Gregorian date.

**Acceptance Criteria**:
- Display current lunar month, day, and year
- Show corresponding Gregorian date
- Indicate current lunar phase
- Update automatically at midnight

#### 2.2 Calendar Navigation
**Priority**: High  
**Description**: Users can browse lunar calendar months and view historical/future dates.

**Acceptance Criteria**:
- Navigate between lunar months using previous/next controls
- Jump to specific lunar months/years
- View lunar dates overlaid on Gregorian calendar grid
- Highlight special lunar dates (1st and 15th of each month)

#### 2.3 Upcoming Important Dates
**Priority**: High  
**Description**: Display the next occurrence of the 1st or 15th lunar day.

**Acceptance Criteria**:
- Show next 1st lunar day with countdown
- Show next 15th lunar day with countdown
- Display both dates if they occur within a reasonable timeframe
- Include Gregorian date equivalents

### 3. Event Management (Authenticated Users Only)

#### 3.1 Event Creation
**Priority**: High  
**Description**: Logged-in users can create and manage lunar calendar events.

**Acceptance Criteria**:
- Create events with title, description, and lunar date
- Set events as one-time or annually recurring
- Associate events with specific lunar dates
- Save events to user's personal calendar

#### 3.2 Event Editing and Deletion
**Priority**: High  
**Description**: Users can modify or remove their created events.

**Acceptance Criteria**:
- Edit event details (title, description, date)
- Change recurring settings
- Delete individual events or entire recurring series
- Confirm deletion with user dialog

#### 3.3 Event Viewing
**Priority**: High  
**Description**: Users can view their events in various formats.

**Acceptance Criteria**:
- View events in calendar grid format
- List view of upcoming events
- Filter events by date range
- Search events by title or description

### 4. Reminder and Notification System

#### 4.1 Reminder Configuration
**Priority**: High  
**Description**: Users can set reminders for events and important lunar dates.

**Acceptance Criteria**:
- Global reminder settings: 1, 3, or 7 days before events
- Override global settings for individual events
- Set reminders for next 1st and 15th lunar days
- Enable/disable reminders per event

#### 4.2 Push Notifications
**Priority**: High  
**Description**: Deliver real-time notifications to users' devices.

**Acceptance Criteria**:
- Request notification permissions from users
- Send push notifications at configured reminder times
- Include event details in notification content
- Handle notification clicks to open relevant app section
- Support notification scheduling for future dates

#### 4.3 Email Notifications
**Priority**: Medium  
**Description**: Send email reminders using existing Resend integration.

**Acceptance Criteria**:
- Send formatted email reminders at configured times
- Include event details and lunar date information
- Provide unsubscribe functionality
- Handle email delivery failures gracefully
- Support HTML email templates

### 5. Progressive Web App Features

#### 5.1 PWA Installation
**Priority**: Medium  
**Description**: Users can install the application as a PWA.

**Acceptance Criteria**:
- Generate valid web app manifest
- Implement service worker for offline functionality
- Display install prompt on supported browsers
- Function as standalone app when installed

#### 5.2 Offline Functionality
**Priority**: Low  
**Description**: Core calendar viewing functions work offline.

**Acceptance Criteria**:
- Cache lunar calendar data for offline viewing
- Display cached events when offline
- Show appropriate offline indicators
- Sync data when connection is restored

## Non-Functional Requirements

### 6. Performance Requirements

#### 6.1 Response Time
- Page load time: < 3 seconds on average network conditions
- Calendar navigation: < 1 second between months
- Event creation/editing: < 2 seconds for form submission

#### 6.2 Scalability
- Support minimum 1,000 concurrent users
- Handle 10,000+ events per user
- Database queries optimized for lunar date calculations

### 7. Security Requirements

#### 7.1 Data Protection
- All user data encrypted in transit (HTTPS)
- Password hashing using bcrypt or stronger
- Secure session management with NextAuth.js
- SQL injection prevention through Prisma ORM

#### 7.2 Authentication Security
- Password strength requirements
- Rate limiting on login attempts
- Secure password reset process
- Protection against CSRF attacks

### 8. Usability Requirements

#### 8.1 User Interface
- Responsive design for desktop, tablet, and mobile
- Accessible design following WCAG 2.1 AA guidelines
- Intuitive navigation between calendar views
- Clear visual distinction between lunar and Gregorian dates

#### 8.2 User Experience
- Onboarding flow for new users
- Helpful tooltips and guidance
- Error messages are clear and actionable
- Consistent design language throughout application

### 9. Compatibility Requirements

#### 9.1 Browser Support
- Modern browsers: Chrome 90+, Firefox 88+, Safari 14+, Edge 90+
- PWA support in compatible browsers
- Graceful degradation for older browsers

#### 9.2 Device Support
- iOS 12+ and Android 8+ for mobile PWA installation
- Touch-friendly interface for mobile devices
- Keyboard navigation support

## Technical Requirements

### 10. Architecture Requirements

#### 10.1 Frontend Technology
- Next.js 15 with React 19
- TypeScript for type safety
- Tailwind CSS with shadcn/ui components
- tRPC for type-safe API communication

#### 10.2 Backend Technology
- Node.js server-side rendering
- PostgreSQL database with Prisma ORM
- NextAuth.js for authentication
- Resend for email notifications

#### 10.3 Third-Party Integrations
- Web Push API for notifications
- Lunar calendar calculation library or API
- Email service provider (Resend)

### 11. Database Schema Extensions

#### 11.1 New Database Models Required

```sql
-- Events table for user-created lunar events
model LunarEvent {
  id              String    @id @default(cuid())
  userId          String
  title           String
  description     String?
  lunarYear       Int
  lunarMonth      Int
  lunarDay        Int
  isRecurring     Boolean   @default(false)
  isActive        Boolean   @default(true)
  reminderDays    Int       @default(3) // 1, 3, or 7 days
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
  
  user            User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  @@index([userId, lunarYear, lunarMonth])
}

-- User notification preferences
model NotificationPreference {
  id                    String   @id @default(cuid())
  userId                String   @unique
  enablePushNotifications Boolean @default(false)
  enableEmailNotifications Boolean @default(true)
  defaultReminderDays   Int      @default(3)
  remindFor15thDay      Boolean  @default(true)
  remindFor1stDay       Boolean  @default(true)
  createdAt            DateTime  @default(now())
  updatedAt            DateTime  @updatedAt
  
  user                 User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}

-- Push notification subscriptions
model PushSubscription {
  id          String   @id @default(cuid())
  userId      String
  endpoint    String
  p256dh      String
  auth        String
  userAgent   String?
  createdAt   DateTime @default(now())
  
  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  @@unique([userId, endpoint])
}
```

#### 11.2 User Model Extensions
- Add relationships to new models
- Extend user preferences for lunar calendar settings

## User Stories

### Epic 1: Basic Calendar Viewing
**As a visitor**, I want to view the current lunar date so that I can know today's lunar calendar information without creating an account.

**As a visitor**, I want to browse different lunar months so that I can see historical and future lunar dates.

**As a visitor**, I want to see when the next 1st and 15th lunar days occur so that I can plan for important observances.

### Epic 2: Event Management
**As a registered user**, I want to create lunar calendar events so that I can track personal important dates.

**As a registered user**, I want to set events as annually recurring so that I don't need to recreate them each year.

**As a registered user**, I want to edit my events so that I can update details as needed.

### Epic 3: Notification System
**As a registered user**, I want to receive push notifications for my events so that I'm reminded in real-time.

**As a registered user**, I want to receive email reminders so that I have backup notification delivery.

**As a registered user**, I want to customize reminder timing so that I can get notifications when most helpful to me.

### Epic 4: Progressive Web App
**As a mobile user**, I want to install the app on my device so that I can access it like a native application.

**As a user**, I want the app to work offline so that I can view my calendar without an internet connection.

## Assumptions and Constraints

### Assumptions
1. Users have basic familiarity with lunar calendar concepts
2. Majority of users will access the application on mobile devices
3. Users are comfortable with web-based applications
4. Lunar date calculations can be implemented using existing libraries or algorithms
5. Push notification support is available in target browsers
6. Email notification delivery will be handled by Resend service

### Constraints
1. Must build upon existing Next.js boilerplate architecture
2. Must use PostgreSQL database with Prisma ORM
3. Authentication must use existing NextAuth.js implementation
4. Email notifications limited to Resend service capabilities
5. PWA functionality limited by browser support
6. Budget constraints may limit third-party service usage

## Success Metrics

### User Engagement
- Daily active users (target: 70% of registered users use app weekly)
- Event creation rate (target: Average 3 events per active user)
- Notification interaction rate (target: 60% of notifications clicked/acknowledged)

### Technical Performance
- Page load time under 3 seconds (95th percentile)
- PWA installation rate (target: 30% of mobile users)
- Notification delivery success rate (target: 95% for push, 98% for email)

### User Satisfaction
- User retention rate (target: 80% return within 30 days)
- Feature usage distribution across authenticated vs unauthenticated users
- Error rate and user support requests (target: < 2% of active users report issues)

## Implementation Considerations

### Phase 1: Foundation (Weeks 1-3)
- Lunar calendar calculation integration
- Basic calendar display for unauthenticated users
- Database schema implementation

### Phase 2: Core Features (Weeks 4-6)
- Event management for authenticated users
- Basic notification system setup
- User preference management

### Phase 3: Advanced Features (Weeks 7-8)
- Push notification implementation
- Email notification integration
- PWA manifest and service worker

### Phase 4: Polish and Testing (Weeks 9-10)
- UI/UX refinements
- Comprehensive testing
- Performance optimization

## Risks and Mitigation

### High Risk
- **Lunar calendar calculation accuracy**: Mitigate by using well-tested libraries and validation against known sources
- **Push notification browser compatibility**: Implement graceful fallbacks and clear messaging about support

### Medium Risk
- **Email delivery reliability**: Monitor delivery rates and implement retry mechanisms
- **Performance with large event datasets**: Implement pagination and data optimization

### Low Risk
- **PWA installation adoption**: Provide clear installation instructions and benefits
- **User onboarding complexity**: Implement progressive disclosure and help documentation

## Dependencies and External Requirements

### Technical Dependencies
- Lunar calendar calculation library (e.g., lunar-javascript, chinese-lunar-calendar)
- Web Push protocol implementation
- Service worker for PWA functionality
- Push notification service (Firebase Cloud Messaging or similar)

### External Services
- Resend for email delivery
- Database hosting (existing PostgreSQL setup)
- CDN for static assets (if needed for performance)

## Glossary

- **Lunar Calendar**: Traditional calendar system based on lunar cycles
- **1st Lunar Day**: New moon day, beginning of lunar month
- **15th Lunar Day**: Full moon day, middle of lunar month
- **PWA**: Progressive Web App - web application with native app-like features
- **Push Notification**: Real-time message delivered to user's device
- **tRPC**: TypeScript Remote Procedure Call library for type-safe APIs

---

**Next Steps**: 
1. Review and approve requirements with stakeholders
2. Create technical design document
3. Develop project timeline and resource allocation
4. Begin Phase 1 implementation planning