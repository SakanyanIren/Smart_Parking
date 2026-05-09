# Parking App Platform

A real-time parking reservation system built with React and Supabase, enabling users to view, reserve, and manage parking spots with live updates across multiple clients.

## Technology Stack

### **React 19.2.0**
**Description:** A JavaScript library for building user interfaces through reusable components.

**How it works:** React uses a virtual DOM to efficiently update only the parts of the UI that change, rather than re-rendering the entire page. Components manage their own state and compose together to create complex UIs.

**Benefits:**
- Component-based architecture promotes code reusability and maintainability
- Virtual DOM provides excellent performance for dynamic interfaces
- Large ecosystem with extensive community support and resources
- Declarative programming style makes code more predictable and easier to debug

**In your project:** React powers your entire parking app UI, managing components like parking spot displays, reservation forms, check-in pages, and real-time updates for spot availability.

---

### **React Router DOM 7.11.0**
**Description:** The standard routing library for React applications that enables navigation between different views.

**How it works:** Uses declarative routing with components like `<Route>` and `<Navigate>`. It manages browser history, URL parameters, and provides hooks like `useNavigate` for programmatic navigation.

**Benefits:**
- Client-side routing provides instant navigation without page reloads
- Supports nested routes and protected routes for authentication
- Automatic code splitting capabilities
- Built-in support for route parameters and query strings

**In your project:** Manages navigation between login, parking view, and check-in pages. Implements protected routes to ensure users are authenticated before accessing parking features.

---

### **Vite 7.2.4**
**Description:** A modern, lightning-fast build tool and development server for web projects.

**How it works:** Uses native ES modules in development for instant hot module replacement (HMR). In production, it bundles code using Rollup with optimized output. Leverages esbuild for extremely fast dependency pre-bundling.

**Benefits:**
- Instant server start regardless of app size
- Lightning-fast Hot Module Replacement (updates in milliseconds)
- Optimized production builds with automatic code splitting
- Built-in support for TypeScript, JSX, CSS, and more
- Significantly faster than traditional bundlers like Webpack

**In your project:** Serves as your build tool and dev server, providing fast development experience with instant updates when you modify parking components or styling.

---

### **Supabase (with @supabase/supabase-js)**
**Description:** An open-source Backend-as-a-Service (BaaS) platform that provides a complete backend infrastructure built on top of PostgreSQL. Often described as an open-source Firebase alternative, Supabase eliminates the need to build and maintain custom backend servers while providing enterprise-grade database features.

**How it works:**

Supabase is built on several powerful open-source tools that work together:

1. **PostgreSQL Database (Core)**: At its heart, Supabase uses PostgreSQL, one of the most advanced open-source relational databases. This means you get full SQL capabilities, complex queries, joins, transactions, and ACID compliance out of the box.

2. **PostgREST (Auto-generated API)**: Supabase automatically generates a RESTful API from your database schema. When you create a table, the API endpoints are instantly available without writing any backend code. It respects your database permissions and relationships.

3. **Realtime Engine**: Built on PostgreSQL's replication features and WebSocket technology, Supabase Realtime listens to database changes (inserts, updates, deletes) and broadcasts them to subscribed clients in milliseconds. This is achieved through:
   - PostgreSQL's Write-Ahead Logging (WAL) which tracks all database changes
   - A Realtime server that reads the WAL and broadcasts changes via WebSockets
   - Client subscriptions that filter which changes they want to receive

4. **GoTrue (Authentication)**: Provides JWT-based authentication with support for email/password, magic links, OAuth providers (Google, GitHub, etc.), and phone authentication.

5. **Storage API**: S3-compatible object storage for files, images, and videos with automatic optimization and CDN distribution.

6. **Edge Functions**: Deploy serverless TypeScript functions at the edge for custom business logic.

**Architecture Flow:**
```
Client (Browser)
    ↓ (REST API calls & WebSocket connection)
Supabase Client Library (@supabase/supabase-js)
    ↓
Supabase Platform
    ├── PostgREST → PostgreSQL Database
    ├── Realtime Server → PostgreSQL WAL → WebSocket broadcasts
    ├── GoTrue Auth Server
    └── Storage API
    ↓
All connected clients receive updates instantly
```

**Benefits:**

*Database & API:*
- **Full SQL Power**: PostgreSQL gives you advanced features like JSON columns, full-text search, foreign keys, triggers, and custom functions
- **Zero Backend Code**: Auto-generated REST API means no Express.js or API controllers to write
- **Type Safety**: Auto-generated TypeScript types from your database schema
- **Complex Queries**: Support for joins, aggregations, and nested queries through the API

*Real-Time Features:*
- **Instant Synchronization**: Changes propagate to all connected clients in under 100ms
- **Selective Subscriptions**: Subscribe only to specific tables, rows, or even columns
- **Conflict-Free**: PostgreSQL's ACID properties ensure data consistency
- **Scalable**: Handles thousands of concurrent connections efficiently

*Developer Experience:*
- **Rapid Development**: Build features in hours instead of days
- **No Infrastructure Management**: No servers to configure, scale, or maintain
- **Built-in Database UI**: Visual table editor, SQL editor, and API documentation
- **Local Development**: Run Supabase locally with Docker for offline development

*Security & Reliability:*
- **Row Level Security (RLS)**: PostgreSQL's RLS lets you define access rules at the database level
- **Automatic Backups**: Daily backups with point-in-time recovery
- **SSL Connections**: All data encrypted in transit
- **Open Source**: No vendor lock-in, self-host if needed

*Cost Efficiency:*
- **Generous Free Tier**: 500MB database, 1GB file storage, 2GB bandwidth
- **Predictable Pricing**: Pay only for what you use with no surprise bills
- **All-in-One**: Replaces multiple services (database hosting, API server, WebSocket server, auth service)

**In your project:**

Supabase serves as the entire backend infrastructure for the parking application:

1. **Data Storage** (4 main tables):
   - `profiles` table stores extended user information (full_name required, phone optional)
   - `parking_spots` table stores all parking spot information (152 spots across 4 sections, with status: available, reserving, reserved, occupied)
   - `reservations` table tracks user reservations with full details (user info, pricing, timestamps, check-in status, lifecycle tracking)
   - `payments` table stores mock payment transactions (card_last4, expiration_date, no CVV stored for security)
   - Indexes on frequently queried columns (status, zone_id, user_email, spot_id) ensure fast lookups

2. **Real-Time Synchronization**:
   - When User A clicks a spot, status changes to "reserving" instantly via WebSocket broadcast
   - All connected clients (User B, C, D...) receive the update in under 100ms and see the spot as locked
   - When User A completes payment, status changes to "reserved" with another real-time broadcast
   - When User A checks in, status changes to "occupied" and all users see the driving animation
   - UI automatically updates to show the spot as "occupied" without manual refresh
   - Works across multiple browser windows, devices, and locations simultaneously

3. **Conflict Prevention**:
   - PostgreSQL's transaction isolation prevents double-booking
   - If two users try to reserve the same spot simultaneously, only one succeeds
   - Real-time updates immediately notify the other user that the spot is taken

4. **Data Seeding**:
   - On first launch, the app checks if parking spots exist
   - If database is empty, local parking data automatically seeds to Supabase
   - Ensures consistent data structure across all clients

5. **Query Efficiency**:
   - Fetch reservations filtered by user email: `supabase.from('reservations').select('*').eq('user_email', email)`
   - Get available spots: `supabase.from('parking_spots').select('*').eq('status', 'available')`
   - All queries use database indexes for optimal performance

The Supabase setup means the parking app has no traditional backend server code - everything from database operations to real-time updates is handled by Supabase's infrastructure, allowing developers to focus entirely on the user interface and business logic.

---

### **AWS CloudFront**
**Description:** Amazon CloudFront is a Content Delivery Network (CDN) service that securely delivers web applications, APIs, videos, and other content to users worldwide with low latency and high transfer speeds.

**How it works:**

CloudFront operates through a global network of edge locations:

1. **Edge Locations Network**: AWS has 450+ edge locations (data centers) distributed globally across major cities and regions. These edge locations cache your content close to your users.

2. **Origin Server**: Your application files (HTML, CSS, JS, images) are stored in an origin - in this case, an S3 bucket created by SST. CloudFront pulls content from this origin.

3. **Content Delivery Process**:
   - User requests your parking app (e.g., from Armenia)
   - Request routes to the nearest edge location (likely in Europe or Middle East)
   - If content is cached at that edge location, it's delivered instantly (cache hit)
   - If not cached, CloudFront fetches from origin, caches it, then delivers to user
   - Subsequent requests from that region use the cached version

4. **Intelligent Routing**: CloudFront automatically routes requests through AWS's optimized network backbone rather than the public internet, reducing latency even for cache misses.

5. **Cache Invalidation**: When you deploy updates, CloudFront can invalidate cached content so users get the latest version.

**Architecture Flow:**
```
User in Armenia → CloudFront Edge (Istanbul/Frankfurt)
                        ↓ (cache miss)
                  Origin S3 Bucket (us-east-1)
                        ↓
                  Content Cached at Edge
                        ↓
              Future requests served instantly from edge
```

**Benefits:**

*Performance:*
- **Global Low Latency**: Content served from edge locations 10-100ms away instead of 200-500ms from origin
- **Faster Page Loads**: Initial page load can be 50-80% faster compared to serving from a single region
- **Reduced Time to First Byte (TTFB)**: Edge caching means instant content delivery
- **Bandwidth Optimization**: Compressed content and optimized routing reduce data transfer time

*Scalability:*
- **Automatic Scaling**: Handles traffic spikes from 10 to 10 million users without configuration
- **DDoS Protection**: Built-in AWS Shield Standard protects against network/transport layer attacks
- **No Server Management**: Fully managed service with 99.9% uptime SLA

*Cost Efficiency:*
- **Reduced Origin Load**: Edge caching means 80-95% of requests never hit your origin server
- **Pay-per-Use**: Only pay for data transfer out and requests, no minimum fees
- **Free SSL/TLS**: Automatic HTTPS certificates at no extra cost
- **S3 Transfer Savings**: Serving from CloudFront is cheaper than serving directly from S3

*Developer Features:*
- **Custom Domain Support**: Use your own domain (e.g., parking.yourdomain.com)
- **Automatic Gzip/Brotli Compression**: Reduces file sizes by 70-90%
- **HTTP/2 and HTTP/3**: Modern protocols for faster multiplexed connections
- **Real-time Metrics**: Monitor requests, cache hit ratios, and errors

*Security:*
- **HTTPS by Default**: All content served over secure connections
- **Origin Access Identity**: Restricts direct S3 access, forcing traffic through CloudFront
- **Geo-Restrictions**: Block or allow specific countries if needed
- **WAF Integration**: Add Web Application Firewall for advanced threat protection

**In your project:**

CloudFront serves as the global delivery network for your parking application:

1. **Static Asset Delivery**:
   - All React build files (JS bundles, CSS, HTML) are served from CloudFront edges
   - Images, icons, and fonts cached at edge locations
   - Users anywhere in the world get sub-100ms response times

2. **Automatic Optimization**:
   - JavaScript and CSS bundles automatically compressed
   - Vite's production build outputs are optimized for CDN caching
   - Cache headers ensure efficient browser and edge caching

3. **HTTPS Everywhere**:
   - All parking app traffic encrypted with TLS 1.3
   - No mixed content warnings or security issues
   - SEO benefits from HTTPS ranking boost

4. **Seamless Deployment**:
   - SST automatically configures CloudFront distribution
   - Deploy updates with `sst deploy` - CloudFront handles the rest
   - Zero downtime deployments with instant global propagation

5. **Supabase Integration**:
   - CloudFront serves the React app (frontend)
   - Supabase API calls go directly to Supabase servers (not through CloudFront)
   - WebSocket connections for real-time updates bypass CDN (as they should)

---

### **SST (Serverless Stack)**
**Description:** SST is a modern framework for building full-stack serverless applications on AWS. It provides infrastructure-as-code with an exceptional developer experience, making it simple to deploy React apps, APIs, databases, and more to AWS without dealing with complex CloudFormation or Terraform.

**How it works:**

SST is built on top of AWS CDK (Cloud Development Kit) but adds powerful abstractions and developer tools:

1. **Infrastructure as Code (IaC)**:
   - Define your AWS infrastructure using JavaScript/TypeScript
   - SST provides high-level constructs like `StaticSite`, `Api`, `Bucket`, `Function`
   - Compiles to AWS CloudFormation which provisions actual AWS resources

2. **Component Architecture**:
   ```typescript
   // Example SST config
   new StaticSite(stack, "ParkingApp", {
     path: "dist",
     buildCommand: "npm run build",
     customDomain: "parking.yourdomain.com",
     environment: {
       VITE_SUPABASE_URL: process.env.SUPABASE_URL,
     },
   })
   ```
   This single construct automatically creates:
   - S3 bucket for hosting files
   - CloudFront distribution with optimal settings
   - SSL certificate via AWS Certificate Manager
   - DNS records via Route53 (if using custom domain)
   - Proper permissions and access policies

3. **Live Lambda Development**:
   - For API functions, SST tunnels AWS Lambda requests to your local machine
   - Test with real AWS resources without deploying
   - Hot reload on code changes

4. **Resource Binding**:
   - Automatically injects environment variables
   - Type-safe access to AWS resources
   - No manual ARN or URL management

5. **Deployment Process**:
   ```
   sst deploy
       ↓
   Build React app (Vite)
       ↓
   Upload to S3 bucket
       ↓
   Invalidate CloudFront cache
       ↓
   App live globally in ~2 minutes
   ```

**Benefits:**

*Developer Experience:*
- **Simple Configuration**: One config file replaces hundreds of lines of CloudFormation/Terraform
- **TypeScript-First**: Type safety for infrastructure code prevents errors before deployment
- **Local Development**: Test with real AWS resources locally using `sst dev`
- **Fast Deployments**: Incremental deployments only update what changed (30 seconds vs 5+ minutes)
- **Instant Rollbacks**: Revert to previous version with one command

*AWS Best Practices Built-In:*
- **Automatic Optimization**: SST configures CloudFront, S3, and permissions optimally by default
- **Security by Default**: Principle of least privilege, encrypted storage, HTTPS enforcement
- **Cost Optimization**: Uses efficient resource configurations to minimize AWS bills
- **Production-Ready**: Follows AWS Well-Architected Framework principles

*Full-Stack Support:*
- **Frontend**: React, Vue, Svelte, Next.js - any static site or SSR framework
- **Backend**: AWS Lambda functions for APIs, scheduled tasks, event handlers
- **Database**: RDS, DynamoDB integration with easy access
- **Auth**: Cognito integration for user management
- **Storage**: S3 for file uploads and asset storage

*Multi-Environment Management:*
- **Separate Stages**: Easy dev, staging, production environments
- **Environment Variables**: Per-stage configuration without code changes
- **Resource Isolation**: Each environment gets separate AWS resources

*Observability:*
- **Built-in Dashboard**: Real-time logs and metrics at `sst console`
- **CloudWatch Integration**: Automatic logging and monitoring
- **Error Tracking**: Catch and debug issues in production

*Team Collaboration:*
- **Git-Based Workflow**: Infrastructure changes tracked in version control
- **Preview Environments**: Automatic deployments for pull requests
- **Shared State**: Team members deploy to same infrastructure safely

**In your project:**

SST handles the entire deployment and infrastructure management for your parking app:

1. **Build and Deploy Pipeline**:
   - Run `sst deploy --stage production`
   - SST runs Vite build process
   - Uploads optimized bundles to S3
   - Configures CloudFront with proper caching rules
   - Sets up custom domain with SSL
   - Entire process takes 1-2 minutes

2. **Infrastructure Configuration**:
   - `sst.config.ts` file defines your infrastructure as code
   - StaticSite construct handles all React app hosting needs
   - Environment variables (Supabase credentials) injected at build time
   - No manual AWS console clicking or configuration

3. **Multi-Stage Deployment**:
   - Development stage: `sst deploy --stage dev` (parking-dev.yourdomain.com)
   - Production stage: `sst deploy --stage prod` (parking.yourdomain.com)
   - Each stage has separate S3 buckets and CloudFront distributions
   - Test changes in dev before promoting to production

4. **Automatic SSL/HTTPS**:
   - SST requests SSL certificate from AWS Certificate Manager
   - Validates domain ownership automatically
   - Configures CloudFront to use certificate
   - HTTPS works immediately with no manual certificate management

5. **Continuous Deployment Integration**:
   - Add SST commands to GitHub Actions or GitLab CI
   - Automatic deployments on git push to main branch
   - Zero-downtime updates with CloudFront cache invalidation

6. **Cost Transparency**:
   - SST generates cost estimates before deployment
   - Track spending per environment
   - Typical costs for a parking app: $1-5/month (mostly CloudFront data transfer)

7. **Easy Updates**:
   - Make code changes in React app
   - Run `sst deploy`
   - CloudFront cache automatically invalidated
   - Users see updates within 1-2 minutes worldwide

**Deployment Architecture:**
```
Developer Machine
    ↓ sst deploy
SST Framework (Local)
    ↓ AWS CDK
AWS CloudFormation
    ↓ Provisions Resources
    ├── S3 Bucket (stores build files)
    ├── CloudFront Distribution (CDN)
    ├── Route53 (DNS)
    └── ACM Certificate (SSL)
    ↓
Global Users → CloudFront Edges → S3 Origin → React App
                                    ↓
                              Supabase API/Realtime
```

With SST and CloudFront, your parking app transforms from a local development project into a globally distributed, production-grade application with enterprise-level infrastructure - all managed through simple TypeScript configuration and single-command deployments.

---

### **React Context API**
**Description:** React's built-in state management solution for sharing data across component trees without prop drilling.

**How it works:** Creates a context object that holds shared state. Providers wrap components that need access to that state, and consumers can access it anywhere in the tree using hooks like `useContext`.

**Benefits:**
- Built into React, no additional dependencies
- Simplifies state management for medium-complexity apps
- Eliminates prop drilling through multiple component layers
- Clean separation of concerns

**In your project:** Two contexts manage your app state:
- `AuthContext` - Manages user authentication state with password-based login/signup (email + password + full name + optional phone)
- `ParkingDataContext` - Manages parking spots data and real-time updates from Supabase

---

### **ESLint 9.39.1**
**Description:** A pluggable JavaScript linting utility that identifies and fixes code quality issues.

**How it works:** Analyzes your code against configurable rules to find problematic patterns, style issues, and potential bugs. Supports custom rules and plugins for frameworks like React.

**Benefits:**
- Catches bugs and potential errors before runtime
- Enforces consistent code style across the team
- Integrates with editors for real-time feedback
- Auto-fix capabilities for many issues
- Customizable rules for your coding standards

**In your project:** Configured with React-specific plugins (`eslint-plugin-react-hooks`, `eslint-plugin-react-refresh`) to enforce best practices like proper hook usage and fast refresh compatibility.

---

### **JavaScript (ES Modules)**
**Description:** Modern JavaScript with ES6+ features and JSX syntax for React components.

**How it works:** Your project uses ES module syntax (`import`/`export`) and modern JavaScript features like arrow functions, destructuring, async/await, and template literals. JSX allows HTML-like syntax within JavaScript for defining React components.

**Benefits:**
- Simpler than TypeScript for smaller projects
- Native support for JSX with React
- Modern syntax improves code readability
- No compilation step needed in development with Vite

**In your project:** All components and logic are written in JavaScript with JSX extensions (.jsx files), making the codebase accessible and straightforward.

---

### **CSS (Vanilla CSS)**
**Description:** Standard cascading stylesheets for styling your application without any CSS framework.

**How it works:** CSS files are imported directly into components. Uses modern CSS features like CSS variables (`:root`), flexbox, and grid layouts.

**Benefits:**
- No learning curve for additional frameworks
- Full control over styling without framework constraints
- Lightweight with no extra dependencies
- CSS modules pattern keeps styles scoped to components

**In your project:** Uses vanilla CSS with component-specific stylesheets (e.g., `App.css`, `index.css`). Implements custom styling for parking spots, reservation modals, and UI components with clean, maintainable CSS.

---

### **Environment Variables (.env.local)**
**Description:** Configuration management using environment-specific variables.

**How it works:** Vite reads variables prefixed with `VITE_` from `.env.local` files and makes them available via `import.meta.env` in your code.

**Benefits:**
- Keeps sensitive credentials out of source code
- Easy configuration per environment (dev, staging, prod)
- Secure API key management

**In your project:** Stores Supabase credentials (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`) securely outside of version control.

---

## Stack Summary

Your parking app uses a **modern, lightweight stack** focused on real-time functionality:
- **Frontend:** React 19 with React Router for navigation
- **Backend:** Supabase for database and real-time updates(uses PostgreSQL under the hood)
- **Build Tool:** Vite for fast development and optimized builds
- **State Management:** React Context API
- **Styling:** Vanilla CSS for full control
- **Code Quality:** ESLint for maintaining standards

This stack is particularly well-suited for real-time applications where multiple users need to see live updates, like parking spot availability.

---

## Database Architecture & Relationships

Your parking app uses a relational database structure with four main tables that work together to manage users, parking spots, reservations, and payments. Understanding these relationships is crucial for working with the application.

### Database Schema Overview

```
┌─────────────────┐
│  auth.users     │ (Supabase managed)
│  (Auth system)  │
└────────┬────────┘
         │
         │ 1:1 (one-to-one)
         │ Each user has exactly one profile
         ▼
┌─────────────────┐
│   profiles      │
│─────────────────│
│ id (PK)         │◄──────────────────┐
│ email           │                   │
│ full_name       │                   │
└─────────────────┘                   │
                                      │
                                      │ Many:1
         ┌────────────────────────────┤ (many reservations → one user)
         │                            │
         │                            │
┌────────▼────────────┐         ┌─────┴──────────────┐
│   reservations      │         │  parking_spots     │
│─────────────────────│         │────────────────────│
│ id (PK)             │         │ id (PK)            │
│ user_id (FK) ───────┤         │ spot_id "a1-5"     │
│ parking_spot_id ────┼────────►│ status             │
│ spot_id "a1-5"      │ Many:1  │ current_user_id    │
│ duration_hours      │         │ current_reserv_id  │
│ total_amount        │         └────────────────────┘
│ status              │                   │
│ reserved_at         │                   │ 1:1 (optional)
│ expires_at          │                   │ One active reservation
└──────────┬──────────┘                   │ per spot (or NULL)
           │                              │
           │ 1:1 (one-to-one)             │
           │ Each reservation has         │
           │ exactly one payment          │
           ▼                              │
┌─────────────────────┐                  │
│     payments        │                  │
│─────────────────────│                  │
│ id (PK)             │                  │
│ reservation_id (FK) │                  │
│ user_id (FK) ───────┼──────────────────┘
│ amount              │
│ card_last4          │
│ expiration_date     │
│ transaction_id      │
└─────────────────────┘
(CVV validated in frontend, never stored)
```

---

### Table Relationships Explained

#### 1. **profiles ← reservations** (One-to-Many)

**Relationship:** One user can have MANY reservations

**Foreign Key:** `reservations.user_id` → `profiles.id`

**Real-world example:**
```
John Smith (user)
  ├── Reservation #1: A1-5, paid, 3 hours
  ├── Reservation #2: B2-10, checked_in, 5 hours
  └── Reservation #3: A2-15, completed, 2 hours (past)
```

**Cascade Behavior:**
```sql
user_id UUID REFERENCES profiles(id) ON DELETE CASCADE
```
- If a user is deleted, ALL their reservations are automatically deleted
- Prevents orphaned reservation records
- Maintains referential integrity

**Query Example:**
```sql
-- Get all reservations for a specific user
SELECT * FROM reservations
WHERE user_id = 'john-uuid';

-- Get user info with their reservations
SELECT
  p.full_name,
  r.spot_id,
  r.status,
  r.total_amount
FROM reservations r
JOIN profiles p ON r.user_id = p.id
WHERE r.status = 'checked_in';
```

---

#### 2. **parking_spots ← reservations** (One-to-Many)

**Relationship:** One parking spot can have MANY reservations (over time), but only ONE active at a time

**Foreign Key:** `reservations.parking_spot_id` → `parking_spots.id`

**Real-world example:**
```
Spot A1-5 (historical view)
  ├── Reservation #1: John, Jan 10, completed ✓
  ├── Reservation #2: Sarah, Jan 12, completed ✓
  ├── Reservation #3: Mike, Jan 15, checked_in ← ACTIVE NOW
  └── Reservation #4: Lisa, Feb 1, completed ✓
```

**SET NULL Behavior:**
```sql
parking_spot_id UUID REFERENCES parking_spots(id) ON DELETE SET NULL
```
- If a parking spot is deleted (rare), reservations are kept for historical records
- `parking_spot_id` becomes NULL, but `spot_id` text field preserves "a1-5"
- You still know which spot it was for reporting/history

**Why Store Both parking_spot_id and spot_id:**
```sql
parking_spot_id UUID     -- For active relationships (can become NULL if spot deleted)
spot_id TEXT             -- For historical record (never changes, always preserved)
```

**Query Examples:**
```sql
-- Get current active reservation for spot A1-5
SELECT * FROM reservations
WHERE spot_id = 'a1-5'
  AND status IN ('paid', 'checked_in');

-- Get all historical reservations for spot A1-5
SELECT * FROM reservations
WHERE spot_id = 'a1-5'
ORDER BY reserved_at DESC;
```

---

#### 3. **reservations → payments** (One-to-One)

**Relationship:** One reservation has exactly ONE payment

**Foreign Key:** `payments.reservation_id` → `reservations.id`

**Real-world example:**
```
Reservation #123 (Spot A1-5, $15, 3 hours)
  └── Payment #456 ($15, card •••• 9010, exp: 12/26, TXN_ABC123, completed)
```

**CASCADE Behavior:**
```sql
reservation_id UUID REFERENCES reservations(id) ON DELETE CASCADE
```
- If a reservation is deleted, its payment is also deleted
- Payment cannot exist without a reservation

**Query Example:**
```sql
-- Get reservation with payment details
SELECT
  r.spot_id,
  r.total_amount,
  r.status as reservation_status,
  p.card_last4,
  p.expiration_date,
  p.transaction_id,
  p.processed_at
FROM reservations r
LEFT JOIN payments p ON p.reservation_id = r.id
WHERE r.id = 'reservation-uuid';
```

**Note:** Use LEFT JOIN because:
- Reservation exists in `pending` status before payment
- After payment is completed, payment record exists
- 1:1 relationship means maximum one payment per reservation

**Payment Security & Simplified Fields:**

The payments table stores only essential fields from the user's payment form:

```
User Payment Form (Frontend):
├── Card Number: "4532 1234 5678 9010"  → Stored: card_last4 = "9010" (last 4 digits only)
├── Expiration Date: "12/26"            → Stored: expiration_date = "12/26" (safe to store)
└── CVV: "123"                          → NOT STORED (validated in frontend only)
```

**Security Best Practices:**
- ✅ **Full card number never stored** - Only last 4 digits for display purposes
- ✅ **CVV never stored** - Validated client-side only (PCI compliance)
- ✅ **Expiration date stored** - Safe to store (visible on physical card)
- ✅ **Mock payment system** - Not processing real transactions
- ✅ **Private by default** - RLS ensures users only see their own payments

Even though this is a mock payment system, following real-world security patterns is crucial for good development practices and prepares the codebase for potential real payment integration in the future.

---

#### 4. **parking_spots.current_reservation_id** (Reverse Reference)

**Relationship:** One parking spot points to its current active reservation (if any)

**Type:** Optional reference field (not a formal foreign key)

**Real-world example:**
```
Spot A1-5
  ├── status: 'occupied'
  ├── current_user_id: 'john-uuid'
  └── current_reservation_id: 'reservation-123-uuid'
```

**Why This Is Useful:**
```sql
-- Get spot with current reservation details in ONE efficient query
SELECT
  ps.spot_id,
  ps.status,
  ps.current_user_id,
  r.user_email,
  r.checked_in_at,
  r.expires_at
FROM parking_spots ps
LEFT JOIN reservations r ON ps.current_reservation_id = r.id
WHERE ps.spot_id = 'a1-5';
```

**Result:**
```
spot_id | status   | user_email        | checked_in_at       | expires_at
--------|----------|-------------------|---------------------|-------------
a1-5    | occupied | john@email.com    | 2026-02-13 10:00    | 2026-02-13 13:00
```

---

### Complete Reservation Flow Example

Let's walk through a complete reservation lifecycle showing how all tables interact:

#### Initial State: Spot is Available

```sql
-- parking_spots table
spot_id | status    | current_user_id | current_reservation_id
--------|-----------|-----------------|------------------------
a1-5    | available | NULL            | NULL

-- reservations table: (empty)
-- payments table: (empty)
```

---

#### Step 1: User Clicks Spot (Reserving Status - Temporary Lock)

**Actions:**
1. Update parking_spot to 'reserving' with 3-minute expiry
2. User has 3 minutes to complete payment

```sql
-- Update parking spot to "reserving" (temporary lock)
UPDATE parking_spots
SET
  status = 'reserving',
  current_user_id = 'john-uuid',
  reserving_expires_at = NOW() + INTERVAL '3 minutes'
WHERE spot_id = 'a1-5' AND status = 'available';

-- If another user clicks at the same time, their UPDATE fails
-- (WHERE status = 'available' returns 0 rows if already 'reserving')
```

**Result:**
```sql
-- parking_spots table
spot_id | status     | current_user_id | reserving_expires_at
--------|------------|-----------------|----------------------
a1-5    | reserving  | john-uuid       | 2026-02-13 10:03:00
```

**Real-time Update:** All users see spot A1-5 turn orange/yellow (locked, reserving)

**Auto-Cleanup:** If user doesn't complete payment within 3 minutes, a cleanup function automatically frees the spot:
```sql
-- Runs every 30 seconds from frontend or via pg_cron
UPDATE parking_spots
SET status = 'available', current_user_id = NULL, reserving_expires_at = NULL
WHERE status = 'reserving' AND reserving_expires_at < NOW();
```

---

#### Step 2: User Enters Payment Info & Submits (Creates Reservation)

**Actions:**
1. Create reservation with status 'pending'
2. Calculate total amount

```sql
-- Create reservation (during payment process)
INSERT INTO reservations (
  user_id, parking_spot_id, spot_id, spot_number,
  duration_hours, hourly_rate, total_amount,
  expires_at, user_email, status
) VALUES (
  'john-uuid', 'spot-a1-5-uuid', 'a1-5', 5,
  3, 5.00, 15.00,
  NOW() + INTERVAL '3 hours',
  'john@email.com', 'pending'
);

-- Update parking spot with reservation ID (still "reserving")
UPDATE parking_spots
SET current_reservation_id = 'new-reservation-uuid'
WHERE id = 'spot-a1-5-uuid';
```

**Result:**
```sql
-- parking_spots table (still "reserving" - waiting for payment)
spot_id | status     | current_user_id | current_reservation_id | reserving_expires_at
--------|------------|-----------------|------------------------|----------------------
a1-5    | reserving  | john-uuid       | res-123-uuid           | 2026-02-13 10:03:00

-- reservations table
id      | user_id   | spot_id | status  | total_amount | payment_completed_at
--------|-----------|---------|---------|--------------|---------------------
res-123 | john-uuid | a1-5    | pending | 15.00        | NULL
```

**Real-time Update:** Spot stays orange/yellow (reserving, locked for this user)

---

#### Step 3: User Completes Payment

**Actions:**
1. Create payment record
2. Update reservation status to 'paid'

```sql
-- Create payment (user entered: card number "4532 1234 5678 9010", expiration "12/26", CVV "123")
INSERT INTO payments (
  reservation_id, user_id, amount,
  card_last4, expiration_date,
  status, transaction_id
) VALUES (
  'res-123-uuid', 'john-uuid', 15.00,
  '9010', '12/26',  -- Only last 4 digits stored, CVV never stored
  'completed', 'TXN_ABC123XYZ'
);

-- Update reservation to "paid"
UPDATE reservations
SET
  status = 'paid',
  payment_completed_at = NOW()
WHERE id = 'res-123-uuid';

-- Update parking spot from "reserving" to "reserved"
UPDATE parking_spots
SET
  status = 'reserved',
  reserving_expires_at = NULL  -- Clear expiry time
WHERE id = 'spot-a1-5-uuid';
```

**Result:**
```sql
-- parking_spots table (now "reserved" - payment completed)
spot_id | status   | current_user_id | current_reservation_id | reserving_expires_at
--------|----------|-----------------|------------------------|----------------------
a1-5    | reserved | john-uuid       | res-123-uuid           | NULL

-- reservations table
id      | status | payment_completed_at
--------|--------|----------------------
res-123 | paid   | 2026-02-13 10:00:00

-- payments table
id      | reservation_id | amount | card_last4 | expiration_date | transaction_id | status
--------|----------------|--------|------------|-----------------|----------------|----------
pay-456 | res-123        | 15.00  | 9010       | 12/26           | TXN_ABC123XYZ  | completed
```

**Real-time Update:**
- Payment confirmation modal appears
- Spot A1-5 turns darker gray (reserved, confirmed)
- All users see the spot is now firmly reserved (not just temporarily locked)

---

#### Step 4: User Clicks "Check In"

**Actions:**
1. Update reservation to 'checked_in'
2. Update parking_spots to 'occupied'

```sql
-- Update reservation
UPDATE reservations
SET
  status = 'checked_in',
  checked_in_at = NOW()
WHERE id = 'res-123-uuid';

-- Update parking spot
UPDATE parking_spots
SET status = 'occupied'
WHERE id = 'spot-a1-5-uuid';
```

**Result:**
```sql
-- parking_spots table
spot_id | status   | current_user_id | current_reservation_id
--------|----------|-----------------|------------------------
a1-5    | occupied | john-uuid       | res-123-uuid

-- reservations table
id      | status      | checked_in_at
--------|-------------|------------------
res-123 | checked_in  | 2026-02-13 10:15
```

**Real-time Update:** All users see driving animation, then car parked in A1-5

---

#### Step 5: Time Expires (Reservation Duration Complete)

**Actions:**
1. Mark reservation as 'completed'
2. Free up parking spot

```sql
-- Complete reservation
UPDATE reservations
SET
  status = 'completed',
  completed_at = NOW()
WHERE id = 'res-123-uuid'
  AND expires_at < NOW();

-- Free parking spot
UPDATE parking_spots
SET
  status = 'available',
  current_user_id = NULL,
  current_reservation_id = NULL
WHERE id = 'spot-a1-5-uuid';
```

**Result:**
```sql
-- parking_spots table (back to initial state)
spot_id | status    | current_user_id | current_reservation_id
--------|-----------|-----------------|------------------------
a1-5    | available | NULL            | NULL

-- reservations table (keeps historical record)
id      | status    | completed_at
--------|-----------|------------------
res-123 | completed | 2026-02-13 13:15
```

**Real-time Update:** Spot A1-5 turns green (available) for all users

---

### Parking Spot Status Lifecycle

The parking spot status progresses through these stages:

```
available → reserving → reserved → occupied → available
    ↑          ↓           ↓          ↓
    ↑      (cancel)    (payment)  (check-in)
    ↑          ↓
    └──────────┘
    (3-min timeout)
```

**Status Definitions:**

| Status | Meaning | Duration | Next Action |
|--------|---------|----------|-------------|
| `available` | Spot is free | Indefinite | User can click to reserve |
| `reserving` | User clicked, has 3 min to pay | Max 3 minutes | Complete payment → `reserved`<br>Cancel → `available`<br>Timeout → `available` |
| `reserved` | Payment completed, can check in | Until check-in | Check in → `occupied` |
| `occupied` | User checked in, car parked | Until reservation expires | Time expires → `available` |
| `maintenance` | Spot temporarily unavailable | Manual | Admin action → `available` |

**Key Features:**

- **3-Minute Lock**: The `reserving` status prevents double-booking while giving users time to complete payment
- **Auto-Cleanup**: Background function (`free_expired_reserving_spots()`) runs every 30 seconds to free abandoned spots
- **Race Condition Protection**: Database constraint `WHERE status = 'available'` ensures only one user can claim a spot
- **Real-time Updates**: Every status change broadcasts instantly to all connected users

**Timeout Mechanism:**

```sql
-- When user clicks spot
UPDATE parking_spots
SET status = 'reserving', reserving_expires_at = NOW() + INTERVAL '3 minutes'
WHERE spot_id = 'a1-5' AND status = 'available';

-- Automatic cleanup (runs every 30 seconds)
UPDATE parking_spots
SET status = 'available', current_user_id = NULL, reserving_expires_at = NULL
WHERE status = 'reserving' AND reserving_expires_at < NOW();
```

---

### Relationship Summary Table

| From Table | To Table | Type | Cardinality | Delete Behavior | Purpose |
|------------|----------|------|-------------|----------------|---------|
| `reservations.user_id` | `profiles.id` | Many-to-One | Many reservations → 1 user | CASCADE | Link reservations to users |
| `reservations.parking_spot_id` | `parking_spots.id` | Many-to-One | Many reservations → 1 spot | SET NULL | Link reservations to spots (preserve history) |
| `payments.reservation_id` | `reservations.id` | One-to-One | 1 payment → 1 reservation | CASCADE | Link payment to reservation |
| `payments.user_id` | `profiles.id` | Many-to-One | Many payments → 1 user | CASCADE | Track user's payment history |
| `parking_spots.current_user_id` | `profiles.id` | Optional One-to-One | 1 spot → 0 or 1 user | SET NULL | Quick lookup of current occupant |
| `parking_spots.current_reservation_id` | `reservations.id` | Optional One-to-One | 1 spot → 0 or 1 active reservation | Manual | Quick lookup of active reservation |

---

### Data Denormalization Strategy

You'll notice the reservations table stores copies of data from other tables:

```sql
-- reservations table duplicates data for historical accuracy
spot_id TEXT          -- Copy from parking_spots.spot_id
spot_number INTEGER   -- Copy from parking_spots.spot_number
section_name TEXT     -- Copy from parking_spots.section_name
zone_name TEXT        -- Copy from parking_spots.zone_name
hourly_rate DECIMAL   -- Copy from parking_spots.hourly_rate (at time of reservation)
user_email TEXT       -- Copy from profiles.email
user_name TEXT        -- Copy from profiles.full_name
```

**Why Duplicate This Data?**

1. **Historical Accuracy**: If the hourly rate changes from $5 to $6 tomorrow, old reservations should still show they paid $5
2. **Data Preservation**: If spot A1-5 is deleted or renumbered, historical records still show "A1-5, Zone A"
3. **Query Performance**: No need to JOIN 3 tables just to display "John reserved A1-5 for $15"
4. **Audit Trail**: Complete snapshot of the reservation at the time it was made
5. **Reporting**: Generate historical reports without depending on current state

**Trade-off:** More storage space, but significantly better query performance and data integrity for historical records.

---

### Real-Time Updates Flow

When any table is updated, here's how real-time updates propagate to all users:

```
User A takes action (reserve, check in, etc.)
       ↓
  Database Update (PostgreSQL)
       ↓
  Supabase Realtime Detects Change
       ↓
  WebSocket Broadcast to All Subscribed Clients
       ↓
  All Connected Users' Browsers Receive Update
       ↓
  React Components Update State
       ↓
  UI Re-renders (spot color changes, animations play)
```

**What Gets Broadcast:**
- `parking_spots` changes → All users see availability updates
- `reservations` with status 'paid' or 'checked_in' → All users see active reservations
- Profile updates → Users see updated information

**What's Private:**
- `reservations` with status 'pending' → Only the user who created it
- Payment details → Only the user who made the payment
- Personal profile information (depends on RLS policies)

This architecture ensures every user has a real-time, consistent view of parking availability while maintaining appropriate privacy boundaries.

---

## Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- Supabase account

### Installation

1. Clone the repository
```bash
git clone <repository-url>
cd parking-app-platform-web
```

2. Install dependencies
```bash
npm install
```

3. Set up environment variables
Create a `.env.local` file in the root directory:
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. Set up Supabase database
Follow the instructions in [SUPABASE_SETUP.md](./SUPABASE_SETUP.md)

5. Start the development server
```bash
npm run dev
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Features

- Real-time parking spot availability
- Email-based user authentication
- Reservation management
- Check-in functionality
- Multi-zone parking support
- Dynamic pricing tiers
- Cancel reservations
- Synchronized updates across all clients

## Project Structure

```
src/
├── components/      # Reusable UI components
├── contexts/        # React Context providers
├── data/           # Static data and configurations
├── lib/            # External library configurations (Supabase)
├── pages/          # Page components
├── App.jsx         # Main app component with routing
└── main.jsx        # Application entry point
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is private and proprietary.
