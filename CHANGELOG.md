# Changelog

## 2026-01-31

FIX: Breadcrumb shows translated labels and only links to valid pages
REFACTOR: Clean up circuit-simulator feature - remove orphan file, rename components for clarity
FIX: Circuit diagram now uses actual circuit topology instead of naming conventions
FEATURE: Interactive circuit diagram visualization with React Flow
FEATURE: Toggle between list view and graphical schematic view in simulation
FEATURE: Clickable breakers/differentials on diagram to toggle states
FEATURE: Animated power flow visualization with color-coded paths
FEATURE: MiniMap navigation and zoom controls for large circuits

## 2026-01-30

FEATURE: AI-powered PDF parsing with Claude Haiku - universal format support (disabled by default)
FEATURE: Component validation interface - review, edit, add/remove components before import
FEATURE: Confidence score display for AI parsing quality feedback
FEATURE: Feature flag `enableAIParsing` in site-config to toggle AI parsing
REFACTOR: New import flow with 3 steps (upload → AI validation → import) when AI enabled
CHORE: Remove organization users page (unused)

## 2026-01-29

FIX: Dashboard "Importer un schéma" button now redirects to circuits import page
FEATURE: Global circuit import - schemas can now be created without a client
FEATURE: Circuits list page at /orgs/[orgSlug]/circuits with all schemas
FEATURE: Client assignment - assign or change client from simulation page
FEATURE: Import button in sidebar header for quick access
REFACTOR: Make clientId optional on Circuit model (database migration)
REFACTOR: Add "Schémas" link in sidebar navigation menu
REFACTOR: New organization dashboard with stats cards, recent clients, recent circuits, and quick actions

## 2026-01-26

REFACTOR: Complete UX overhaul with new electric blue theme inspired by Stripe/Linear
REFACTOR: Redesign client list with dashboard stats cards and modern card design
REFACTOR: Redesign client detail page with avatar, contact badges, and metrics row
REFACTOR: Redesign circuit cards with icons, version badges, and improved hover states
REFACTOR: Redesign PDF upload with cleaner drag-drop zone and loading states
REFACTOR: Redesign PDF preview with step indicator, inline name editing, and tree view
REFACTOR: Redesign simulation panel with grid toggle cards, larger stats, and cleaner results list
REFACTOR: Add semantic circuit colors (powered/unpowered) for consistent status visualization
REFACTOR: Update border radius to 0.5rem for more modern rounded corners
REFACTOR: Improve empty states with larger icons and clearer CTAs
FIX: Make simulation header sticky with blur effect when scrolling

## 2026-01-25

FEATURE: Circuit versioning system - re-import plans with automatic version detection and classification
FEATURE: Fingerprint-based detection of similar plans during import
FEATURE: Version selector during import to create new version or new plan
FEATURE: Version dropdown switcher in simulation page header
REFACTOR: Circuit list now groups versions, showing only latest with "X versions" badge
REFACTOR: Circuit list cards are now fully clickable with cleaner compact design
REFACTOR: Client detail page with compact inline contact info and correct schema count
FEATURE: Animated circuit SVG for empty state (progressive lighting effect)
REFACTOR: Complete UX redesign of simulation panel with compact toggle pills, expandable receptor details, and cleaner single-column layout

## 2026-01-24

FEATURE: New modern simulation UI with 2-column layout, donut chart, and colored status cards
REFACTOR: Remove analytics system (will be replaced by real-time simulation charts)
REFACTOR: Simplify dashboard to show clients list
REFACTOR: Circuit detail page now redirects to simulate page
REFACTOR: Move circuit pages under /clients/[clientId]/circuits/[circuitId] for better URL hierarchy
FIX: Sidebar navigation no longer highlights Dashboard on non-nav pages
FIX: Make client cards fully clickable to access client detail page
FEATURE: Add Client management for organizing circuits by customer
FEATURE: Client CRUD with name, email, phone, address, and notes
FEATURE: Circuits now belong to clients (Organization → Client → Circuit)
FEATURE: Navigation restructured: Clients page with nested circuits
REFACTOR: Remove manual circuit creation flow (keep PDF import only)
REFACTOR: Rename project from NormCheck to ElecFlow
FIX: Simulation bug where paths could go through neutral node
FIX: Ignore cartouche metadata when parsing Formelec PDF
CHORE: Clean up verbose comments in circuit simulator engine
FEATURE: Add technical documentation for circuit simulator

## 2026-01-23

FEATURE: Add PDF import for Formelec electrical schematics
FEATURE: PDF parser with text extraction and Formelec format parsing
FEATURE: Automatic circuit building from parsed components (IG, differentials, final circuits)
FEATURE: Preview UI showing detected components before import
FEATURE: Add Circuit Simulator for electrical circuit logic verification
FEATURE: Circuit CRUD with nodes, links, and control states management
FEATURE: BFS-based simulation engine to verify current flow paths
FEATURE: Simulation UI with toggle controls and powered/unpowered status display

## 2026-01-19

FEATURE: Add x-org-slug header support for /api/orgs/* routes in middleware

## 2026-01-18

CHORE: Add Prisma security and performance rules (orgId filtering, select over include, codebase patterns)
FEATURE: Add domain question to init-project workflow for Resend email configuration (with/without domain support)

## 2026-01-13

CHORE: Remove 14 unused files including admin components, docs components, and utility files
CHORE: Remove 5 unused dependencies (@ai-sdk/openai, ai, @types/react-syntax-highlighter, radix-ui, ts-node) saving ~3MB
REFACTOR: Remove duplicated FileMetadata type from avatar-upload.tsx, import from use-file-upload.ts instead
REFACTOR: Replace session-based organization context with URL slug-based routing using middleware headers for multi-tab support
FIX: Update hasPermission to pass explicit organizationId for Better Auth compatibility
REFACTOR: Move legal and docs links from floating footer to minimal sidebar navigation above Settings button with text-xs

## 2026-01-02

REFACTOR: Add cacheLife("max") to docs, changelog, and posts pages for 30-day cache instead of 15-minute default
REFACTOR: Improve mobile nav user button to show avatar + name/email with dropdown instead of just avatar
FEATURE: Add responsive mobile navigation for documentation with sticky header and sheet sidebar
FIX: Fix documentation page horizontal overflow when description text is too long
FEATURE: Add /add-documentation slash command for creating and updating docs in content/docs/
REFACTOR: Add useDebugPanelAction and useDebugPanelInfo hooks for cleaner debug panel registration with automatic cleanup
FIX: Improve changelog dialog responsiveness on mobile with smaller padding and text sizes

## 2025-12-28

REFACTOR: Replace admin back button with breadcrumb navigation (matching org page style)

## 2025-12-27

REFACTOR: Merge billing info into single card with next payment date, amount, and payment method
FEATURE: Add "Create customer" button to auto-create Stripe customer for organizations
FEATURE: Add inline title editing with org avatar on admin organization detail page
FEATURE: Add coupon code support for admin subscription management (enables 100% off plans without payment method)
REFACTOR: Admin user organizations list uses badges for role and plan instead of text with dots
REFACTOR: Admin user organizations list uses proper ItemGroup pattern with separators and unified border
REFACTOR: Modernize admin subscription UI with plan cards, monthly/yearly toggle, and status indicators
REFACTOR: Feedback detail page uses Item component instead of Card for consistent styling
REFACTOR: Post detail page now matches changelog detail style - max-w-2xl layout, aspect-video image, badges with icons, prose content
REFACTOR: Simplify admin charts with Stripe-style design - hero numbers, no grid, cleaner layout
REFACTOR: Use dot style badges for status indicators in admin user sessions and providers tables
FEATURE: Add MRR growth and user growth charts to admin dashboard with Stripe data
REFACTOR: Remove 15 PostCard variants, keep single clean compact design
REFACTOR: Consolidate image upload components into unified ImageDropzone with avatar/square variants
REFACTOR: Unify sidebar trigger button style across all navigation components
REFACTOR: Add size="lg" to all admin dashboard pages for consistent layout width
CHORE: Add v2.1.0 changelog entry and update image paths
REFACTOR: Changelog timeline with vertical line on left, date labels, and compact cards
FEATURE: Add active state highlighting to content header navigation
FIX: Remove pulsing animation from changelog timeline first item
REFACTOR: Modernize changelog UI with docs-style header, footer, and blog post layout
REFACTOR: Changelog detail page now uses aspect-video image, cleaner badges, and prose styling
REFACTOR: Changelog list page uses card-based layout with hover effects and latest badge

## 2025-12-26

FEATURE: Changelog page timeline view with vertical timeline, version badges, and hover effects
CHORE: Add unit tests for changelog-manager and changelog actions
CHORE: Add E2E tests for changelog dialog flow
FIX: InterceptDialog uses router.refresh() after router.back() to reset parallel route slot state
FIX: InterceptDialog only calls router.back() when closing, not on every state change
FEATURE: Add "Reset Changelog" debug action to restore dismissed changelogs
FEATURE: Debug Panel with draggable/resizable UI, session info, and dynamic action buttons (dev only)
FEATURE: Public changelog system with CardStack animation and timeline UI
FEATURE: Changelog CardStack widget in organization sidebar
FEATURE: Intercepting routes for changelog dialog from any page
FEATURE: Claude Code slash command for creating changelog entries
FEATURE: Add reply button with textarea dialog on feedback detail page
FEATURE: Clickable user Item on feedback detail page navigates to user profile
REFACTOR: Replace feedback table with Item components for cleaner UI

## 2025-12-15

FIX: Remove insecure trusted origins wildcard configuration in auth
FIX: Use hard redirects for impersonation to update profile button immediately
FIX: Breadcrumb path selection slice issue
FIX: Typo in prisma:generate script
FIX: ESLint and TypeScript errors across codebase
FIX: Vitest config ESM conversion
FIX: generateStaticParams for posts in production (Next.js 16 compatibility)

FEATURE: Major performance improvements with refactored application architecture
FEATURE: TanStack Form migration replacing React Hook Form across all forms
FEATURE: Redis caching for improved performance
FEATURE: OTP-based password reset flow
FEATURE: Complete OTP sign-in flow implementation
FEATURE: Responsive provider buttons (full width when single provider)
FEATURE: Global PageProps type for standardized page component typing

REFACTOR: Middleware utilities extraction with admin route protection

CHORE: Update Better-Auth to version 1.3.27
CHORE: Update VSCode snippets and workflow configuration
CHORE: Add environment variables guide
CHORE: Improve type safety in chart and tooltip components
CHORE: Remove unused shadcn-prose dependency

## 2025-08-23

FEATURE: GridBackground component for customizable visual design
FEATURE: Admin feedback system with filters, tables, and detailed views
FEATURE: Documentation system with dynamic content and sidebar navigation
FEATURE: Last used provider tracking for enhanced sign-in experience
FEATURE: Contact and about pages

CHORE: Update Next.js to 15.5.0
CHORE: Update React to 19.1.1
CHORE: Update AI SDK to v5
CHORE: Update all Radix UI component packages
CHORE: Update testing dependencies and build tools
CHORE: Claude Code integration with new agents, commands, and formatting hooks
CHORE: Improve API file organization and documentation structure

## 2025-08-13

FEATURE: Complete admin dashboard with sidebar layout and routing
FEATURE: Admin-only authentication guards with role checking
FEATURE: User management interface with search, pagination, and role filtering
FEATURE: User detail pages with session management and impersonation
FEATURE: Organization management interface with member management
FEATURE: Subscription management with plan changes and billing controls
FEATURE: Payment history with Stripe integration for admin oversight
FEATURE: AutomaticPagination reusable component

REFACTOR: Move billing ownership from User to Organization level
REFACTOR: Migrate stripeCustomerId from User model to Organization model
REFACTOR: Update webhook handlers for organization-based billing
REFACTOR: Replace Better-Auth subscription methods with custom server actions
REFACTOR: Billing page with Card components and Typography

FIX: Remove all `any` type usage in Stripe webhook handlers
FIX: Type compatibility issues across billing system
FIX: Card hover effects replaced with clean styling
FIX: Organization/user names now clickable instead of separate View buttons

## 2025-07-14

FEATURE: Playwright workflow migrated to local CI testing with PostgreSQL service
FEATURE: Comprehensive logging throughout all E2E tests

REFACTOR: Migrate Prisma configuration from package.json to prisma.config.ts
REFACTOR: Rename RESEND_EMAIL_FROM to EMAIL_FROM

FIX: Delete account test case sensitivity issue
FIX: Button state validation and error handling in tests
FIX: External API dependency error catching for build
FIX: DATABASE_URL_UNPOOLED configuration for Prisma
FIX: OAuth secrets renamed (GITHUB to OAUTH_GITHUB)

CHORE: Add all required GitHub secrets for CI testing
CHORE: Enhance Playwright reporter configuration for CI visibility

## 2025-06-01

FEATURE: Orgs-list page to view organization list
FEATURE: Adapter system for email and image upload

FIX: API Error "No active organization"

CHORE: Upgrade libraries to latest versions

## 2025-05-03

FEATURE: NOW.TS deployed app tracker
FEATURE: Functional database seed

## 2025-04-17

FEATURE: Resend contact support

REFACTOR: Prisma with output directory
REFACTOR: Replace redirect method
REFACTOR: Update getOrg logic to avoid bugs

FIX: Navigation styles
FIX: Hydration error

CHORE: Upgrade to Next.js 15.3.0

## 2025-04-06

FEATURE: Better-Auth organization plugin
FEATURE: Better-Auth Stripe plugin
FEATURE: Better-Auth permissions
FEATURE: Middleware authentication handling

REFACTOR: Replace AuthJS with Better-Auth
REFACTOR: Upgrade to Tailwind V4
REFACTOR: Layout and pages upgrade

## 2024-09-12

FEATURE: NEXT_PUBLIC_EMAIL_CONTACT env variable
FEATURE: RESEND_EMAIL_FROM env variable

## 2024-09-08

FEATURE: Add slug to organizations
REFACTOR: Update URL with slug instead of id

## 2024-09-01

FEATURE: NOW.TS version 2 with organizations
