# Subtrack — Claude Code instruktioner

## Vad är detta?

Subtrack är en webb-app för att hålla koll på löpande abonnemang. Användaren loggar in med Google, lägger till sina tjänster (Netflix, Spotify, iCloud etc.), ser total kostnad per månad/år, får påminnelser inför förnyelse och kan följa kostnadsutveckling per kategori över tid.

---

## Teknikstack

| Verktyg | Syfte |
|---|---|
| React + TypeScript | UI och logik |
| Vite | Byggverktyg |
| Tailwind CSS | Styling |
| Supabase | Databas (Postgres), auth, RLS |
| Google OAuth | Inloggning via Supabase Auth |
| Vercel | Deploy |

---

## Grafisk profil — följ detta exakt

### Typsnitt
- **Inter** från Google Fonts — importeras i `index.html`
- Vikter: 400 (brödtext), 500 (etiketter, nav), 600 (rubriker, siffror)
- Tracking: `-0.3px` till `-0.5px` på rubriker ≥ 18px

### Färgpalett
```
Accent (primär):   #1B4FD8   — knappar, aktiva states, accenter
Accent subtil:     #EFF6FF   — hover-bakgrund, badge-bakgrund blå
Text primär:       #111827
Text sekundär:     #6B7280
Text tertiär:      #9CA3AF
Bakgrund app:      #F9FAFB
Bakgrund kort:     #FFFFFF
Kantlinje:         #E5E7EB   (normal), #D1D5DB (input-focus-border)
Grön (aktiv):      #166534 text / #F0FDF4 bakgrund
Amber (varning):   #92400E text / #FFFBEB bakgrund
Röd (fel/ta bort): #B91C1C text / #FEF2F2 bakgrund
```

### Tailwind-klasser att använda konsekvent
```
Primärknapp:       bg-[#1B4FD8] text-white rounded-[6px] px-4 py-2 text-[13px] font-medium
Sekundärknapp:     bg-white border border-[#E5E7EB] text-[#374151] rounded-[6px] px-4 py-2 text-[13px]
Ghostknapp:        border border-[#1B4FD8] text-[#1B4FD8] rounded-[6px] px-4 py-2 text-[13px]
Fara-knapp:        bg-[#FEF2F2] text-[#B91C1C] rounded-[6px] px-4 py-2 text-[13px]
Input:             border border-[#D1D5DB] focus:border-[#1B4FD8] rounded-[6px] px-3 py-2 text-[13px] outline-none
Badge aktiv:       bg-[#F0FDF4] text-[#166534] text-[10px] font-medium px-1.5 py-0.5 rounded
Badge varning:     bg-[#FFFBEB] text-[#92400E] text-[10px] font-medium px-1.5 py-0.5 rounded
Badge fel:         bg-[#FEF2F2] text-[#B91C1C] text-[10px] font-medium px-1.5 py-0.5 rounded
Metrikkort:        bg-[#F9FAFB] rounded-lg p-3
Sidopanel nav:     text-[12px] text-[#6B7280] hover:bg-[#F9FAFB]
Aktiv nav:         bg-[#EFF6FF] text-[#1B4FD8] font-medium border-r-2 border-[#1B4FD8]
```

### Radier
```
4px  — badge, liten pill
6px  — knapp, input, tabellrad-hover
8px  — intern kortkomponent
10px — tjänsteikon
12px — kort (card)
16px — modal, sidopanel
```

### Övergångar
```
Alla: transition-all duration-150 ease-out
Modal/panel öppning: duration-200
```

---

## Databasmodell (Supabase / Postgres)

### Tabell: `users`
Hanteras automatiskt av Supabase Auth. En trigger skapar en rad i `profiles`-tabellen vid signup.

### Tabell: `profiles`
```sql
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  full_name text,
  avatar_url text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
alter table profiles enable row level security;
create policy "Users can read own profile" on profiles for select using (auth.uid() = id);
create policy "Users can update own profile" on profiles for update using (auth.uid() = id);
```

### Tabell: `categories`
```sql
create table categories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  name text not null,
  color_hex text default '#6B7280',
  sort_order int default 0,
  created_at timestamptz default now()
);
alter table categories enable row level security;
create policy "Users manage own categories" on categories using (auth.uid() = user_id);

-- Standardkategorier skapas via en trigger eller seed-funktion vid ny användare
```

### Tabell: `subscriptions`
```sql
create table subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  category_id uuid references categories(id) on delete set null,
  name text not null,
  amount numeric(10,2) not null,
  currency text default 'SEK',
  interval text not null check (interval in ('month','quarter','year')),
  interval_count int default 1,
  start_date date not null,
  end_date date,
  -- Manuellt angivet historikbelopp (låst, ej omräknat)
  legacy_amount_paid numeric(10,2),
  status text default 'active' check (status in ('active','paused','cancelled')),
  notes text,
  reminder_days_before int default 3,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
alter table subscriptions enable row level security;
create policy "Users manage own subscriptions" on subscriptions using (auth.uid() = user_id);
```

### Tabell: `price_history`
Sparar prisändringar. När `amount` ändras på en subscription skapas en ny rad här.
```sql
create table price_history (
  id uuid primary key default gen_random_uuid(),
  subscription_id uuid not null references subscriptions(id) on delete cascade,
  amount numeric(10,2) not null,
  interval text not null,
  effective_from date not null,
  created_at timestamptz default now()
);
alter table price_history enable row level security;
create policy "Users read own price history" on price_history for select
  using (exists (
    select 1 from subscriptions s
    where s.id = price_history.subscription_id and s.user_id = auth.uid()
  ));
```

### Tabell: `notifications`
```sql
create table notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  subscription_id uuid references subscriptions(id) on delete cascade,
  type text not null check (type in ('renewal_reminder','price_change','cancelled')),
  scheduled_at timestamptz not null,
  sent_at timestamptz,
  is_read boolean default false,
  created_at timestamptz default now()
);
alter table notifications enable row level security;
create policy "Users manage own notifications" on notifications using (auth.uid() = user_id);
```

---

## Beräkningslogik — total betalt

```typescript
// Normalisera belopp till kr/månad för jämförbarhet
function toMonthlyAmount(amount: number, interval: string, intervalCount: number): number {
  const periodsPerYear = { month: 12, quarter: 4, year: 1 }
  const periods = periodsPerYear[interval] / intervalCount
  return (amount * periods) / 12
}

// Beräkna totalt betalt för ett abonnemang
function calculateTotalPaid(subscription: Subscription): number {
  const {
    amount, interval, interval_count,
    start_date, legacy_amount_paid, price_history
  } = subscription

  const today = new Date()
  const start = new Date(start_date)

  // Om manuellt belopp finns — det är basen, sedan räknas från created_at
  if (legacy_amount_paid !== null) {
    const sinceAdded = calculatePeriodsBetween(subscription.created_at, today, interval, interval_count)
    return legacy_amount_paid + (sinceAdded * amount)
  }

  // Annars: räkna från startdatum med prishistorik
  // Iterera price_history kronologiskt, beräkna perioder per prisperiod
  return calculateFromPriceHistory(start, today, price_history, amount, interval, interval_count)
}
```

---

## Projektstruktur

```
subtrack/
├── src/
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Sidebar.tsx          # Desktop sidebar med nav
│   │   │   ├── BottomNav.tsx        # Mobil bottom navigation
│   │   │   └── TopBar.tsx           # Logorad + användarinfo
│   │   ├── subscriptions/
│   │   │   ├── SubscriptionList.tsx # Listvy (mobil) + tabell (desktop)
│   │   │   ├── SubscriptionRow.tsx  # Enskild rad i listan
│   │   │   ├── SubscriptionDetail.tsx # Detaljpanel/skärm
│   │   │   └── AddSubscriptionModal.tsx # 3-stegsformulär
│   │   ├── cost/
│   │   │   ├── CostView.tsx         # Kostnadssida
│   │   │   ├── BarChart.tsx         # Månadsbar-komponent
│   │   │   └── CategoryBreakdown.tsx
│   │   ├── notifications/
│   │   │   └── NotificationList.tsx
│   │   └── ui/
│   │       ├── Badge.tsx
│   │       ├── Button.tsx
│   │       ├── Input.tsx
│   │       ├── Modal.tsx
│   │       └── StatCard.tsx
│   ├── hooks/
│   │   ├── useSubscriptions.ts      # CRUD + beräkningar
│   │   ├── useCategories.ts
│   │   ├── useNotifications.ts
│   │   └── useAuth.ts
│   ├── lib/
│   │   ├── supabase.ts              # Supabase-klient
│   │   ├── calculations.ts          # toMonthlyAmount, calculateTotalPaid
│   │   └── dates.ts                 # Datumhjälpare
│   ├── types/
│   │   └── index.ts                 # TypeScript-typer för alla entiteter
│   ├── pages/
│   │   ├── Dashboard.tsx            # Hem/översikt
│   │   ├── Cost.tsx
│   │   ├── Notifications.tsx
│   │   └── Settings.tsx
│   ├── App.tsx
│   └── main.tsx
├── supabase/
│   └── migrations/
│       └── 001_initial_schema.sql   # All SQL ovan samlad
├── public/
├── index.html
├── vite.config.ts
├── tailwind.config.ts
├── tsconfig.json
└── .env.local                       # VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY
```

---

## UX-flöde

### Mobil
- Bottom navigation: Hem / Kostnad / Notiser / Inställningar
- Detaljvy öppnar som fullskärm (slide-in från höger)
- FAB-knapp längst ner för att lägga till abonnemang

### Desktop
- Sidebar (188px) till vänster med navigationslänkar
- Master/detail: lista till vänster, detaljer i höger panel (220px)
- Lägg till via modal (3 steg)

### Formulärflöde — lägg till abonnemang (3 steg)
1. **Grundinfo**: namn, kategori, kostnad, intervall, startdatum, bindningstid, påminnelse
2. **Historik**: fråga om manuellt belopp finns (ja → textfält, nej → autoberäkning visas)
3. **Bekräfta**: sammanfattning + valfri kommentar → spara

### Responsivitet
- Breakpoint: `md` (768px) — under = mobil, över = desktop
- Använd `useMediaQuery` hook eller Tailwind `md:` prefix genomgående

---

## Auth-flöde

```typescript
// Supabase Google OAuth
const { error } = await supabase.auth.signInWithOAuth({
  provider: 'google',
  options: {
    redirectTo: `${window.location.origin}/auth/callback`
  }
})

// Trigger som skapar profil vid signup
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

## Miljövariabler

```bash
# .env.local
VITE_SUPABASE_URL=https://xxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGci...
```

---

## Vercel-deploy

```json
// vercel.json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

---

## Prioritetsordning — bygg i denna ordning

1. Supabase-projekt + schema (migrations)
2. Google Auth + callback-route + profil-trigger
3. Supabase-klient + TypeScript-typer
4. Layout: Sidebar + BottomNav + TopBar (responsiv)
5. SubscriptionList + SubscriptionRow (läs från DB)
6. AddSubscriptionModal (3-stegsformulär, skriv till DB)
7. SubscriptionDetail (visa + redigera + ta bort)
8. Beräkningslogik (totalPaid, monthlyAmount)
9. CostView + BarChart
10. NotificationList
11. Settings-sida (profilinfo, kategorier)
12. Vercel-deploy + env-variabler i Vercel dashboard

---

## Kodinstruktioner

- Använd **alltid TypeScript** — inga `any`
- Alla Supabase-anrop ska hantera `error` explicit
- Använd `React Query` (`@tanstack/react-query`) för data-fetching och cache
- Komponenter ska vara funktionella med hooks
- Undvik inline styles — använd Tailwind-klasser
- Alla datum hanteras som `Date`-objekt internt, ISO-strängar mot Supabase
- `toMonthlyAmount()` och `calculateTotalPaid()` ska ligga i `lib/calculations.ts` och testas separat
