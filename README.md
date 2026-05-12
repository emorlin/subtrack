# Subtrack

> Personlig webb-app för att hålla koll på löpande abonnemang och prenumerationer.

![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white&labelColor=20232A)
![TypeScript](https://img.shields.io/badge/TypeScript-6-3178C6?logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-8-646CFF?logo=vite&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-38BDF8?logo=tailwindcss&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-Postgres-3ECF8E?logo=supabase&logoColor=white)
![Vercel](https://img.shields.io/badge/Deploy-Vercel-000000?logo=vercel&logoColor=white)

---

## Innehåll

- [Vad är Subtrack?](#vad-är-subtrack)
- [Funktioner](#funktioner)
- [Teknisk stack](#teknisk-stack)
- [Arkitektur](#arkitektur)
- [Projektstruktur](#projektstruktur)
- [Databasmodell](#databasmodell)
- [Beräkningslogik](#beräkningslogik)
- [Säkerhet & RLS](#säkerhet--rls)
- [Responsiv design & PWA](#responsiv-design--pwa)
- [Demo-läge](#demo-läge)
- [Tillgänglighet](#tillgänglighet)
- [Komma igång](#komma-igång)
- [Miljövariabler](#miljövariabler)
- [Supabase — setup](#supabase--setup)
- [Bygga & driftsätta](#bygga--driftsätta)
- [Designsystem](#designsystem)

---

## Vad är Subtrack?

Det är lätt att tappa koll på vilka tjänster man betalar för, vad de kostar i dag jämfört med när man tecknade dem, och när de förnyas nästa gång. Subtrack löser det: appen samlar alla abonnemang på ett ställe med fullständig prishistorik, kostnadstrend per kategori och automatiska påminnelser inför förnyelse.

Appen är byggd som en **Progressive Web App** och kan installeras direkt från webbläsaren på både iOS och Android. All data lagras i en Postgres-databas (Supabase) med Row Level Security — ingen användare kan läsa en annan användares data.

---

## Funktioner

| Funktion | Beskrivning |
|---|---|
| **Abonnemangsöversikt** | Lista med aktuell månads- och årskostnad, status och kategori |
| **Prishistorik** | Spåra prisändringar bakåt i tiden — se exakt vad du betalat sedan starten |
| **Kostnadstrend** | Stapeldiagram per månad och år med nedbrytning per kategori. Klicka en stapel för att se en detaljlista med alla aktiva tjänster och individuella kostnader den månaden — navigera månadsvis med piltangenter i modalen |
| **Påminnelser** | Notiser inför förnyelsedatum, konfigurerbart per abonnemang |
| **Kategorier** | Egna kategorier med valfri färg, standardkategorier skapas automatiskt |
| **Google-inloggning** | OAuth via Supabase Auth — inga lösenord att hantera |
| **PWA / Hemskärm** | Installerbar som app på iOS och Android |
| **Responsiv** | Sticky bottom nav + FAB på mobil, sidebar + sidopanel på desktop. Modaler: fullskärm (mobil) / fast bredd (desktop) |
| **Demo-läge** | Utforska appen utan konto — hårdkodad data, inga Supabase-anrop |
| **Mörkt läge** | Fullt mörkt tema via CSS-variabler. Växla i Inställningar → Utseende — valet sparas i `localStorage`, systempreferens används som standard |
| **Admin-vy** | Dold sida på `/admin` med användaröversikt: antal registrerade konton, totalt antal abonnemang, aktiva/avslutade. Syns bara för appägaren via UUID-baserad guard och dedikerade RLS-policies |

---

## Teknisk stack

| Verktyg | Version | Syfte |
|---|---|---|
| React | 19 | UI-ramverk, funktionella komponenter med hooks |
| TypeScript | 6 | Strikt typning end-to-end — inga `any` |
| Vite | 8 | Byggverktyg med snabb HMR och ESM-baserat flöde |
| Tailwind CSS | 4 | Utility-first CSS, alla designtokens inline i className |
| React Router | 7 | Klientbaserad routing med Outlet-mönster |
| @tanstack/react-query | 5 | Server state — useQuery/useMutation med automatisk cache-invalidering |
| @supabase/supabase-js | 2 | Typat klient-API mot Postgres, hanterar auth och queries |
| lucide-react | — | Konsekventa SVG-ikoner i nav, knappar och detaljvyer |
| Vercel | — | Edge-deploy av den statiska bundlen |

---

## Arkitektur

Subtrack är en klassisk **SPA (Single-Page Application)** med Supabase som backend-as-a-service. All affärslogik körs client-side i TypeScript — det finns ingen separat server eller API. Klienten pratar direkt med Supabase via en anon-nyckel och Row Level Security styr åtkomsten på databasnivå.

```
┌─────────────────────────────────────────────────────┐
│  Presentationslager  (src/pages/, src/components/)  │
│  React-komponenter · Tailwind CSS · React Router    │
├─────────────────────────────────────────────────────┤
│  Datahämtningslager  (src/hooks/)                   │
│  @tanstack/react-query · useQuery · useMutation     │
├─────────────────────────────────────────────────────┤
│  Beräkningslager  (src/lib/calculations.ts)         │
│  Rena funktioner · prishistorik · månadsbelopp      │
├─────────────────────────────────────────────────────┤
│  Databas  (Supabase / Postgres)                     │
│  profiles · categories · subscriptions              │
│  price_history · notifications · RLS               │
└─────────────────────────────────────────────────────┘
```

**Dataflöde vid skrivoperation:**

1. Mutation anropas (t.ex. `useAddSubscription`)
2. Supabase JS kör `INSERT`/`UPDATE`/`DELETE` mot Postgres via RLS
3. `onSuccess` → `queryClient.invalidateQueries(QUERY_KEY)`
4. React Query hämtar ny data automatiskt
5. UI uppdateras reaktivt utan sidladdning

---

## Projektstruktur

```
subtrack/
├── src/
│   ├── components/
│   │   ├── layout/
│   │   │   ├── AppLayout.tsx          # Skal: auth-guard, sidebar/bottom nav, add-modal
│   │   │   ├── TopBar.tsx             # Logo, användarinfo, lägg till-knapp
│   │   │   ├── Sidebar.tsx            # Desktop-navigation (188px)
│   │   │   ├── BottomNav.tsx          # Mobil bottom navigation
│   │   │   └── NavIcons.tsx           # Delade lucide-ikoner för nav
│   │   ├── subscriptions/
│   │   │   ├── SubscriptionList.tsx   # Listvy (mobil) + tabell (desktop)
│   │   │   ├── SubscriptionRow.tsx    # Enskild rad
│   │   │   ├── SubscriptionDetail.tsx # Detaljpanel med prishistorik
│   │   │   └── AddSubscriptionModal.tsx # 2-stegsformulär (info → bekräfta)
│   │   ├── cost/
│   │   │   ├── CostView.tsx           # Kostnadssida med kategorifilter
│   │   │   ├── BarChart.tsx           # Månadsbar, exporterar getAmountForMonth
│   │   │   └── CategoryBreakdown.tsx  # Kostnad per kategori
│   │   ├── notifications/
│   │   │   └── NotificationList.tsx   # Kommande + historik
│   │   ├── settings/
│   │   │   └── SettingsView.tsx       # Profilinfo och kategorier
│   │   └── ui/
│   │       ├── Badge.tsx
│   │       ├── Button.tsx
│   │       ├── Input.tsx
│   │       ├── Modal.tsx
│   │       └── StatCard.tsx
│   ├── hooks/
│   │   ├── useSubscriptions.ts        # CRUD + useAddPriceHistory + useDeletePriceHistory
│   │   ├── useCategories.ts
│   │   ├── useNotifications.ts
│   │   ├── useAuth.ts
│   │   ├── useTheme.ts                # Temabyte light/dark, localStorage-persistens
│   │   └── useAdmin.ts                # ADMIN_ID, useIsAdmin, useAdminUsers
│   ├── lib/
│   │   ├── supabase.ts                # Initialiserad Supabase-klient
│   │   ├── calculations.ts            # Beräkningsfunktioner (se nedan)
│   │   └── dates.ts                   # Datumhjälpare
│   ├── pages/
│   │   ├── Dashboard.tsx
│   │   ├── Cost.tsx
│   │   ├── Notifications.tsx
│   │   ├── Settings.tsx
│   │   ├── About.tsx                  # Om appen
│   │   ├── Admin.tsx                  # Dold admin-vy, åtkomst via UUID-guard
│   │   ├── Login.tsx
│   │   └── AuthCallback.tsx
│   ├── types/
│   │   └── index.ts                   # TypeScript-typer för alla entiteter
│   ├── App.tsx                        # Router + QueryClientProvider
│   └── main.tsx
├── public/
│   ├── icon.svg                       # App-ikon (PWA + favicon)
│   └── manifest.json                  # PWA-manifest
├── supabase/
│   └── migrations/
│       └── 001_initial_schema.sql
├── index.html
├── vite.config.ts
├── tailwind.config.ts
├── tsconfig.json
├── vercel.json
└── .env.local                         # Ej incheckad — se Miljövariabler
```

---

## Databasmodell

Postgres via Supabase. Row Level Security aktiverat på samtliga tabeller.

### `profiles`

Skapas automatiskt via en Postgres-trigger (`handle_new_user`) när en ny användare loggar in med Google. Speglar `auth.users` med namn och avatar.

```sql
create table profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  email       text not null,
  full_name   text,
  avatar_url  text,
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);
```

### `categories`

Användarskapade kategorier. Standardkategorier (Streaming, Mjukvara, Musik etc.) skapas via seed-funktion vid registrering.

```sql
create table categories (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references profiles(id) on delete cascade,
  name        text not null,
  color_hex   text default '#6B7280',
  sort_order  int default 0,
  created_at  timestamptz default now()
);
```

### `subscriptions`

Kärntabellen. `amount` är grundpriset när abonnemanget lades till. Faktisk aktuell kostnad beräknas via `price_history`.

```sql
create table subscriptions (
  id                   uuid primary key default gen_random_uuid(),
  user_id              uuid not null references profiles(id) on delete cascade,
  category_id          uuid references categories(id) on delete set null,
  name                 text not null,
  amount               numeric(10,2) not null,
  currency             text default 'SEK',
  interval             text not null check (interval in ('month','quarter','year')),
  interval_count       int default 1,
  start_date           date not null,
  end_date             date,
  status               text default 'active' check (status in ('active','paused','cancelled')),
  reminder_days_before int default 3,
  notes                text,
  created_at           timestamptz default now(),
  updated_at           timestamptz default now()
);
```

### `price_history`

Varje prisändring loggas här. Unikt constraint på `(subscription_id, effective_from)` förhindrar dubletter.

```sql
create table price_history (
  id               uuid primary key default gen_random_uuid(),
  subscription_id  uuid not null references subscriptions(id) on delete cascade,
  amount           numeric(10,2) not null,
  interval         text not null,
  effective_from   date not null,
  created_at       timestamptz default now(),
  unique (subscription_id, effective_from)
);
```

### `notifications`

Schemalagda och skickade påminnelser. `is_read` markeras när användaren öppnar notisfliken.

```sql
create table notifications (
  id               uuid primary key default gen_random_uuid(),
  user_id          uuid not null references profiles(id) on delete cascade,
  subscription_id  uuid references subscriptions(id) on delete cascade,
  type             text not null check (type in ('renewal_reminder','price_change','cancelled')),
  scheduled_at     timestamptz not null,
  sent_at          timestamptz,
  is_read          boolean default false,
  created_at       timestamptz default now()
);
```

### RLS-policies (exempel)

```sql
-- Aktivera RLS
alter table subscriptions enable row level security;

-- Användare ser och ändrar bara sina egna rader
create policy "Users manage own subscriptions"
  on subscriptions using (auth.uid() = user_id);

-- price_history saknar direkt user_id — kontrolleras via subscriptions
create policy "Users read own price history"
  on price_history for select
  using (
    exists (
      select 1 from subscriptions s
      where s.id = price_history.subscription_id
        and s.user_id = auth.uid()
    )
  );
```

### Trigger — skapa profil vid Google-login

```sql
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
```

---

## Beräkningslogik

All beräkningslogik bor i `src/lib/calculations.ts` som rena, testbara funktioner.

### `toMonthlyAmount(amount, interval, intervalCount)`

Normaliserar ett belopp till kr/månad för att kunna jämföra abonnemang med olika intervall.

```typescript
function toMonthlyAmount(amount: number, interval: string, intervalCount: number): number {
  const periodsPerYear = { month: 12, quarter: 4, year: 1 }
  const periods = periodsPerYear[interval] / intervalCount
  return (amount * periods) / 12
}
// Årsabonnemang 1 200 kr → 100 kr/mån
// Kvartalsabonnemang 300 kr → 100 kr/mån
```

### `getEffectiveCurrentAmount(subscription)`

Returnerar det pris som gäller idag. Söker i `price_history` efter den senaste posten vars `effective_from` är ≤ dagens datum.

```typescript
function getEffectiveCurrentAmount(subscription: Subscription): number {
  if (!subscription.price_history?.length) return subscription.amount
  const today = new Date()
  const sorted = [...subscription.price_history].sort(
    (a, b) => new Date(b.effective_from).getTime() - new Date(a.effective_from).getTime()
  )
  const latest = sorted.find(ph => new Date(ph.effective_from) <= today)
  return latest ? latest.amount : subscription.amount
}
```

### `getAmountForMonth(subscription, year, month)`

Returnerar det historiskt korrekta priset för en specifik månad. Används av stapeldiagrammet.

### `calculateTotalPaid(subscription)`

Beräknar totalt betalt belopp sedan startdatum med hänsyn till prishistoriken. Itererar prisperioderna kronologiskt och multiplicerar perioder × belopp.

---

## Säkerhet & RLS

- **Row Level Security** på samtliga tabeller — Postgres kontrollerar åtkomsten, inte applikationskoden.
- **`auth.uid() = user_id`** — varje policy verifierar att inloggad användares UUID matchar radägaren.
- **Kaskaderad åtkomst** — `price_history` saknar direkt `user_id` men skyddas via `EXISTS`-subquery mot `subscriptions`.
- **Anon-nyckel** — klienten använder anon-nyckeln som aldrig kan kringgå RLS. Service role-nyckeln används aldrig i klientkoden.
- **OAuth via Supabase Auth** — inga lösenord lagras. Google hanterar autentiseringen och skickar en JWT som Supabase validerar. Sessions uppdateras automatiskt.
- **Admin-policies** — separata RLS-policies på `profiles` och `subscriptions` ger appägaren läsrättigheter till alla användares data. Skyddet är tvålager: UUID-jämförelse i React-guarden (`user.id === ADMIN_ID`) och Postgres-policies som matchar samma UUID.

---

## Responsiv design & PWA

Breakpoint: `md` (768 px). Under = mobil, över = desktop.

| | Mobil | Desktop |
|---|---|---|
| Navigation | Bottom nav med 5 flikar | Sidebar (188px) |
| Lägg till | Full-width knapp ovanför nav | Knapp i topbaren |
| Detaljvy/modal | Fullskärm, X-knapp | Fast bredd (480–560px), X-knapp |
| Stapeldiagram | Låg höjd (80px) | Hög höjd (240px) |
| Safe area | `env(safe-area-inset-top/bottom)` | N/A |
| Input-zoom | 16px font-size (ingen iOS-zoom) | 13px |

**Installera som app på iOS:**
1. Öppna appen i Safari
2. Tryck dela-knappen → "Lägg till på hemskärmen"
3. Appen startar i standalone-läge med Subtrack-ikon och blå statusbar

---

## Demo-läge

Inloggningssidan erbjuder en "Utforska demo"-knapp för den som vill prova appen utan att skapa ett konto eller konfigurera Supabase.

### Vad ingår i demon

| Abonnemang | Kategori | Kostnad | Status |
|---|---|---|---|
| Netflix | Streaming | 219 kr/mån | Aktiv — prishistorik i 4 steg |
| Spotify | Musik | 135 kr/mån | Aktiv — prishistorik i 3 steg |
| Adobe Creative Cloud | Mjukvara | 699 kr/mån | Aktiv |
| iCloud+ 50 GB | Lagring | 12 kr/mån | Aktiv |
| GitHub Pro | Mjukvara | 99 kr/mån | Aktiv |
| Microsoft 365 | Produktivitet | 1 149 kr/år | Aktiv |
| Headspace | Hälsa | 79 kr/mån | Pausad |
| HBO Max | Streaming | 89 kr/mån | Avslutad |

Startdatumen är valda så att notiser-vyn visar flera kommande förnyelser (2–18 dagar) och historikposter.

### Hur det fungerar tekniskt

Demo-läget kräver inga ändringar i Supabase-konfigurationen och gör inga nätverksanrop alls.

```
src/lib/demoData.ts          — hårdkodad data (subscriptions, categories, price_history)
src/contexts/DemoContext.tsx — isDemoMode, enterDemo(), exitDemo()
```

**Flöde när användaren klickar "Utforska demo":**

1. `enterDemo()` injicerar exempeldatan i React Query-cachen via `queryClient.setQueryData`
2. Datahookarna (`useSubscriptions`, `useCategories`) har `enabled: !isDemoMode` — inga Supabase-anrop sker
3. Auth-vakten i `AppLayout` kontrollerar `isDemoMode` och låter användaren passera utan session
4. Alla mutationer (lägg till, redigera, ta bort) uppdaterar enbart React Query-cachen med `setQueryData`
5. En amber-banner indikerar demo-läget; "Logga in"-knappen i topbaren anropar `exitDemo()` som rensar cachen och skickar tillbaka till `/login`

Data lever enbart i minnet — inget sparas i `localStorage` eller cookies. Stäng fliken och allt är borta.

Demoanvändaren **Alex Svensson** visas med indigo-avatar och namn i topbaren och i inställningarnas profilkort (e-post: demo@subtrack.app). "Logga in"-knappen i profilen anropar `exitDemo()`.

---

## Tillgänglighet

Subtrack är byggt med **WCAG 2.1 AA** som riktlinje och DOS-lagen (Lagen om tillgänglighet till digital offentlig service) som referens. Samtliga åtgärder är implementerade och testbara med tangentbord, skärmläsare och DevTools.

| Område | Implementerat |
|---|---|
| **Skip-länk** | Dold länk ("Hoppa till innehåll") dyker upp vid `Tab`-fokus och hoppar förbi sidnavigationen |
| **Sidtitlar** | `document.title` uppdateras per sida via `usePageTitle`-hook — t.ex. "Kostnad – Subtrack" |
| **Rubrikhierarki** | En `<h1>` per sida (synlig eller `sr-only`), `<h2>` för alla sektionsrubriker |
| **Tangentbord** | Alla rader, knappar och stapeldiagram-staplar är nåbara med `Tab`, aktiverbara med `Enter`/`Mellanslag` |
| **Fokushantering i modaler** | `useFocusTrap`-hook fångar fokus inuti öppna modaler och återgår till utlösande element vid stängning |
| **Modalsemantik** | `role="dialog"`, `aria-modal="true"`, `aria-labelledby` på alla tre modaler |
| **Felmeddelanden** | `role="alert"` på valideringsfel i formulär — skärmläsare läser upp dem automatiskt |
| **Laddningsstatus** | `role="status"` på laddningstexter för polite uppläsning |
| **ARIA-states** | `aria-expanded` på kollapsibla avsnitt, `aria-pressed` på filterknappar, `aria-hidden` på dekorativa ikoner |
| **Stapeldiagram** | Staplarna är `<button>`-element med `aria-label` per stapel; behållaren har `role="img"` med beskrivande etikett |
| **Tabellstruktur** | `scope="col"` på alla `<th>` i abonnemangstabellen och admintabellen |
| **Fokusring** | `:focus-visible` genomgående — synlig blå kontur vid tangentbord, ingen vid musklick |
| **Färgkontrast** | Alla textstorlekar uppfyller 4,5:1 mot bakgrunden i både ljust och mörkt läge |

### Tekniska detaljer

- **`src/hooks/useFocusTrap.ts`** — återanvändbar hook för alla modaler; hanterar synlighetsdetektering via `offsetWidth`/`offsetHeight`/`getClientRects()`
- **`src/hooks/usePageTitle.ts`** — sätter `document.title` och återställer till "Subtrack" vid avmontering
- Ikoner från `lucide-react` renderas med `aria-hidden="true"` när de används bredvid text

### Känd begränsning

Inloggningsflödet använder Googles OAuth-dialog vars tillgänglighetsimplementering kontrolleras av Google.

---

## Komma igång

### Förutsättningar

- Node.js ≥ 18
- Ett Supabase-projekt (gratis tier räcker)
- Ett Google Cloud-projekt med OAuth 2.0-klient

### Installation

```bash
# Klona repot
git clone https://github.com/dittnamn/subtrack.git
cd subtrack

# Installera beroenden
npm install

# Skapa miljövariabelfil
cp .env.example .env.local
# Fyll i dina Supabase-nycklar (se nedan)

# Starta dev-servern
npm run dev
```

Appen är nu tillgänglig på [http://localhost:5173](http://localhost:5173).

### Tillgängliga kommandon

```bash
npm run dev       # Startar Vite dev-server med HMR
npm run build     # TypeScript-check + produktionsbuild till dist/
npm run preview   # Förhandsgranska produktionsbundlen lokalt
npm run lint      # ESLint på hela kodbasen
```

---

## Miljövariabler

Skapa en `.env.local` i projektroten (checkas aldrig in):

```bash
VITE_SUPABASE_URL=https://xxxxxxxxxxxxxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGci...
```

Hämta värdena från Supabase Dashboard → Project Settings → API.

> **OBS:** Använd `.supabase.co` (inte `.supabase.com`) i URL:en.

---

## Supabase — setup

### 1. Skapa projekt

Skapa ett nytt projekt på [supabase.com](https://supabase.com). Välj EU-region för GDPR.

### 2. Kör migrationen

Öppna Supabase Dashboard → SQL Editor och kör innehållet i `supabase/migrations/001_initial_schema.sql`. Det skapar samtliga tabeller, RLS-policies och triggern.

### 3. Aktivera Google OAuth

1. Gå till Authentication → Providers → Google
2. Aktivera Google-providern
3. Skapa OAuth 2.0-klient i [Google Cloud Console](https://console.cloud.google.com)
   - Authorized JavaScript origins: `https://ditt-projekt.supabase.co`
   - Authorized redirect URIs: `https://ditt-projekt.supabase.co/auth/v1/callback`
4. Klistra in Client ID och Client Secret i Supabase

### 4. Konfigurera Site URL

Authentication → URL Configuration:
- Site URL: `https://din-vercel-url.vercel.app`
- Redirect URLs: `https://din-vercel-url.vercel.app/auth/callback`

Lägg även till `http://localhost:5173/auth/callback` för lokal utveckling.

---

## Bygga & driftsätta

### Produktionsbuild

```bash
npm run build
# Outputtar till dist/
```

### Deploy till Vercel

1. Pusha repot till GitHub
2. Importera projektet på [vercel.com](https://vercel.com)
3. Lägg till miljövariabler i Vercel Dashboard:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
4. Vercel hämtar `vercel.json` automatiskt och sätter upp SPA-rewrites:

```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

Varje push till `main` triggar en ny deploy automatiskt.

---

## Designsystem

Subtrack följer ett strikt designsystem definierat i `CLAUDE.md`. Alla färger exponeras som CSS-variabler i `src/index.css` och Tailwind-klasser refererar till dem via `bg-[var(--c-xxx)]` / `text-[var(--c-xxx)]`.

### Temabyte (mörkt läge)

Temat sätts med `data-theme="dark"` på `<html>`-elementet. En inline `<script>` i `index.html` applicerar rätt tema synkront innan React mountas för att undvika flimmer. `useTheme`-hooken hanterar toggle + `localStorage`-persistens och faller tillbaka på `prefers-color-scheme` om inget sparat val finns.

### Färgpalett (CSS-variabler)

| CSS-variabel | Ljust läge | Mörkt läge | Användning |
|---|---|---|---|
| `--c-accent` | `#1B4FD8` | `#3B82F6` | Knappar, aktiva states |
| `--c-accent-subtle` | `#EFF6FF` | `#1E3A8A` | Hover-bakgrund, badge |
| `--c-bg-app` | `#F9FAFB` | `#0F172A` | Sidbakgrund |
| `--c-bg-card` | `#FFFFFF` | `#1E293B` | Kortkomponenter |
| `--c-bg-subtle` | `#F3F4F6` | `#334155` | Dividers, subtil bakgrund |
| `--c-text-primary` | `#111827` | `#F1F5F9` | Rubriker, primärtext |
| `--c-text-muted` | `#6B7280` | `#94A3B8` | Etiketter, metadata |
| `--c-text-subtle` | `#6B7280` | `#94A3B8` | Platshållare, hjälptext |
| `--c-border` | `#E5E7EB` | `#334155` | Borders |
| `--c-success-*` | grön | mörkgrön | Aktiv status |
| `--c-warning-*` | amber | mörk amber | Varning |
| `--c-danger-*` | röd | mörkröd | Fel, ta bort |

### Typsnitt

**Inter** (Google Fonts) · Vikter: 400, 500, 600 · Tracking: `−0.3px` till `−0.5px` på rubriker ≥ 18 px.

### Radier

| Storlek | Används för |
|---|---|
| 4 px | Badge, liten pill |
| 6 px | Knapp, input |
| 8 px | Intern kortkomponent |
| 10 px | Tjänsteikon |
| 12 px | Kort (card) |
| 16 px | Modal, sidopanel |

### Övergångar

Alla: `transition-all duration-150 ease-out` · Modal/panel: `duration-200`

---

*Byggd med React, TypeScript, Supabase & Vercel · 2026*
