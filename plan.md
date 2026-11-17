# Torooto Audit & Modernization Plan

> **Codebase Snapshot:** `.NET 8` API (`dotNetBackend/TorootoASP.sln`) + `React 19 / Vite 8 / Tailwind CSS v3.4 / Zustand 5` SPA (`frontend/`).
> **Read-Only Baseline Checks:** `dotnet build dotNetBackend/TorootoASP.sln --no-restore -m:1` succeeded with **4 nullable warnings** (`0` test projects); `npm run lint` failed with **44 problems (43 errors, 1 warning)**.

---

## Audit Findings Log

### 1. Clean Architecture Violations (`/clean-architecture`)
- **Framework Leaks in Application Project:** `dotNetBackend/TorootoAPI.Application/TorootoAPI.Application.csproj:13-14` pulls `Microsoft.AspNetCore.Http` (`2.3.12`) and `Microsoft.EntityFrameworkCore` (`8.0.30`) directly into the Application layer.
- **HTTP Types in Application Interfaces:** `dotNetBackend/TorootoAPI.Application/Interfaces/IImageStorageService.cs:1,7` imports `Microsoft.AspNetCore.Http` and exposes `IFormFile` in `UploadImageAsync`.
- **Persistence & JSON Coupling in Domain Models:** `dotNetBackend/TorootoAPI.Domain/Models/Card.cs:2-45`, `Deck.cs:1-32`, `Pile.cs:1-30`, `PileContent.cs:1-37`, and `User.cs:1-46` embed EF Core data annotations (`[Table]`, `[Column]`, `[Key]`, `[ForeignKey]`, `[InverseProperty]`) and `[System.Text.Json.Serialization.JsonIgnore]` (`Card.cs:41`), while leaving all entities as anemic property bags with zero domain invariant enforcement.
- **Misplaced API Wrapper in Domain:** `dotNetBackend/TorootoAPI.Domain/ResponsesType/Response.cs:3-8` defines an unused HTTP response record inside the Domain project.
- **HTTP Pipeline Concerns in Infrastructure:** `dotNetBackend/TorootoAPI.Infrastucture/DependencyInjection/ServiceContainer.cs:1-10,34-107` registers ASP.NET Core CORS (`AddCors`) and Rate Limiting (`AddRateLimiter`) inside Infrastructure; the folder/project/namespace is also misspelled `TorootoAPI.Infrastucture`.
- **Presentation Bypasses Explicit Application Reference:** `dotNetBackend/TorootoASP/TorootoASP.csproj:18-20` references only `TorootoAPI.Infrastucture` (relying on transitive visibility of Application) and `dotNetBackend/TorootoASP.sln` contains zero test projects.
- **Raw Domain Entities Exposed & Cached:**
  - `dotNetBackend/TorootoASP/Controllers/CardController.cs:7,46,67,85,100,103,109,139` returns raw `Card` entities in HTTP JSON responses and caches `IEnumerable<Card>` in Redis.
  - `dotNetBackend/TorootoASP/Controllers/DeckController.cs:8,39,47,59,78,101,122,136,143,233,236` returns raw `Deck` and `Card` entities in HTTP JSON responses and caches raw Domain entities in Redis.
  - `AuthController.cs:12`, `PileController.cs:8`, and `UserController.cs:8` all import `TorootoAPI.Domain.Models` directly.
- **Fat Controllers Containing Business Logic:**
  - `dotNetBackend/TorootoASP/Controllers/DeckController.cs:148-243` (`DecksController.UploadCardsRobust`) embeds 95 lines of CSV parsing, regex header normalization, and `Card` entity construction.
  - `dotNetBackend/TorootoASP/Controllers/PileController.cs:88-107,139-162` (`PilesController.AddNewPile` & `SaveFrontendPile`) embeds Tarot shuffle logic (`new Random()`), `Pile`/`PileContent` entity construction, and ID assignment.
  - `dotNetBackend/TorootoASP/Controllers/AuthController.cs:86-119` (`AuthController.GenerateJwtToken`) places JWT signing logic inside the controller instead of an `ITokenService`.
- **Duplicate/Conflicting Mapster Profiles:** `dotNetBackend/TorootoAPI.Application/Mappings/MappingConfig.cs:14-24` duplicates `User -> UserReadDto` and `UserCreateDto -> User` already defined in `UserMapingConfig.cs:11-14` (and maps plaintext `Password` into `HashedPassword` at `MappingConfig.cs:18`), while duplicating `PileContentResponseDto` mapping from `PileMappingConfig.cs:17-25`.
- **Unused Validation Package:** `TorootoAPI.Application.csproj:10` installs `FluentValidation` (`12.1.1`), yet zero `AbstractValidator<T>` classes exist anywhere in `TorootoAPI.Application`.

### 2. Backend Bugs & Bottlenecks (`/csharp-pro`)
- **Broken Route Binding Bug:** `dotNetBackend/TorootoASP/Controllers/CardController.cs:55-57` defines `[HttpPost("{deck_id}/cards")]` with parameter `Guid deckId` — route token mismatch means `deckId` always binds to `Guid.Empty`.
- **Primary Key Collision Bugs (`ValueGeneratedNever`):** `TorootoDBContext.cs:62,99,110` configures `ValueGeneratedNever()` for `CardId`, `PileId`, and `PileContentId`, yet:
  - `CardRepository.cs:31-36` (`CreateCardsBulkAsync`) and `DeckController.cs:207-216` (`UploadCardsRobust`) never assign `CardId = Guid.NewGuid()`, causing >1-row CSV uploads to collide on `Guid.Empty`.
  - `PileController.cs:92-105` (`AddNewPile`) and `PileRepository.cs:63-68` (`CreatePileAsync`) never assign `PileId` or `PileContentId`, inserting `Guid.Empty`.
- **NullReferenceException on `AddNewPile` Mapping:** `PileController.cs:96-105` populates `PileContent.CardId` without `Card`, then calls `_mapper.Map<PileResponseDto>(newPile)` where `PileMappingConfig.cs:22-25` dereferences `src.Card!.CardName`.
- **IDOR Authorization Vulnerability:** `PileController.cs:123-126` & `PileRepository.cs:70-80` (`DeletePile` / `SoftDeletePileAsync`) soft-delete by `pileId` alone without verifying `userId` ownership.
- **Npgsql Execution Strategy Crash in `RestoreDeckAsync`:** `ServiceContainer.cs:24` enables `EnableRetryOnFailure()`, which makes the explicit `BeginTransactionAsync()` in `DeckRepository.cs:77` throw `InvalidOperationException` because it is not wrapped in `CreateExecutionStrategy().ExecuteAsync(...)`.
- **Blocking Sync Redis Connection on Startup:** `ServiceContainer.cs:84-90` invokes synchronous `ConnectionMultiplexer.Connect(connectionString)` in DI registration without `AbortOnConnectFail = false` or `Ssl = true`, risking startup failures or thread-pool starvation.
- **Wrong Login Request Contract:** `AuthController.cs:45` binds `[FromBody] UserCreateDto loginDto` on `POST /auth/jwt/login` instead of a dedicated `LoginRequestDto(Email, Password)`.
- **Exception Leak & Inconsistent Status Codes:** `PileController.cs:69-74` exposes raw `ex.Message` and `ex.InnerException?.Message` in `500` responses; `DeckController.cs:119,227` returns `200 OK` (`success: false`) for missing decks and invalid CSV uploads instead of `404`/`400`; `CardsController` (`CardController.cs:50`) passes an interpolated string to `_logger.LogError`.
- **Zero `.AsNoTracking()`, Sequential Roundtrips & Missing Split Queries:**
  - Zero `.AsNoTracking()` calls across `CardRepository.cs`, `DeckRepository.cs`, `PileRepository.cs`, and `UserRepository.cs`.
  - `CardRepository.cs:60-67,73-80` executes two sequential DB queries instead of one joined query.
  - `PileRepository.cs:19-24,34-40,46-51` joins `Piles -> PileContents -> Card` without `.AsNoTracking()` or `.AsSplitQuery()`, and `GetUserPilesAsync`/`GetUserPilesPagedAsync` fail to filter `pc.IsDeleted == false` on `PileContents`.
  - `DeckRepository.cs:50-74,87-93` loads all child cards into memory to loop-update soft-deletes instead of `ExecuteUpdateAsync`, and `FindAsync` (`:52`) bypasses soft-delete checks.
  - `RedisCacheService.cs:88-91` deletes keys one-by-one inside `await foreach` (N+1 Redis roundtrips) and catches all exceptions indiscriminately.
  - `ImageKitStorageService.cs:22-39` ignores the `folder` and `tags` parameters passed by callers.
- **Missing Cache Invalidation:** `CardsController` (`UpdateCard`, `AddCard`, `DeleteCard`, `UpdateCardImage`) never invalidates `tarot_deck` or `deck_{deck_id}`; `DecksController` (`AddNewDeck`, `RestoreDeck`, `UploadCardsRobust`) never invalidates `all_decks`, `deck_{deck_id}`, or `tarot_deck`; `PilesController.AddNewPile` never invalidates `piles_user_{userId}_*`.
- **Missing `CancellationToken` & Compiler Warnings:** Zero `CancellationToken` parameters exist on all 6 Application interfaces (`ICacheService`, `ICardRepository`, `IDeckRepository`, `IImageStorageService`, `IPileRepository`, `IUserRepository`), Repositories, and Controllers; `dotnet build` reports 4 nullable warnings (`Response.cs:5` `CS8625`, `ImageKitStorageService.cs:18` `CS8601` & `:38` `CS8603`, `AuthController.cs:67` `CS8604`).

### 3. Frontend Bugs & Performance Issues (`/frontend-developer`)
- **Runtime Bugs & Broken Routes:**
  - `frontend/src/pages/LoginPage.jsx:26`: Calls undefined `setError(...)` (`no-undef` ESLint error → `ReferenceError` on login failure).
  - `frontend/src/stores/deckStore.js:78`: Posts to `/deck/${deckId}/restore` instead of backend route `/decks/${deckId}/restore`.
  - `frontend/src/stores/usePileHistoryStore.js:42`: Filters `p.pileId !== pileId` even though `.NET` `SnakeCaseLower` returns `pile_id`, leaving deleted readings in state.
  - `frontend/src/pages/UserPileList.jsx:60` vs `UserPileDetail.jsx:200`: Passes `state: { pileNe }` while detail page reads `location.state?.pile`, forcing redundant API calls.
  - `frontend/src/components/SidebarTorooto.jsx:20` & `Navbar.jsx:99`: Use relative links `"admin/piles"` and `"admin/profile"`, breaking navigation from nested `/admin/*` pages.
  - `frontend/src/pages/admin/CardManagement.jsx:211,267`: Passes `e.target.files[0]` without guarding cancelled file dialogs; line 421 has broken class typo `object-covergrayscale-[15%]`.
- **ESLint / React 19 Violations (44 issues via `npm run lint`):**
  - `frontend/src/components/User/UserLayout.jsx:8-12`: Calls impure `Math.random()` inside `useMemo` (`react-hooks/purity` ×5 errors) while mounting 80 animated star `<div>` elements.
  - `frontend/src/App.jsx:34` (`setIsChecking(false)`), `PileReadingModal.jsx:49` (`setMounted(true)`), `Profile.jsx:14` & `UserProfile.jsx:40` (`setFormData(...)`): Synchronous `setState` in `useEffect` (`react-hooks/set-state-in-effect` errors), plus `App.jsx:44` missing `useEffect` dependencies.
  - Uncleaned `setTimeout` calls in `frontend/src/stores/pileStore.js:77` and `CardManagement.jsx:71`.
- **Re-render Bottlenecks & Layout Animations:**
  - `frontend/src/components/SemicircleDeck.jsx:62,94-105,181`: Subscribes to the entire `useDrawerStore()` without a selector and passes an unstable inline `onSelect={(e) => handleCardClick(e, card)}` callback closing over `selectedCardId`, forcing all 78 `CardBack` memos to re-render on selection or unrelated store updates.
  - `frontend/src/components/CardSlot.jsx:7-9`: Subscribes to the entire `drawnCards` array and `flippedCards` object, re-rendering every card slot when one card flips.
  - `frontend/src/components/SettingPanel.jsx:58-65,152-160,178-185` & `SidebarTorooto.jsx:56-61`: Animate layout properties (`width`, `height`, `left`) instead of GPU-composited `transform`/`opacity`.
- **Unoptimized Image Loading & Broken CSS:**
  - `CardSlot.jsx:92` sets `loading="lazy"` on active drawn card artwork, causing flip-reveal flicker; neither active deck back visuals nor drawn card images are preloaded.
  - `UserDeckExplorer.jsx:287-291` & `CardManagement.jsx:237-241`: Eagerly load up to 78 card images without `loading="lazy"`, explicit `width`/`height` attributes, or `<link rel="preconnect">` in `frontend/index.html`.
  - `frontend/src/App.css:27`: Contains literal truncated placeholder `...; /* full list from previous answer */`, breaking `.night-sky::before`.

### 4. UI/UX Audit Findings (`/web-design-guidelines` & `/design-taste-frontend`)
- **Pervasive "AI Slop" Visual Tropes:**
  - Neon purple/indigo/cyan/pink gradients, outer glows (`shadow-[0_0_40px_...]`), `backdrop-blur-xl/2xl/3xl` SaaS glass panels, `mix-blend-screen` gradient blobs, and `#000000`/`#030014`/`#050505` + `#FFFFFF` palettes across `UserLayout.jsx:17,52-68`, `Layout.jsx:39,60-86`, `Navbar.jsx:48-55,86`, `UserNavbar.jsx:57-88,119-123`, `SettingPanel.jsx:39,68-73,154,191,200`, `PileReadingModal.jsx:104-163,269-284`, `CardSlot.jsx:52,59,77`, `SemicircleDeck.jsx:32-36,159,164`, `SidebarTorooto.jsx:62,82,124`, `ReadingRoom.jsx`, `PileDrawer.jsx`, `UserDeckExplorer.jsx`, `DeckManagement.jsx`, `CardManagement.jsx`, `LoginPage.jsx`, `register.jsx`, `Profile.jsx`, `UserProfile.jsx`, `PileDetail.jsx`, `UserPileDetail.jsx`, `pilelist.jsx`, `UserPileList.jsx`, `NotFound.jsx`, `ServerError.jsx`, and `AccessDenied.jsx`.
  - No curated Editorial Serif (`Cinzel`/`Cormorant Garamond`) or body/mono font stack configured in `frontend/index.html` or `tailwind.config.js`.
  - Emojis and placeholder copy: `DeckExplorer.jsx:225,229,276,282` (`🔮`, `🌙`), `MainContent.jsx:17` (`✨`), `Navbar.jsx:93` & `UserNavbar.jsx:140` (`"Hi witchhh"`), plus external `ui-avatars.com` avatar fallbacks (`Navbar.jsx:29`, `UserNavbar.jsx:37`, `Profile.jsx:18`, `UserProfile.jsx:46`).
  - Infinite decorative animations without `prefers-reduced-motion`: `PileReadingModal.jsx:112,275`, `UserLayout.jsx:81,92-100`, `SidebarTorooto.jsx:124-125`, `NotFound.jsx:20`, `ServerError.jsx:20`, `AccessDenied.jsx:19`.
- **Web Interface & Accessibility Violations (`file:line`):**
  - Non-semantic `<div onClick>` controls without keyboard support: `CardSlot.jsx:40-48`, `SemicircleDeck.jsx:14-15`, `ReadingRoom.jsx:88`, `PileDrawer.jsx:87-91`, `UserDeckExplorer.jsx:278-281`, `PileDetail.jsx:245-248`, `Profile.jsx:54-56`, `UserProfile.jsx:127-130`.
  - Icon-only buttons missing `aria-label`: `Navbar.jsx:39`, `SettingPanel.jsx:84,112,121,170`, `UserDeckExplorer.jsx:144`, `DeckManagement.jsx:136,143,150,172`, `CardManagement.jsx:215,271,280,286,329,379`, `pilelist.jsx:144,151,198,205,226,233`, `UserPileList.jsx:144,151,198,205,226,233,329`.
  - Form inputs missing `htmlFor`/`id`, `autocomplete`, `spellCheck`, and `:focus-visible` rings (`outline-none` without replacement): `LoginPage.jsx:73-98`, `register.jsx:83-143`, `Profile.jsx:105,120`, `UserProfile.jsx:228,254`, `DeckManagement.jsx:176-209`, `CardManagement.jsx:571-600`.
  - Modals missing `role="dialog"`, `aria-modal="true"`, focus management, and `overscroll-behavior: contain`: `PileReadingModal.jsx:95-101`, `UserDeckExplorer.jsx:130-137`, `DeckManagement.jsx:168-225`, `CardManagement.jsx:356-371`, `pilelist.jsx:250`, `UserPileList.jsx:250`.
  - Images missing explicit `width`/`height`; loading states using `...` instead of `…`; missing `color-scheme: dark` and `<meta name="theme-color">` in `frontend/index.html`; `h-screen` used in `ReadingRoom.jsx:32`.

### 5. Dead Code & Redundancy
- **Backend (`dotNetBackend/`):**
  - Unused `dotNetBackend/TorootoAPI.Domain/ResponsesType/Response.cs` (causes `CS8625`).
  - Unused DTOs `CardCsvRowDto` and `ImageUpdateDto` in `dotNetBackend/TorootoAPI.Application/DTOs/DeckCardDTOs.cs:30-39`.
  - Unused `using TorootoAPI.Application.DTOs.Decks;` in `ICardRepository.cs:3`.
  - Redundant `User.ProfileImageUrl` (`Domain/Models/User.cs:9-10`) alongside `User.ImageUrl` (`User.cs:42-43`).
  - Duplicate Mapster profile `MappingConfig.cs` overlapping `UserMapingConfig.cs` and `PileMappingConfig.cs`.
  - Legacy `AlembicVersion` DbSet/model (`Infrastucture/Models/AlembicVersion.cs`, `TorootoDBContext.cs:17,53-56`) and superseded Python `backend/` directory (confirm retention/archive policy before removal).
- **Frontend (`frontend/`):**
  - Unrouted dead files: `frontend/src/components/MainContent.jsx`, `frontend/src/pages/HomePage.jsx`, `frontend/src/pages/DeckLibrary.jsx`, `frontend/src/pages/DeckExplorer.jsx` (and dead imports in `App.jsx:10-11` + JSX text comment `App.jsx:68`).
  - Unused Vite template assets: `frontend/src/assets/hero.png`, `frontend/src/assets/react.svg`, `frontend/src/assets/vite.svg`, `frontend/public/icons.svg`.
  - Redundant packages in `frontend/package.json:18-19`: `react-icons` (used only in 3 error pages + dead `MainContent.jsx`; replace with `lucide-react`) and redundant `react-router` alongside `react-router-dom`.
  - Duplicate feature pages: `ReadingRoom.jsx` vs `PileDrawer.jsx`, `pilelist.jsx`/`PileDetail.jsx` vs `UserPileList.jsx`/`UserPileDetail.jsx`, `Profile.jsx` vs `UserProfile.jsx`.
  - 38+ unused imports/variables flagged by ESLint across `App.jsx`, `main.jsx`, `Layout.jsx`, `Navbar.jsx`, `CardSlot.jsx`, `PileReadingModal.jsx`, `SemicircleDeck.jsx`, `SettingPanel.jsx`, `SidebarTorooto.jsx`, `UserNavbar.jsx`, `CardManagement.jsx`, `DeckManagement.jsx`, `authStore.js`, `deckStore.js`, and page files (`motion`, `selectedCard`, `fileInputRef`, `error`, `year`, `err`, `get`, `result`), plus `console.error` calls in `authStore.js:39,136` and `pileStore.js:49`.

---

## Implementation Plan

### Phase 1: Clean Architecture Boundaries, Dead Code Elimination & Bug Fixes
`[/clean-architecture + /csharp-pro + /frontend-developer]`

- [x] **1.1 Strip Persistence/HTTP Dependencies from Domain & Application:**
  - Remove `[Table]`, `[Column]`, `[Key]`, `[ForeignKey]`, `[InverseProperty]`, and `[JsonIgnore]` from `dotNetBackend/TorootoAPI.Domain/Models/Card.cs`, `Deck.cs`, `Pile.cs`, `PileContent.cs`, and `User.cs`; add factory/invariant methods (e.g., `Pile.Create`, `Card.Create`, `Deck.Create`) and remove unused `User.ProfileImageUrl`.
  - Delete `dotNetBackend/TorootoAPI.Domain/ResponsesType/Response.cs`.
  - Remove `Microsoft.AspNetCore.Http` and `Microsoft.EntityFrameworkCore` from `dotNetBackend/TorootoAPI.Application/TorootoAPI.Application.csproj`.
  - Replace `IFormFile` in `dotNetBackend/TorootoAPI.Application/Interfaces/IImageStorageService.cs` with an `ImageUploadRequest` record (`Stream Content`, `string FileName`, `string ContentType`, `string Folder`, `IReadOnlyList<string>? Tags`).
  - Add explicit `<ProjectReference Include="..\TorootoAPI.Application\TorootoAPI.Application.csproj" />` to `dotNetBackend/TorootoASP/TorootoASP.csproj`.
- [x] **1.2 Introduce Application Use Cases, Validators & Clean DTO Contracts:**
  - Consolidate Mapster profiles by removing duplicate mappings in `dotNetBackend/TorootoAPI.Application/Mappings/MappingConfig.cs` and typos (`DeckMaping.cs`, `UserMapingConfig.cs`, `AppplicationServiceContainer.cs`).
  - Delete unused `CardCsvRowDto` and `ImageUpdateDto` in `dotNetBackend/TorootoAPI.Application/DTOs/DeckCardDTOs.cs`; add dedicated `LoginRequestDto(string Email, string Password)` in `AuthDTOs.cs` and DTOs for `CardResponseDto` and `DeckResponseDto` so controllers never return raw Domain entities.
  - Extract `ITokenService`, `IPasswordHasher`, and `ICsvCardParser` interfaces in `TorootoAPI.Application/Interfaces/` with Infrastructure implementations in `TorootoAPI.Infrastucture/Services/`.
  - Add `FluentValidation` validators for `UserCreateDto`, `LoginRequestDto`, `UserUpdateDto`, `DeckCreateDto`, `DeckUpdateDto`, `CardCreateDto`, `CardUpdateDto`, `CreatePileRequestDto`, and `SavePileRequestDto`.
  - Move shuffle/draw logic (`PileController.AddNewPile`), save-pile orchestration (`SaveFrontendPile`), and CSV import logic (`DeckController.UploadCardsRobust`) into Application use case services/handlers.
- [x] **1.3 Fix Critical Backend Bugs, Security & Async/CancellationToken Propagation:**
  - Add `CancellationToken ct = default` to every method in `ICacheService`, `ICardRepository`, `IDeckRepository`, `IImageStorageService`, `IPileRepository`, `IUserRepository`, all Repository implementations, and all Controller actions (`AuthController`, `CardsController`, `DecksController`, `PilesController`, `UsersController`).
  - Fix `[HttpPost("{deck_id}/cards")]` parameter mismatch in `dotNetBackend/TorootoASP/Controllers/CardController.cs:55-57` (`Guid deck_id` or `[FromRoute(Name = "deck_id")]`).
  - Fix `Guid.NewGuid()` generation in `CardRepository.CreateCardsBulkAsync`, `PileRepository.CreatePileAsync`, and Application factories so `ValueGeneratedNever()` never inserts `Guid.Empty`.
  - Fix `AddNewPile` null navigation mapping (`PileController.cs:105` / `PileMappingConfig.cs`) by projecting directly from drawn `Card` metadata or loading/returning `PileResponseDto` with full card fields.
  - Fix IDOR vulnerability in `PileRepository.SoftDeletePileAsync` and `PileController.DeletePile` by requiring and enforcing `userId` ownership.
  - Fix `AuthController.Login` to accept `LoginRequestDto`, unify `ApiResponse<T>` / `ProblemDetails` across all controllers, return proper `400`/`404` status codes (removing `200 OK` error payloads in `DeckController.cs:119,227` and exception leaks in `PileController.cs:69-74`), and eliminate all 4 compiler nullable warnings.
  - Move `AddCors` and `AddRateLimiter` from `TorootoAPI.Infrastucture/DependencyInjection/ServiceContainer.cs` into `TorootoASP/Program.cs`; make `ConnectionMultiplexer` registration non-blocking (`AbortOnConnectFail = false`) and forward `folder`/`tags` in `ImageKitStorageService.cs`.
- [x] **1.4 Frontend Bug Fixes & Dead Code Removal:**
  - Fix `LoginPage.jsx:26` (`setError` crash), `deckStore.js:78` (`/decks/${deckId}/restore`), `usePileHistoryStore.js:42` (`p.pile_id !== pileId`), `UserPileList.jsx:60` / `UserPileDetail.jsx:200` (`state: { pile }`), `SidebarTorooto.jsx:20` (`"/admin/piles"`), `Navbar.jsx:99` (`"/admin/profile"`), and `CardManagement.jsx:211,267,421`.
  - Clean up `setTimeout` timers on unmount in `pileStore.js` and `CardManagement.jsx`; eliminate synchronous `setState` in `useEffect` (`App.jsx`, `PileReadingModal.jsx`, `Profile.jsx`, `UserProfile.jsx`) and impure `Math.random()` in `UserLayout.jsx`.
  - Delete dead pages/components/assets: `MainContent.jsx`, `HomePage.jsx`, `DeckLibrary.jsx`, `DeckExplorer.jsx`, `hero.png`, `react.svg`, `vite.svg`, `public/icons.svg`, unused imports in `App.jsx` & `main.jsx`, broken `App.css:27`, and `console.error` calls; remove `react-icons` and redundant `react-router` from `frontend/package.json`.
  - Deduplicate `ReadingRoom.jsx` / `PileDrawer.jsx`, `pilelist.jsx` / `UserPileList.jsx`, `PileDetail.jsx` / `UserPileDetail.jsx`, and `Profile.jsx` / `UserProfile.jsx` into shared components.
  - Verify `dotnet build dotNetBackend/TorootoASP.sln -m:1` (0 warnings, 0 errors) and `npm --prefix frontend run lint` (0 errors, 0 warnings).

---

### Phase 2: Query Optimization, Caching & Frontend Performance
`[/csharp-pro + /frontend-developer]`

- [x] **2.1 EF Core Entity Configurations & Query Optimization:**
  - Create Fluent API `IEntityTypeConfiguration<T>` classes in `TorootoAPI.Infrastucture/Persistence/Configurations/` (`CardConfiguration`, `DeckConfiguration`, `PileConfiguration`, `PileContentConfiguration`, `UserConfiguration`), apply global soft-delete query filters, and remove `AlembicVersion` DbSet (`TorootoDBContext.cs:17,53-56`) if EF-managed or isolate it cleanly.
  - Add `.AsNoTracking()` to every read-only query in `CardRepository.cs`, `DeckRepository.cs`, `PileRepository.cs`, and `UserRepository.cs`.
  - Consolidate `CardRepository.GetAllTarotCardsAsync` and `GetCardsByDeckIdAsync` from 2 DB roundtrips into 1 single query.
  - Add `.AsSplitQuery()` and explicit `pc.IsDeleted != true` filtering on `PileRepository.GetUserPilesAsync`, `GetUserPilesPagedAsync`, and `GetPileByIdAsync`.
  - Wrap `DeckRepository.RestoreDeckAsync` in `_context.Database.CreateExecutionStrategy().ExecuteAsync(...)` and refactor `SoftDeleteDeckAsync`/`RestoreDeckAsync` to use `ExecuteUpdateAsync`.
- [x] **2.2 Static Tarot Metadata Caching & Invalidation Parity:**
  - Cache mapped `CardResponseDto` / `DeckResponseDto` lists (never raw Domain entities) in `RedisCacheService.cs` with `IMemoryCache` L1 / Redis L2 hybrid or long-lived static Tarot metadata caching (`tarot_deck`, `all_decks`, `deck_{deck_id}`).
  - Batch Redis key deletions in `RedisCacheService.RemoveByPatternAsync` using `KeyDeleteAsync(keys[])` instead of per-key roundtrips.
  - Wire cache invalidation across all mutations: `CardsController` (`AddCard`, `UpdateCard`, `DeleteCard`, `UpdateCardImage` → invalidate `tarot_deck` & `deck_{deckId}`), `DecksController` (`AddNewDeck`, `UpdateDeck`, `DeleteDeck`, `RestoreDeck`, `UploadCardsRobust` → invalidate `all_decks`, `deck_{deckId}`, `tarot_deck`), and `PilesController` (`AddNewPile`, `SaveFrontendPile`, `DeletePile` → invalidate `piles_user_{userId}_*`).
- [x] **2.3 React Re-render Elimination & Card Image Preloading:**
  - Refactor `CardSlot.jsx` to accept `card` / `isFlipped` or select `state.drawnCards[index]` and `state.flippedCards[cardId]` granularly, wrapped in `React.memo`.
  - Refactor `SemicircleDeck.jsx` to select only `availableCards` and `pickManualCard` via granular selectors, read `selectedCardId` via ref/state setter inside stable `useCallback`, and avoid per-card inline arrow closures in `.map()`.
  - Replace layout-thrashing animations (`width`, `height`, `left`) in `SettingPanel.jsx` and `SidebarTorooto.jsx` with GPU-composited `transform`/`opacity` transitions.
  - Add `<link rel="preconnect">` for ImageKit (`ik.imagekit.io`) in `frontend/index.html`, preload drawn card front images + active deck back artwork when `fullDeck` / `drawnCards` load in `pileStore.js` & `CardSlot.jsx`, remove `loading="lazy"` from active `CardSlot.jsx`, keep `loading="lazy"` + `decoding="async"` + explicit `width`/`height` on `UserDeckExplorer.jsx`, `CardManagement.jsx`, `UserPileDetail.jsx`, and `PileReadingModal.jsx`.

---

### Phase 3: Automated Testing & Architecture Enforcement
`[/clean-architecture + /csharp-pro + /frontend-developer]`

- [x] **3.1 Backend Architecture, Unit & Integration Test Projects (`dotNetBackend/`):**
  - Add xUnit test projects to `dotNetBackend/TorootoASP.sln`:
    - `TorootoAPI.ArchitectureTests` (using `NetArchTest.Rules`) asserting:
      - `TorootoAPI.Domain` has zero dependencies on `Application`, `Infrastucture`, `TorootoASP`, `EF Core`, or `AspNetCore`.
      - `TorootoAPI.Application` does not depend on `Infrastucture`, `TorootoASP`, `Microsoft.EntityFrameworkCore`, or `Microsoft.AspNetCore.Http`.
      - Controllers in `TorootoASP` never directly depend on `TorootoDBContext` or return `TorootoAPI.Domain.Models.*` types.
    - `TorootoAPI.UnitTests` (xUnit + Moq/NSubstitute): Domain invariant tests (`Pile`, `Card`, `Deck`), Application use-case tests (Fisher-Yates draw distribution, reversal flag, CSV parser edge cases, FluentValidation rules, `AddNewPile`/`SaveFrontendPile` IDs).
    - `TorootoAPI.IntegrationTests` (`WebApplicationFactory<Program>` + in-memory/Testcontainers PostgreSQL): Auth login/register DTO validation, `AddCard` `{deck_id}` route binding, IDOR ownership enforcement on `DELETE /piles/{pile_id}`, and cache invalidation checks.
  - Uncomment and enable `dotnet test` in `.github/workflows/deploy.yml`.
- [x] **3.2 Frontend Unit & Component Tests (`frontend/`):**
  - Install `vitest`, `@testing-library/react`, `@testing-library/jest-dom`, `@testing-library/user-event`, and `jsdom` in `frontend/package.json` with a `"test"` script.
  - Add tests covering:
    - `pileStore.test.js` (Fisher-Yates shuffle integrity, auto vs manual draw slots, `allowReversed`, timer cleanup on reset, `savePile` snake_case payload).
    - `usePileHistoryStore.test.js` (`deletePile` filtering by `pile_id`, pagination metadata).
    - `CardSlot.test.jsx` & `SemicircleDeck.test.jsx` (keyboard accessibility, flip toggle isolation, reversed orientation badge, manual card selection).
    - `LoginPage.test.jsx` (failed login error display without `setError` crash, accessible label/form behavior).

---

### Phase 4: UX/UI Redesign — "Tactile Esoteric & Editorial Dark"
`[/web-design-guidelines + /frontend-design + /design-taste-frontend]`

- [x] **4.1 Step 4.1: Global Theme Tokens, Serif Typography & Fixed Film-Grain Overlay:**
  - Update `frontend/index.html`: set `color-scheme: dark`, `<meta name="theme-color" content="#0B0A0E">`, `<link rel="preconnect">` for Google Fonts & ImageKit, and import `Cinzel`, `Cormorant Garamond`, `Plus Jakarta Sans`, and `JetBrains Mono`.
  - Configure `frontend/tailwind.config.js` and `frontend/src/index.css` / `App.css` with semantic tokens: Obsidian (`#0B0A0E`), Charred Velvet (`#141218`), Warm Dark Umber (`#1C1917`), Antique Gold (`#C5A059`), Muted Bronze (`#8A6D3B`), Dried Oxblood (`#5E1914`), Warm Parchment (`#E8E2D5`), and Muted Ash (`#9E9689`), plus `prefers-reduced-motion` global rules.
  - Remove broken `.night-sky` starfield (`App.css:13-35`) and `UserLayout.jsx` 80-star DOM loop + neon blobs; replace with a single fixed viewport SVG `<feTurbulence>` noise/film-grain layer (`fixed inset-0 pointer-events-none opacity-[0.035]`).
- [x] **4.2 Step 4.2: Editorial Layout Shell & Hairline Brass Navigation:**
  - Redesign `frontend/src/components/User/UserLayout.jsx`, `UserNavbar.jsx`, `Layout.jsx`, `Navbar.jsx`, `SidebarTorooto.jsx`, and `frontend/src/assets/name.svg` / `public/torooto.svg` using Matte Obsidian (`#0B0A0E`), Charred Velvet (`#141218`), hairline `1px` brass rules (`rgba(197, 160, 89, 0.25)`), engraved monogram fallback instead of `ui-avatars.com`, and `Cinzel` wordmarks.
  - Remove all emojis (`🔮`, `🌙`, `✨`), `"Hi witchhh"` placeholder text, `animate-pulse` dots, and neon pill gradients.
  - Ensure semantic `<button>` / `<Link>` elements, visible `:focus-visible` brass rings, and mobile collapse (<768px).
  - Restyle `LoginPage.jsx`, `register.jsx`, `Profile.jsx`, `UserProfile.jsx`, `NotFound.jsx`, `ServerError.jsx`, and `AccessDenied.jsx` in the same editorial printmaking aesthetic using `lucide-react` icons and proper `<label htmlFor>` / `autocomplete` / `spellCheck` attributes.
- [x] **4.3 Step 4.3: Tactile Tarot Deck Spread, Reversed Cards & Weighty 3D Flip:**
  - Redesign `CardSlot.jsx` and `SemicircleDeck.jsx` with vintage printmaking double-line brass inset frames, engraved Roman numeral card back vector motif (`I`–`XXI`), Matte Obsidian / Charred Velvet stock, and soft obsidian cast shadows (zero purple/indigo glows).
  - Implement weighty ritualistic easing (`cubic-bezier(0.22, 1, 0.36, 1)`, `600ms–850ms`) with `perspective: 1200px` and `transform-style: preserve-3d` on flip, plus subtle hover elevation (`translateY(-6px)`).
  - Rotate reversed card artwork (`rotate-180`) cleanly inside the frame while keeping the card title nameplate, Roman numeral position, and Dried Oxblood (`#5E1914`) `REVERSED` badge upright and readable.
  - Restyle `SettingPanel.jsx` from the glowing yellow moon/cosmic glass widget into an engraved brass & velvet Ritual Spread Control drawer with semantic controls, `aria-label`s, and `tabular-nums`.
- [x] **4.4 Step 4.4: Interpretation Parchment Drawer, Catalog & Reading History Redesign:**
  - Redesign `PileReadingModal.jsx` (and shared reading detail view `UserPileDetail.jsx` / `PileDetail.jsx`) as a Charred Velvet & Warm Dark Umber interpretation folio with `role="dialog"`, `aria-modal="true"`, `overscroll-behavior: contain`, `Cinzel`/`Cormorant Garamond` titles, `<65ch` prose lines, `600ms–850ms` staggered fade-ins (`cubic-bezier(0.22, 1, 0.36, 1)`), and Dried Oxblood (`#5E1914`) reversed/shadow sections.
  - Redesign `UserPileList.jsx` / `pilelist.jsx`, `UserDeckExplorer.jsx`, `DeckManagement.jsx`, and `CardManagement.jsx` with hairline brass dividers (`1px` rules instead of rounded neon glass boxes), `tabular-nums` dates/counts, Roman numeral suit/position headers, and accessible modals.

---

## Step 4 Gate
> **Execution Paused:** `rules.md` and `plan.md` are ready for review. Reply to approve **Phase 1** before any `.cs`, `.js`, `.jsx`, or `.css` files are modified.
