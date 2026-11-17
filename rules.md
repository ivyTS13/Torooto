# Torooto Engineering & Design Rules

Permanent architectural, performance, and design guardrails for the **Torooto** Tarot application (`dotNetBackend/TorootoASP.sln` + `frontend/`), derived from our active project skills: `/clean-architecture`, `/csharp-pro`, `/frontend-developer`, `/web-design-guidelines`, `/frontend-design`, and `/design-taste-frontend`.

---

## 1. C# Clean Architecture & .NET 8 Guardrails (`/clean-architecture` & `/csharp-pro`)

### 1.1 Solution Layers & Strict Dependency Direction
All project dependencies in `dotNetBackend/TorootoASP.sln` MUST point inward:

1. **`TorootoAPI.Domain` (Core Domain Layer)**
   - **References:** Zero NuGet packages and zero project references (pure C# and .NET 8 primitives only).
   - **Contents:** Entities (`Card`, `Deck`, `Pile`, `PileContent`, `User`), Value Objects, Enums, Domain Exceptions, Domain Events, and core Tarot invariants (e.g., deck-type boundaries, pile card uniqueness/position ordering, reversal state).
   - **Rules:**
     - Encapsulate state transitions via factory methods and domain behavior methods rather than exposing anemic public property setters everywhere.
     - Strictly forbid EF Core persistence attributes (`[Table]`, `[Column]`, `[Key]`, `[ForeignKey]`, `[InverseProperty]`) and `System.Text.Json` attributes inside Domain models. All schema/table/column/JSONB mappings belong in `IEntityTypeConfiguration<T>` classes in Infrastructure.
     - Never place HTTP/API response envelopes (e.g., `Response.cs`) inside Domain.

2. **`TorootoAPI.Application` (Use Cases & Contracts Layer)**
   - **References:** `TorootoAPI.Domain` ONLY (plus framework-agnostic abstraction/validation/mapping libraries such as `FluentValidation` and `Mapster`).
   - **Contents:** Single-purpose Use Case Commands/Queries & Handlers (or cohesive Application Services), Request/Response DTOs, `FluentValidation` Validators, Mapping profiles (`IRegister`), and port interfaces (`ICacheService`, `IImageStorageService`, `ITokenService`, `IPasswordHasher`, `ICsvCardParser`, `ICardRepository`, `IDeckRepository`, `IPileRepository`, `IUserRepository` or `ITorootoDbContext`).
   - **Rules:**
     - Strictly forbid `DbContext`, `Microsoft.EntityFrameworkCore`, `Microsoft.AspNetCore.Http` (`HttpContext`, `IFormFile`), `IActionResult`, or Infrastructure SDKs (Npgsql, StackExchange.Redis, ImageKit, Argon2) in `TorootoAPI.Application`.
     - Represent file uploads via framework-agnostic abstractions (`Stream`, `FileName`, `ContentType`, `Length` record/DTO) rather than `IFormFile`.
     - Keep Mapster `IRegister` mappings single-source-of-truth—never define conflicting duplicate registrations across multiple mapping files, and never map raw plaintext passwords into `HashedPassword`.
     - Validate all incoming Command/Request DTOs with `FluentValidation` before domain execution or persistence.

3. **`TorootoAPI.Infrastucture` (Infrastructure & Persistence Plugin Layer)**
   *(Note: Preserve existing project path `TorootoAPI.Infrastucture` unless explicitly renamed across `.sln`, `.csproj`, and `Dockerfile` in a dedicated migration.)*
   - **References:** `TorootoAPI.Application` and `TorootoAPI.Domain`.
   - **Contents:** `TorootoDBContext`, Fluent API `IEntityTypeConfiguration<T>` classes, EF Core migrations, Repository implementations (`CardRepository`, `DeckRepository`, `PileRepository`, `UserRepository`), `RedisCacheService`, static/long-lived Tarot deck metadata caching, `ImageKitStorageService`, Argon2 password hashing, JWT token generation, and CSV parsing.
   - **Rules:**
     - **Read-Only Queries:** Enforce `.AsNoTracking()` on every read-only EF Core query (`GetAllDecksAsync`, `GetCardsByDeckIdAsync`, `GetAllTarotCardsAsync`, `GetUserPilesPagedAsync`, `GetPileByIdAsync`, `GetAvailableTarotCardsAsync`, lookup queries).
     - **Prevent N+1 & Cartesian Explosions:** Avoid sequential lookup queries when a single joined/filtered query suffices; use `.AsSplitQuery()` on multi-collection `.Include()`/`.ThenInclude()` queries; use `ExecuteUpdateAsync` for bulk soft-delete/restore cascades; apply global soft-delete query filters (`HasQueryFilter(e => e.IsDeleted != true)`) consistently.
     - **Execution Strategy & Transactions:** Because Npgsql is configured with `EnableRetryOnFailure()`, any explicit `BeginTransactionAsync()` MUST be wrapped in `_context.Database.CreateExecutionStrategy().ExecuteAsync(...)`.
     - **Primary Keys:** Since `ValueGeneratedNever()` is configured on `CardId`, `DeckId`, `PileId`, and `PileContentId`, every creation path (single and bulk) MUST explicitly generate non-empty `Guid` identifiers (`Guid.NewGuid()`).
     - **Non-Blocking DI & Redis Safety:** Never call synchronous blocking network I/O (e.g., `ConnectionMultiplexer.Connect(...)` without `AbortOnConnectFail = false`) during DI container resolution. Forward `folder` and `tags` to ImageKit uploads, batch Redis pattern deletions, and never swallow `OperationCanceledException`.
     - **Separation from HTTP Pipeline:** Keep ASP.NET Core HTTP pipeline concerns (`AddCors`, `AddRateLimiter`) in `TorootoASP` rather than Infrastructure.

4. **`TorootoASP` (Presentation / API Layer)**
   - **References:** `TorootoAPI.Application` and `TorootoAPI.Infrastucture` (for composition root DI wiring only).
   - **Contents:** `Program.cs`, thin Controllers (`AuthController`, `CardsController`, `DecksController`, `PilesController`, `UsersController`), middleware/exception handling (`ProblemDetails`), CORS, Rate Limiting, Swagger/OpenAPI.
   - **Rules:**
     - Controllers MUST stay thin: bind/validate Request DTOs, extract authenticated user claims safely, invoke Application interfaces/use cases, and return standardized Response DTOs (`ApiResponse<T>` / `ProblemDetails`).
     - Never inject `TorootoDBContext` or concrete Infrastructure classes into Controllers.
     - Never house Tarot shuffle algorithms, CSV parsing, JWT generation, or entity graph construction inside Controllers.
     - Never expose raw `Domain` entities (`Card`, `Deck`, `Pile`, `User`) in HTTP responses or store raw `Domain` entities in Redis cache.
     - Enforce ownership checks (`userId`) on every user-scoped read, update, and delete operation (`GetPile`, `DeletePile`, `UpdateUserImage`) to prevent IDOR vulnerabilities.
     - Never leak `ex.Message` or `ex.InnerException` in `500` responses; return standard HTTP status codes (`400` on validation errors, `404` on missing resources, never `200 OK` with `success: false`).

### 1.2 Async Discipline, Nullable Safety & API Contracts
- **CancellationToken Propagation:** Every async Controller action, Application interface/handler, Repository method, EF Core query/command (`FirstOrDefaultAsync`, `ToListAsync`, `CountAsync`, `SaveChangesAsync`, `ExecuteUpdateAsync`), and Cache/Storage call MUST accept and forward `CancellationToken ct = default`.
- **No Sync-over-Async:** Never call `.Result`, `.Wait()`, or `.GetAwaiter().GetResult()`.
- **Nullable Reference Types:** Keep `<Nullable>enable</Nullable>` active across all `.csproj` files and maintain zero compiler warnings (`CS86xx`).
- **Snake_Case JSON Contract Parity:** `TorootoASP/Program.cs` uses `JsonNamingPolicy.SnakeCaseLower`. Never add, remove, or rename JSON DTO properties or route segments without updating the corresponding `frontend/src/` stores, API calls, and components in the same change.

---

## 2. React Performance & Engineering Guardrails (`/frontend-developer` & `/web-design-guidelines`)

### 2.1 Architecture, Separation & Cleanliness
- Keep UI components single-purpose and declarative; isolate Fisher-Yates shuffle algorithms, reading flows, API requests, and persisted session state inside Zustand stores (`authStore.js`, `pileStore.js`, `usePileHistoryStore.js`, `deckStore.js`, `cardStore.js`) and custom hooks (`hooks/`).
- Eliminate duplicated feature pages (`ReadingRoom.jsx` vs `PileDrawer.jsx`, `pilelist.jsx`/`PileDetail.jsx` vs `UserPileList.jsx`/`UserPileDetail.jsx`, `Profile.jsx` vs `UserProfile.jsx`) by extracting shared, role-aware components.
- Zero dead code: remove all unused imports, unrouted pages, template assets, commented-out code, and `console.log`/`console.error` noise. Maintain `npm run lint` with **0 errors and 0 warnings**.
- Never call `setState` synchronously inside `useEffect`, never invoke impure functions like `Math.random()` inside render or `useMemo`, and always clean up `setTimeout` handles, DOM listeners, and in-flight work on unmount.

### 2.2 Rendering & Animation Performance
- **Granular Store Subscriptions:** Never subscribe to an entire Zustand store without a selector (`useDrawerStore()`), and never subscribe card slots to full collections when only a single slot/card entry is needed. Select by index/id (`state.drawnCards[index]`, `state.flippedCards[cardId]`).
- **Memoization:** Wrap `CardSlot` and `CardBack` in `React.memo`. Memoize fanned deck geometry (`useMemo`) and pass stable handlers (`useCallback` reading state via refs or store actions rather than closing over `selectedCardId`) so selecting one card does not re-render all 78 cards.
- **GPU-Composited Animations Only:** Animate exclusively `transform` and `opacity` (or a single `pointer-events-none` atmospheric `<canvas>`). Never animate `width`, `height`, `top`, `left`, or use `transition: all` (always list explicit properties). Pointer-driven tilt and foil glare MUST use Framer Motion `useMotionValue` / `useTransform` outside React state so mouse movement never triggers re-renders. Never animate heavy `backdrop-blur` filters or spawn dozens of animated star `<div>` nodes.

### 2.3 Image Preloading & Asset Delivery
- Add `<link rel="preconnect">` for external image CDN origins (ImageKit) and Google Fonts in `frontend/index.html`.
- Preload the active Tarot deck back artwork and drawn card front images immediately upon deck load / draw initiation so card flips never flash blank frames or trigger layout shifts.
- Provide explicit `width` and `height` (or `aspect-[3/5]` container dimensions with intrinsic sizing) on all `<img>` elements to prevent CLS.
- Apply `loading="lazy"` and `decoding="async"` to off-screen catalog grids (`UserDeckExplorer`, `CardManagement`) and reading history lists.

### 2.4 Accessibility & Web Interface Compliance
- Use semantic HTML (`<button type="button">` for actions, `<Link>`/`<a>` for navigation — never `<div onClick>`), associate `<label htmlFor>` with every form input, provide `aria-label` on all icon-only buttons, and add `aria-live="polite"` for async save/error status updates.
- Replace `outline-none` with visible `:focus-visible` brass focus rings (`focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#C5A059]`).
- Add `role="dialog"`, `aria-modal="true"`, Escape key handling, and `overscroll-behavior: contain` to all modals and reading drawers.
- Honor `prefers-reduced-motion: reduce` across all CSS keyframes and Framer Motion transitions.
- Use `font-variant-numeric: tabular-nums` for dates, card positions, counts, and pagination numbers; use `…` instead of `...` in loading labels.

---

## 3. UX/UI Design System: "Tactile Esoteric & Editorial Dark" (`/frontend-design` & `/design-taste-frontend`)

### 3.1 Strictly Banned ("AI Slop" Patterns)
- **NO** neon purple, indigo, magenta, or cyan gradients (`from-purple-500 to-indigo-600`, `bg-[#030014]`, `text-purple-400`, `indigo-950`) or glowing outer `box-shadow`s (`shadow-[0_0_30px_rgba(99,102,241,...)]`).
- **NO** generic SaaS `backdrop-blur` glassmorphism panels floating over colorful blurred blobs (`blur-[160px]`, `mix-blend-screen` orbs, or `rounded-[2.5rem]` SaaS cards).
- **NO** synthetic CSS/DOM starfields (dozens of randomly positioned twinkling `<div>` stars and DOM/CSS laser shooting-star lines). *(A single fixed `pointer-events-none` `<canvas>` celestial sky strictly rendered in Parchment `#E8E2D5`, Antique Gold `#C5A059`, Muted Bronze `#8A6D3B`, and subtle Oxblood `#8B3A32` meteor embers—pausing when hidden or under `prefers-reduced-motion: reduce`—is the sanctioned atmospheric implementation.)*
- **NO** default geometric sans-serif headings (`Inter`/`Roboto`) paired with emojis (`🔮`, `🌙`, `✨`), generic `Sparkles` icons in headings, pulsing status dots (`animate-pulse`), or `ui-avatars.com` placeholder avatar URLs.
- **NO** pure `#000000` backgrounds or pure `#FFFFFF` text.
- **NO** fast `0.15s` linear transitions, bouncy slot-machine spring physics (`stiffness: 400+`), or infinite unpaused UI rotations (`repeat: Infinity` on interactive controls). *(Finite ritual animations and subtle astronomical SVG dials with finite rotation transitions are permitted.)*

### 3.2 Required Aesthetic Tokens & Materiality
- **Surfaces:**
  - Primary Canvas — **Matte Obsidian:** `#0B0A0E` (set `color-scheme: dark` on `<html>` and `<meta name="theme-color" content="#0B0A0E">`).
  - Elevated Surface / Cards / Drawers — **Charred Velvet:** `#141218`.
  - Secondary Inset / Table / Input Well — **Warm Dark Umber:** `#1C1917`.
- **Accents & Borders:**
  - Primary Metallic Accent — **Tarnished Antique Gold:** `#C5A059`.
  - Muted Secondary Accent — **Muted Bronze:** `#8A6D3B`.
  - Shadow / Reversed / Destructive Accent — **Dried Oxblood:** `#5E1914` (paired with warm bone `#E8E2D5` or muted rose-parchment `#C9A49A` text for accessible contrast).
  - Borders — Hairline `1px` brass rules (`rgba(197, 160, 89, 0.25)`, hover `rgba(197, 160, 89, 0.55)`) with double-line inset frames (`4px–6px` inset hairline border) inspired by vintage printmaking and Rider-Waite-Smith woodcut framing.
- **Typography & Ink:**
  - Primary Ink — **Warm Parchment:** `#E8E2D5`.
  - Secondary Ink — **Muted Ash:** `#9E9689`.
  - Display / Headings / Card Titles — High-contrast editorial Serif (`Cinzel` or `Cormorant Garamond`) with wide tracking and Roman numerals (`I`–`XXI` for Major Arcana and card positions), using `text-wrap: balance`.
  - Body Copy & Metadata — Understated sans-serif (`Plus Jakarta Sans` or `DM Sans`, max line length `65ch`) paired with refined monospace (`JetBrains Mono`, `tabular-nums`) for archival timestamps, suit tags, and slot indices.
- **Texture & Atmosphere:**
  - Fixed viewport SVG `<feTurbulence>` noise/film-grain overlay (`fixed inset-0 z-50 pointer-events-none opacity-[0.035]`) for a tactile velvet/archival paper surface — NEVER placed on scrolling containers.
  - Living Celestial Vault (`CelestialCanvas`): single `fixed inset-0 pointer-events-none` `<canvas>` rendering gold-leaf constellation hairlines, gentle luminance starlight, and occasional tapered meteors in Parchment/Gold/Oxblood tones, paired with a live astronomical engraved SVG **Lunar Phase Dial**.
- **Ritualistic Motion:**
  - Slow, weighty easing: `cubic-bezier(0.22, 1, 0.36, 1)` over `600ms–850ms`.
  - 3D Card Flips & Foil Glint: `perspective: 1200px`, `transform-style: preserve-3d`, `backface-visibility: hidden`, pointer tilt + gold-leaf specular glare via `useMotionValue`/`useTransform` (`pointer: fine` only), subtle hover elevation (`translateY(-6px)`), corner registration hairlines, and warm obsidian cast shadows (`0 18px 40px -12px rgba(11, 10, 14, 0.85)`).
  - Reversed Cards: Rotate card artwork `rotate-180` while keeping the nameplate, Roman numeral position, and Dried Oxblood (`#5E1914`) `REVERSED` badge upright and legible.
