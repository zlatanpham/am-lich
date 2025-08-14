# Vietnamese Lunar Calendar/Reminder Web Application - Requirements Document

**Document Version**: 2.0  
**Date**: August 14, 2025  
**Project**: Âm Lịch (Vietnamese Lunar Calendar)  
**Status**: Updated for Vietnamese Market  
**Target Users**: Vietnamese speakers and Vietnamese cultural community  

## Executive Summary

This document outlines the requirements for developing a Vietnamese lunar calendar (Âm lịch) and reminder web application specifically designed for Vietnamese users. The application allows users to view Vietnamese lunar dates, manage cultural events, and receive notifications for important Vietnamese lunar calendar observances. The application will support both authenticated and unauthenticated users with different feature sets, delivered as a Progressive Web App (PWA) with full Vietnamese localization.

## Business Context and Problem Statement

### Problem Statement
Vietnamese users need a reliable way to track and receive reminders for important dates in the Vietnamese lunar calendar system (Âm lịch), particularly the 1st and 15th days of each lunar month (Mồng 1 và Rằm), which hold deep cultural and religious significance in Vietnamese culture. Additionally, users need to track traditional Vietnamese holidays, ancestor worship dates, and personal important dates according to the lunar calendar. Currently, Vietnamese users must manually track these dates using generic lunar calendars that don't account for Vietnamese cultural context and terminology.

### Business Objectives
- Provide accurate Vietnamese lunar calendar information with proper Vietnamese terminology
- Enable users to set and manage reminders for Vietnamese cultural events and observances
- Support Vietnamese lunar calendar traditions including ancestor worship scheduling
- Deliver notifications in Vietnamese language through multiple channels
- Ensure accessibility across devices through PWA functionality
- Support both casual browsers and registered users with Vietnamese-specific features
- Preserve and promote Vietnamese lunar calendar cultural knowledge

## Stakeholder Analysis

### Primary Stakeholders
- **End Users**: Vietnamese individuals and Vietnamese diaspora interested in traditional lunar calendar tracking
- **Cultural Community**: Vietnamese cultural organizations and religious communities
- **Development Team**: Full-stack developers with Vietnamese localization experience, UI/UX designers familiar with Vietnamese design preferences, QA engineers
- **Product Owner**: Responsible for Vietnamese market feature prioritization and cultural accuracy

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

#### 2.1 Current Vietnamese Lunar Date Display
**Priority**: High  
**Description**: All users can view the current Vietnamese lunar date (ngày âm lịch) with proper Vietnamese terminology and formatting.

**Acceptance Criteria**:
- Display current lunar date using Vietnamese format (e.g., "Ngày 15 tháng 8 năm Giáp Thìn")
- Show Vietnamese lunar month names (tháng Giêng, tháng Hai, etc.)
- Display corresponding Gregorian date (dương lịch)
- Show Vietnamese zodiac year name (e.g., "Năm Giáp Thìn" - Year of the Dragon)
- Indicate current lunar phase with Vietnamese terminology
- Display Vietnamese day names (Mồng 1, Mồng 2, ... Rằm, 16, 17, ... 30)
- Update automatically at midnight Vietnam time (UTC+7)
- Show cultural significance indicators for important days (Mồng 1, Rằm)

#### 2.2 Vietnamese Lunar Calendar Navigation
**Priority**: High  
**Description**: Users can browse Vietnamese lunar calendar months with proper Vietnamese naming and cultural context.

**Acceptance Criteria**:
- Navigate between lunar months using Vietnamese month names (Tháng Giêng, Tháng Hai, Tháng Ba, etc.)
- Jump to specific Vietnamese lunar years using zodiac cycle names
- View Vietnamese lunar dates overlaid on Gregorian calendar grid
- Highlight culturally significant dates (Mồng 1 - New Moon, Rằm - Full Moon)
- Display Vietnamese traditional holidays (Tết Nguyên Đán, Tết Trung Thu, etc.)
- Show ancestor worship recommended dates (1st, 15th, death anniversaries)
- Use Vietnamese date formatting throughout navigation

#### 2.3 Upcoming Vietnamese Cultural Important Dates
**Priority**: High  
**Description**: Display the next occurrence of culturally significant Vietnamese lunar dates.

**Acceptance Criteria**:
- Show next Mồng 1 (1st lunar day) with countdown in Vietnamese
- Show next Rằm (15th lunar day) with countdown in Vietnamese
- Display upcoming Vietnamese traditional holidays with cultural explanations
- Show ancestor worship dates (ngày giỗ) reminders
- Include both lunar and Gregorian date equivalents
- Provide cultural context for each important date
- Display zodiac day characteristics for cultural planning

### 3. Event Management (Authenticated Users Only)

#### 3.1 Vietnamese Cultural Event Creation
**Priority**: High  
**Description**: Logged-in users can create and manage Vietnamese lunar calendar events including traditional celebrations and personal observances.

**Acceptance Criteria**:
- Create events with Vietnamese title, description, and lunar date
- Support Vietnamese cultural event templates (giỗ tổ, lễ cưới, etc.)
- Set events as one-time or annually recurring according to Vietnamese traditions
- Associate events with specific Vietnamese lunar dates and zodiac considerations
- Support ancestor worship scheduling (ngày giỗ) with proper intervals
- Save events to user's personal Vietnamese lunar calendar
- Include cultural significance notes for traditional events

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

#### 4.1 Vietnamese Cultural Reminder Configuration
**Priority**: High  
**Description**: Users can set culturally appropriate reminders for Vietnamese lunar events and observances.

**Acceptance Criteria**:
- Global reminder settings with Vietnamese cultural timing (1, 3, 7 days for regular events; specific timing for ancestor worship)
- Override global settings for individual Vietnamese cultural events
- Set automatic reminders for Mồng 1 and Rằm days with cultural context
- Configure ancestor worship reminders (giỗ tổ tiên) with traditional scheduling
- Enable/disable reminders per event type (personal, cultural, religious)
- Support Vietnamese time preferences and cultural considerations for reminder timing

#### 4.2 Vietnamese Push Notifications
**Priority**: High  
**Description**: Deliver real-time notifications in Vietnamese with cultural context.

**Acceptance Criteria**:
- Request notification permissions with Vietnamese language prompts
- Send push notifications in Vietnamese at culturally appropriate times
- Include Vietnamese event details and cultural significance in notifications
- Use proper Vietnamese honorifics and cultural language
- Handle notification clicks to open relevant Vietnamese app sections
- Support scheduling for Vietnamese cultural events and ancestor worship
- Respect Vietnamese cultural timing preferences (avoid inauspicious hours)

#### 4.3 Vietnamese Email Notifications
**Priority**: Medium  
**Description**: Send Vietnamese email reminders with proper cultural formatting.

**Acceptance Criteria**:
- Send Vietnamese formatted email reminders with cultural appropriate greetings
- Include Vietnamese event details and lunar date information with cultural context
- Use traditional Vietnamese calendar terminology in emails
- Provide Vietnamese language unsubscribe functionality
- Handle email delivery failures with Vietnamese error messages
- Support Vietnamese HTML email templates with cultural design elements
- Include educational content about Vietnamese lunar calendar traditions

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

#### 8.1 Vietnamese User Interface
- Responsive design optimized for Vietnamese users across all devices
- Accessible design following WCAG 2.1 AA guidelines with Vietnamese screen reader support
- Intuitive navigation using Vietnamese cultural calendar concepts
- Clear visual distinction between âm lịch (lunar) and dương lịch (Gregorian) dates
- Vietnamese typography with proper diacritical mark support
- Cultural color schemes appropriate for Vietnamese lunar calendar (red for auspicious dates, etc.)
- Support for Vietnamese reading patterns and cultural UI expectations

#### 8.2 Vietnamese User Experience
- Culturally appropriate onboarding flow explaining Vietnamese lunar calendar concepts
- Vietnamese language tooltips with cultural context and education
- Error messages in Vietnamese that are culturally sensitive and clear
- Consistent Vietnamese design language respecting cultural preferences
- Educational content about Vietnamese lunar calendar traditions integrated throughout
- Support for users unfamiliar with traditional lunar calendar concepts

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
- Web Push API for Vietnamese notifications
- Vietnamese lunar calendar calculation library (supporting Vietnamese cultural variations)
- Email service provider (Resend) with Vietnamese language support
- Vietnamese localization libraries for proper diacritical mark handling
- Vietnamese zodiac and cultural data sources

### 11. Database Schema Extensions

#### 11.1 New Database Models Required

```sql
-- Events table for Vietnamese lunar events
model VietnameseLunarEvent {
  id                    String    @id @default(cuid())
  userId                String
  title                 String
  description           String?
  lunarYear             Int
  lunarMonth            Int       // Vietnamese lunar month (1-12, with leap months)
  lunarDay              Int       // Vietnamese lunar day (1-30)
  vietnameseZodiacYear  String    // e.g., "Giáp Thìn", "Tân SỮu"
  eventType             String    @default("personal") // personal, cultural, ancestor_worship, holiday
  culturalSignificance  String?   // Cultural notes and significance
  isRecurring           Boolean   @default(false)
  isActive              Boolean   @default(true)
  reminderDays          Int       @default(3)
  isAncestorWorship     Boolean   @default(false)
  ancestorName          String?   // For giỗ tổ events
  createdAt             DateTime  @default(now())
  updatedAt             DateTime  @updatedAt
  
  user                  User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  @@index([userId, lunarYear, lunarMonth])
  @@index([eventType, lunarMonth, lunarDay])
}

-- Vietnamese notification preferences
model VietnameseNotificationPreference {
  id                         String   @id @default(cuid())
  userId                     String   @unique
  enablePushNotifications    Boolean  @default(false)
  enableEmailNotifications   Boolean  @default(true)
  defaultReminderDays        Int      @default(3)
  remindForMong1             Boolean  @default(true)  // Mồng 1 (1st lunar day)
  remindForRam               Boolean  @default(true)  // Rằm (15th lunar day)
  remindForAncestorWorship   Boolean  @default(true)  // Giỗ tổ tiên
  remindForTraditionalHolidays Boolean @default(true)  // Traditional Vietnamese holidays
  preferredLanguage          String   @default("vi")   // Vietnamese language preference
  timezone                   String   @default("Asia/Ho_Chi_Minh")
  culturalReminderLevel      String   @default("moderate") // minimal, moderate, detailed
  createdAt                  DateTime @default(now())
  updatedAt                  DateTime @updatedAt
  
  user                       User     @relation(fields: [userId], references: [id], onDelete: Cascade)
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

### Epic 1: Vietnamese Lunar Calendar Viewing
**As a Vietnamese user**, I want to view the current âm lịch date with proper Vietnamese terminology so that I can know today's lunar calendar information in my cultural context without creating an account.

**As a Vietnamese user**, I want to browse different Vietnamese lunar months (Tháng Giêng, Tháng Hai, etc.) so that I can see historical and future lunar dates with cultural significance.

**As a Vietnamese user**, I want to see when the next Mồng 1 and Rằm occur with cultural context so that I can plan for ancestor worship and traditional observances.

**As a Vietnamese user**, I want to see upcoming Vietnamese traditional holidays (Tết, Trung Thu, etc.) so that I can prepare for cultural celebrations.

### Epic 2: Vietnamese Cultural Event Management
**As a registered Vietnamese user**, I want to create âm lịch events with Vietnamese cultural context so that I can track personal important dates according to Vietnamese traditions.

**As a registered Vietnamese user**, I want to schedule ancestor worship events (giỗ tổ) with proper Vietnamese cultural guidelines so that I can honor my ancestors appropriately.

**As a registered Vietnamese user**, I want to set Vietnamese cultural events as annually recurring so that I don't need to recreate traditional observances each year.

**As a registered Vietnamese user**, I want to use pre-defined Vietnamese cultural event templates so that I can easily create traditional celebrations with proper cultural context.

### Epic 3: Vietnamese Cultural Notification System
**As a registered Vietnamese user**, I want to receive push notifications in Vietnamese for my cultural events so that I'm reminded in real-time with proper cultural context.

**As a registered Vietnamese user**, I want to receive Vietnamese email reminders with cultural explanations so that I have comprehensive notification delivery.

**As a registered Vietnamese user**, I want to customize reminder timing according to Vietnamese cultural preferences so that I get notifications at culturally appropriate times.

**As a registered Vietnamese user**, I want automatic reminders for Mồng 1 and Rằm days so that I never miss important worship opportunities.

### Epic 4: Vietnamese Progressive Web App
**As a Vietnamese mobile user**, I want to install the Vietnamese lunar calendar app on my device so that I can access Vietnamese cultural calendar information like a native application.

**As a Vietnamese user**, I want the app to work offline with cached Vietnamese cultural content so that I can view my âm lịch calendar without an internet connection.

**As a Vietnamese user**, I want the app to provide cultural education about Vietnamese lunar calendar traditions so that I can learn about my heritage while using the calendar.

## Assumptions and Constraints

### Assumptions
1. **Cultural Context**: Primary users are Vietnamese or familiar with Vietnamese cultural traditions
2. **Language Preference**: Users prefer Vietnamese language interface with cultural terminology
3. **Cultural Knowledge**: Users have varying levels of familiarity with Vietnamese lunar calendar traditions (app will provide education)
4. **Device Usage**: Majority of Vietnamese users will access the application on mobile devices
5. **Technology Comfort**: Users are comfortable with web-based applications and PWA installation
6. **Calendar System**: Vietnamese lunar calendar follows Chinese lunar calendar base with Vietnamese cultural adaptations
7. **Cultural Variations**: Vietnamese lunar calendar may have specific cultural variations in calculation or observance
8. **Notification Timing**: Vietnamese users prefer culturally appropriate timing for notifications (respecting traditional beliefs about auspicious times)
9. **Ancestor Worship**: Significant portion of users will use app for ancestor worship date tracking
10. **Traditional Holidays**: Users want integrated support for Vietnamese traditional holidays and their lunar calendar dates

### Constraints
1. Must build upon existing Next.js boilerplate architecture
2. Must use PostgreSQL database with Prisma ORM
3. Authentication must use existing NextAuth.js implementation
4. Email notifications limited to Resend service capabilities (must support Vietnamese language)
5. PWA functionality limited by browser support
6. Budget constraints may limit third-party Vietnamese localization services
7. **Cultural Accuracy**: Must ensure cultural accuracy for Vietnamese lunar calendar traditions
8. **Language Support**: Must provide complete Vietnamese localization including proper diacritical marks
9. **Timezone**: Must handle Vietnam timezone (UTC+7) correctly for lunar date calculations
10. **Cultural Sensitivity**: Must respect Vietnamese cultural and religious sensitivities in design and functionality

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
- **Vietnamese Lunar Calendar Library**: Library supporting Vietnamese lunar calendar calculations with cultural variations
- **Vietnamese Localization**: Libraries for proper Vietnamese text handling, diacritical marks, and formatting
- **Timezone Handling**: Vietnam timezone (Asia/Ho_Chi_Minh) support for accurate date calculations
- **Web Push Protocol**: Implementation supporting Vietnamese language notifications
- **Service Worker**: PWA functionality with Vietnamese offline content
- **Push Notification Service**: Firebase Cloud Messaging or similar with Vietnamese language support
- **Vietnamese Cultural Data**: Database of Vietnamese traditional holidays, zodiac information, and cultural observances

### External Services
- Resend for email delivery
- Database hosting (existing PostgreSQL setup)
- CDN for static assets (if needed for performance)

## Vietnamese Cultural Glossary

- **Âm Lịch**: Vietnamese lunar calendar system based on lunar cycles with Vietnamese cultural adaptations
- **Dương Lịch**: Gregorian (solar) calendar system
- **Mồng 1**: First day of lunar month (new moon), culturally significant for new beginnings
- **Rằm**: Fifteenth day of lunar month (full moon), important for worship and cultural observances
- **Giỗ Tổ Tiên**: Ancestor worship ceremonies typically observed on lunar calendar dates
- **Tết Nguyên Đán**: Vietnamese New Year, most important Vietnamese holiday
- **Tết Trung Thu**: Mid-Autumn Festival, celebrated on 15th day of 8th lunar month
- **Ngày Giỗ**: Death anniversary observance dates according to lunar calendar
- **Can Chi**: Vietnamese zodiac system with 12 animals and 10 heavenly stems (60-year cycle)
- **Tháng Giêng**: First lunar month of Vietnamese calendar year
- **Năm Giáp Thìn**: Example of Vietnamese zodiac year naming (Year of the Dragon)
- **PWA**: Progressive Web App - web application with native app-like features
- **Push Notification**: Real-time message delivered to user's device in Vietnamese
- **tRPC**: TypeScript Remote Procedure Call library for type-safe APIs

---

## Implementation Changes Required for Vietnamese Market

### Language and Localization Changes
1. **Complete Vietnamese Translation**: All UI text, messages, and content must be translated to Vietnamese
2. **Cultural Terminology**: Replace generic lunar calendar terms with proper Vietnamese terminology
3. **Vietnamese Typography**: Implement proper font support for Vietnamese diacritical marks
4. **Date Formatting**: Vietnamese date formats and cultural conventions
5. **Time Zone**: Default to Vietnam timezone (Asia/Ho_Chi_Minh) for all calculations

### Calendar System Modifications
1. **Vietnamese Month Names**: Implement Vietnamese lunar month names (Tháng Giêng, Tháng Hai, etc.)
2. **Zodiac Integration**: Vietnamese zodiac animals and Can Chi system
3. **Cultural Dates**: Pre-populate Vietnamese traditional holidays and observances
4. **Ancestor Worship Support**: Special features for giỗ tổ scheduling and reminders
5. **Cultural Significance Indicators**: Visual and textual indicators for culturally important dates

### Database Schema Updates
1. **Event Types**: Add Vietnamese cultural event categories
2. **Cultural Data**: Store Vietnamese zodiac, holiday, and traditional observance information
3. **Language Preferences**: User language and cultural preference settings
4. **Ancestor Information**: Fields for ancestor worship event details

### User Experience Enhancements
1. **Cultural Onboarding**: Educational content about Vietnamese lunar calendar traditions
2. **Cultural Context**: Explanatory content for cultural significance of dates and events
3. **Vietnamese Design Patterns**: UI/UX adapted for Vietnamese cultural preferences
4. **Educational Integration**: Built-in learning resources about Vietnamese lunar calendar

### Technical Implementation
1. **Lunar Calculation Library**: Ensure Vietnamese cultural variations are supported
2. **Localization Framework**: Implement robust Vietnamese language support
3. **Cultural Data Sources**: Integrate authoritative Vietnamese cultural calendar data
4. **Vietnamese SEO**: Optimize for Vietnamese search terms and cultural keywords

---

**Next Steps**: 
1. **Cultural Review**: Review requirements with Vietnamese cultural experts and community stakeholders
2. **Technical Assessment**: Evaluate existing lunar calendar libraries for Vietnamese cultural accuracy
3. **Localization Planning**: Develop comprehensive Vietnamese translation and cultural adaptation plan
4. **Cultural Validation**: Establish process for ongoing cultural accuracy validation
5. **Community Engagement**: Engage Vietnamese community for feedback and cultural guidance
6. Begin Phase 1 implementation with Vietnamese cultural foundation