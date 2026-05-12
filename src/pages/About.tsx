import { Database, Shield, Server, Smartphone, Globe, Code2, Layers, Calculator, Bell, RefreshCw, Lock, MonitorPlay, Eye } from 'lucide-react'
import { usePageTitle } from '../hooks/usePageTitle'

export default function About() {
  usePageTitle('Om appen')
  return (
    <div className="max-w-3xl mx-auto px-4 py-8 pb-16 space-y-12">

      {/* Hero */}
      <section>
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 bg-[var(--c-accent)] rounded-[10px] flex items-center justify-center shrink-0">
            <Code2 size={20} color="white" strokeWidth={2} />
          </div>
          <div>
            <h1 className="text-[22px] font-semibold text-[var(--c-text-primary)] tracking-[-0.4px]">Om Subtrack</h1>
            <p className="text-[13px] text-[var(--c-text-muted)]">Version 1.0 · Byggd 2026</p>
          </div>
        </div>
        <p className="text-[14px] text-[var(--c-text-secondary)] leading-relaxed">
          Subtrack är en personlig webb-app för att hålla koll på löpande abonnemang och prenumerationer. Den löser ett konkret problem: det är lätt att tappa koll på vilka tjänster man betalar för, vad de kostar i dag jämfört med när man tecknade dem, och när de förnyas. Subtrack samlar allt på ett ställe — med fullständig prishistorik, kostnadstrend per kategori och automatiska påminnelser inför förnyelse.
        </p>
      </section>

      {/* Funktioner */}
      <section>
        <SectionHeader icon={<Layers size={16} strokeWidth={2} />} title="Funktioner" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
          <FeatureCard
            title="Abonnemangsöversikt"
            description="Se alla dina abonnemang normaliserade till kr/mån för enkel jämförelse — oavsett om de faktureras månadsvis, kvartalsvis eller årsvis. Klicka en kolumnrubrik (Tjänst, Kategori, Kr/mån, Förnyelse) för att sortera — en gång stigande, igen fallande."
          />
          <FeatureCard
            title="Tjänsteikoner"
            description="Automatisk logotyp för ~130 kända tjänster via favicon.im — Netflix, Spotify, Adobe, ChatGPT, Claude, svenska tidningar med mera. Faller tillbaka på initialerbricka för okända tjänster."
          />
          <FeatureCard
            title="Prishistorik"
            description="Spåra prisändringar över tid. Lägg till historiska priser för att se exakt vad du betalat sedan starten, inte bara nuvarande pris."
          />
          <FeatureCard
            title="Kostnadstrend"
            description="Stapeldiagram per månad och år med nedbrytning per kategori. Klicka en stapel för att öppna en detaljmodal med alla aktiva tjänster och deras individuella kostnader just den månaden — navigera månadsvis med pilknappar direkt i modalen (stäng med Esc)."
          />
          <FeatureCard
            title="Påminnelser"
            description="Automatiska notiser inför förnyelsedatum — konfigurerbart antal dagar i förväg per abonnemang. Historik visar skickade och lästa notiser."
          />
          <FeatureCard
            title="Kategorier"
            description="Organisera abonnemang i egna kategorier (Streaming, Mjukvara, Hälsa, etc.) med valfri färg. Standard­kategorier skapas automatiskt vid registrering."
          />
          <FeatureCard
            title="Responsiv design"
            description="Fungerar lika bra på mobil som desktop. Bottom nav alltid sticky (h-dvh) på mobil, sidebar på desktop. Modaler har samma inre layout på båda — centrerad titel och X-knapp, fast bredd på desktop, fullskärm på mobil."
          />
          <FeatureCard
            title="PWA / Hemskärm"
            description="Kan installeras som en app direkt från Safari på iOS eller Chrome på Android. Körs i standalone-läge utan webbläsarens krom."
          />
          <FeatureCard
            title="Google-inloggning"
            description="Autentisering via Google OAuth — inga separata lösenord att hantera. Profil­bild och namn hämtas automatiskt från Google-kontot."
          />
          <FeatureCard
            title="Exportera CSV"
            description="Ladda ner alla abonnemang som en CSV-fil med ett klick — knappen finns i filtreringsraden på översiktssidan. Filen öppnas direkt i Excel med rätt teckenkodning (UTF-8 BOM, semikolonavgränsning) och innehåller tjänst, kategori, belopp, intervall, kr/mån, status, startdatum, nästa förnyelse och anteckningar."
          />
          <FeatureCard
            title="Demo-läge"
            description="Prova appen utan att skapa ett konto. Hårdkodad exempeldata med 8 abonnemang och en demoanvändare (Alex Svensson) med avatar och namn i topbaren. Alla skrivoperationer fungerar men sparas bara i minnet."
          />
          <FeatureCard
            title="Mörkt läge"
            description="Fullt mörkt tema med CSS-variabler. Växla i inställningar — valet sparas i localStorage och systempreferens används som standard."
          />
          <FeatureCard
            title="Admin-vy"
            description="Dold sida på /admin med en översikt av alla registrerade användare: antal konton, abonnemang, aktiva och avslutade. Syns bara för appägaren via en UUID-baserad React-guard kombinerad med dedikerade RLS-policies i Postgres."
          />
          <FeatureCard
            title="Tillgänglighet"
            description="Byggt enligt WCAG 2.1 AA — tangentbordsnavigering, fokushantering i modaler, ARIA-attribut för skärmläsare, korrekt rubrikhierarki och färgkontrast ≥ 4,5:1 i både ljust och mörkt läge."
          />
        </div>
      </section>

      {/* Teknisk stack */}
      <section>
        <SectionHeader icon={<Code2 size={16} strokeWidth={2} />} title="Teknisk stack" />
        <div className="mt-4 space-y-2">
          <TechRow name="React 18" role="UI-ramverk" detail="Funktionella komponenter med hooks genomgående. Ingen klass-komponent i kodbasen." />
          <TechRow name="TypeScript" role="Typning" detail="Strikt typning end-to-end — inga `any`, alla Supabase-svar typas via genererade typer." />
          <TechRow name="Vite" role="Byggverktyg" detail="Snabb HMR under utveckling, optimerad bundle vid byggning. ESM-baserat flöde." />
          <TechRow name="Tailwind CSS v3" role="Styling" detail="Utility-first CSS utan en enda extern stylesheet. Designtoken­er inline i className-strängar." />
          <TechRow name="React Router v7" role="Routing" detail="Outlet-mönster för nested routes med AppLayout som skal runt alla autentiserade sidor." />
          <TechRow name="@tanstack/react-query v5" role="Data-fetching" detail="Server state hanteras med useQuery/useMutation. Cache invalideras vid varje skriv­operation via queryClient.invalidateQueries." />
          <TechRow name="Supabase JS v2" role="Databas­klient" detail="Typat klient-API mot Postgres. Hanterar auth, real-time och direkt SQL-frågor via .from().select()." />
          <TechRow name="lucide-react" role="Ikoner" detail="Konsekventa SVG-ikoner med justerbar size och strokeWidth. Används i nav, knappar och detaljvyer." />
          <TechRow name="Vercel" role="Hosting" detail="Edge-deploy av den statiska bundlen. SPA-rewrites i vercel.json skickar alla sökvägar till index.html." />
        </div>
      </section>

      {/* Arkitektur */}
      <section>
        <SectionHeader icon={<Layers size={16} strokeWidth={2} />} title="Arkitektur" />
        <p className="text-[13px] text-[var(--c-text-secondary)] leading-relaxed mt-3 mb-4">
          Subtrack är en klassisk SPA (Single-Page Application) med ett tunt klientlager ovanpå Supabase som backend-as-a-service. All affärslogik (beräkningar, prishistorik, totaler) körs client-side i TypeScript. Det finns ingen separat server eller API — klienten pratar direkt med Supabase via en anon-nyckel och Row Level Security styr åtkomsten.
        </p>
        <div className="bg-[var(--c-bg-app)] rounded-[12px] border border-[var(--c-border)] p-4 space-y-4">
          <ArchLayer
            label="Presentationslager"
            variant="blue"
            items={['src/pages/ — sidkomponenter (Dashboard, Cost, Notifications, Settings, About)', 'src/components/layout/ — AppLayout, TopBar, Sidebar, BottomNav', 'src/components/subscriptions/ — list, row, detail, modal', 'src/components/cost/ — CostView, BarChart, CategoryBreakdown', 'src/components/ui/ — Button, Badge, Input, Modal, StatCard']}
          />
          <ArchLayer
            label="Datahämtnings­lager"
            variant="green"
            items={['src/hooks/useSubscriptions.ts — CRUD + useAddPriceHistory + useDeletePriceHistory', 'src/hooks/useCategories.ts — kategorier med CRUD', 'src/hooks/useNotifications.ts — läs + markera som läst', 'src/hooks/useAuth.ts — session, login, logout']}
          />
          <ArchLayer
            label="Beräknings­lager"
            variant="amber"
            items={['src/lib/calculations.ts — toMonthlyAmount, calculateTotalPaid, getEffectiveCurrentAmount, getAmountForMonth', 'src/lib/dates.ts — datumhjälpare', 'src/lib/supabase.ts — initialiserad Supabase-klient']}
          />
          <ArchLayer
            label="Databas (Supabase / Postgres)"
            variant="red"
            items={['profiles, categories, subscriptions, price_history, notifications', 'Row Level Security på samtliga tabeller', 'Trigger: handle_new_user skapar profil vid Google-login']}
          />
        </div>
      </section>

      {/* Databasmodell */}
      <section>
        <SectionHeader icon={<Database size={16} strokeWidth={2} />} title="Databasmodell" />
        <p className="text-[13px] text-[var(--c-text-muted)] mt-2 mb-4">Postgres via Supabase. Alla tabeller har Row Level Security aktiverat.</p>

        <div className="space-y-4">
          <TableCard
            name="profiles"
            description="Skapas automatiskt via en Postgres-trigger (handle_new_user) när en ny användare loggar in med Google. Speglar auth.users med namn och avatar."
            columns={[
              { col: 'id', type: 'uuid PK', note: 'Refererar till auth.users(id)' },
              { col: 'email', type: 'text', note: '' },
              { col: 'full_name', type: 'text', note: 'Från Google-kontot' },
              { col: 'avatar_url', type: 'text', note: 'Från Google-kontot' },
              { col: 'created_at', type: 'timestamptz', note: '' },
            ]}
          />
          <TableCard
            name="categories"
            description="Användarskapade kategorier för att gruppera abonnemang. Standard­kategorier (Streaming, Mjukvara, Musik etc.) skapas via seed-funktion vid registrering."
            columns={[
              { col: 'id', type: 'uuid PK', note: '' },
              { col: 'user_id', type: 'uuid FK → profiles', note: 'RLS-ankare' },
              { col: 'name', type: 'text', note: '' },
              { col: 'color_hex', type: 'text', note: "Default '#6B7280'" },
              { col: 'sort_order', type: 'int', note: 'Sorteringsordning' },
            ]}
          />
          <TableCard
            name="subscriptions"
            description="Kärntabellen. Varje rad är ett abonnemang med namn, belopp, intervall och status. amount är det nuvarande grundpriset; faktisk aktuell kostnad beräknas via price_history."
            columns={[
              { col: 'id', type: 'uuid PK', note: '' },
              { col: 'user_id', type: 'uuid FK → profiles', note: 'RLS-ankare' },
              { col: 'category_id', type: 'uuid FK → categories', note: 'Nullable' },
              { col: 'name', type: 'text', note: '' },
              { col: 'amount', type: 'numeric(10,2)', note: 'Grund/startpris' },
              { col: 'currency', type: 'text', note: "Default 'SEK'" },
              { col: 'interval', type: "text CHECK ('month','quarter','year')", note: '' },
              { col: 'interval_count', type: 'int', note: 'Ex. 1 = varje månad, 3 = var 3:e' },
              { col: 'start_date', type: 'date', note: 'Abonnemangets startdatum' },
              { col: 'end_date', type: 'date', note: 'Bindningstidens slut, nullable' },
              { col: 'status', type: "text CHECK ('active','paused','cancelled')", note: '' },
              { col: 'reminder_days_before', type: 'int', note: 'Default 3 dagar' },
              { col: 'notes', type: 'text', note: 'Valfri kommentar' },
            ]}
          />
          <TableCard
            name="price_history"
            description="Varje prisändring loggas här. Unikt constraint på (subscription_id, effective_from) förhindrar dubletter. getEffectiveCurrentAmount() hittar senaste posten ≤ idag för att visa rätt pris."
            columns={[
              { col: 'id', type: 'uuid PK', note: '' },
              { col: 'subscription_id', type: 'uuid FK → subscriptions', note: '' },
              { col: 'amount', type: 'numeric(10,2)', note: 'Priset från detta datum' },
              { col: 'interval', type: 'text', note: 'Intervallet vid detta pris' },
              { col: 'effective_from', type: 'date', note: 'UNIQUE per subscription_id' },
            ]}
          />
          <TableCard
            name="notifications"
            description="Schemalagda och skickade påminnelser. Genereras när ett abonnemang är X dagar från förnyelse. is_read markeras när användaren öppnar notisfliken."
            columns={[
              { col: 'id', type: 'uuid PK', note: '' },
              { col: 'user_id', type: 'uuid FK → profiles', note: 'RLS-ankare' },
              { col: 'subscription_id', type: 'uuid FK → subscriptions', note: 'Nullable vid radering' },
              { col: 'type', type: "text CHECK ('renewal_reminder','price_change','cancelled')", note: '' },
              { col: 'scheduled_at', type: 'timestamptz', note: '' },
              { col: 'sent_at', type: 'timestamptz', note: 'Null = ej skickad' },
              { col: 'is_read', type: 'boolean', note: 'Default false' },
            ]}
          />
        </div>
      </section>

      {/* Säkerhet */}
      <section>
        <SectionHeader icon={<Shield size={16} strokeWidth={2} />} title="Säkerhet & dataisolering" />
        <div className="mt-4 space-y-3">
          <p className="text-[13px] text-[var(--c-text-secondary)] leading-relaxed">
            Subtrack använder Supabase Row Level Security (RLS) för att garantera att varje användare bara kan läsa och skriva sin egen data — oavsett vad klienten skickar. RLS aktiveras på samtliga tabeller och policyn kontrolleras av Postgres, inte av applikationskoden.
          </p>
          <div className="bg-[var(--c-bg-app)] rounded-[10px] border border-[var(--c-border)] p-4 space-y-3">
            <SecurityItem
              icon={<Lock size={13} strokeWidth={2} color="var(--c-accent)" />}
              title="auth.uid() = user_id"
              detail="Varje RLS-policy kontrollerar att den inloggade användarens UUID matchar user_id-kolumnen. Ingen kan läsa en annan användares abonnemang, kategorier eller notiser."
            />
            <SecurityItem
              icon={<Lock size={13} strokeWidth={2} color="var(--c-accent)" />}
              title="Kaskaderad åtkomstkontroll på price_history"
              detail="price_history har ingen direkt user_id. Policyn använder en EXISTS-subquery mot subscriptions för att verifiera ägarskap — om subscription_id inte tillhör dig når du inte price_history-raden."
            />
            <SecurityItem
              icon={<Lock size={13} strokeWidth={2} color="var(--c-accent)" />}
              title="Anon-nyckel utan superrättigheter"
              detail="Klienten autentiserar med Supabase anon-nyckel. Den ger bara tillgång till det RLS tillåter. Service role-nyckeln (som kan kringgå RLS) används aldrig i klientkoden."
            />
            <SecurityItem
              icon={<Lock size={13} strokeWidth={2} color="var(--c-accent)" />}
              title="OAuth via Supabase Auth"
              detail="Inga lösenord lagras. Google hanterar autentiseringen och skickar en JWT till Supabase som validerar den. Sessions hanteras av Supabase med automatisk refresh."
            />
            <SecurityItem
              icon={<Lock size={13} strokeWidth={2} color="var(--c-accent)" />}
              title="Admin-guard i tvålager"
              detail="Admin-vyn skyddas både av en React-guard (user.id === ADMIN_ID) och av dedikerade RLS-policies i Postgres som matchar samma UUID. Ingen annan användare kan se eller hämta övriga användares profiler — varken via appen eller direkt mot Supabase."
            />
          </div>
        </div>
      </section>

      {/* Beräkningslogik */}
      <section>
        <SectionHeader icon={<Calculator size={16} strokeWidth={2} />} title="Beräkningslogik" />
        <p className="text-[13px] text-[var(--c-text-secondary)] leading-relaxed mt-3 mb-4">
          All beräkningslogik bor i <code className="bg-[var(--c-bg-subtle)] px-1.5 py-0.5 rounded text-[12px] text-[var(--c-text-primary)]">src/lib/calculations.ts</code>. Funktionerna är rena (inga sidoeffekter) och kan testas isolerat.
        </p>
        <div className="space-y-3">
          <CalcCard
            name="toMonthlyAmount(amount, interval, intervalCount)"
            description="Normaliserar ett belopp till kr/månad för att kunna jämföra abonnemang med olika intervall. Årsabonnemang på 1 200 kr ger 100 kr/månad. Kvartalsabonnemang på 300 kr ger också 100 kr/månad."
            formula="(amount × periodsPerYear[interval] / intervalCount) / 12"
          />
          <CalcCard
            name="getEffectiveCurrentAmount(subscription)"
            description="Returnerar det pris som gäller idag. Om price_history finns hittas den senaste posten vars effective_from ≤ dagens datum. Annars returneras subscription.amount (grundpriset)."
            formula="Senaste price_history.amount där effective_from ≤ today, annars subscription.amount"
          />
          <CalcCard
            name="getAmountForMonth(subscription, year, month)"
            description="Används av stapeldiagrammet för att visa det historiskt korrekta priset för en specifik månad. Söker i price_history efter den post som gällde just den månaden."
            formula="Senaste price_history.amount där effective_from ≤ månadens sista dag"
          />
          <CalcCard
            name="calculateTotalPaid(subscription)"
            description="Beräknar totalt betalt belopp sedan startdatum. Tar hänsyn till prishistoriken — om priset ändrades 2020-01-01 används det gamla priset för perioden dessförinnan och det nya för perioden efter."
            formula="Σ (perioder × belopp) per prisperiod, itererat kronologiskt"
          />
        </div>
      </section>

      {/* Påminnelser */}
      <section>
        <SectionHeader icon={<Bell size={16} strokeWidth={2} />} title="Påminnelse­system" />
        <p className="text-[13px] text-[var(--c-text-secondary)] leading-relaxed mt-3">
          Varje abonnemang har ett <strong>reminder_days_before</strong>-fält (default 3 dagar). Systemet beräknar nästa förnyelsedatum utifrån startdatum och intervall, och skapar en notis i <code className="bg-[var(--c-bg-subtle)] px-1.5 py-0.5 rounded text-[12px]">notifications</code>-tabellen med rätt <em>scheduled_at</em>. Notis­fliken i appen visar:
        </p>
        <ul className="mt-3 space-y-1.5 text-[13px] text-[var(--c-text-secondary)] list-none">
          <li className="flex gap-2"><span className="text-[var(--c-accent)] font-semibold shrink-0">·</span><span><strong>Kommande förnyelser</strong> — abonnemang som förnyas inom de närmaste 30 dagarna, sorterade på datum.</span></li>
          <li className="flex gap-2"><span className="text-[var(--c-accent)] font-semibold shrink-0">·</span><span><strong>Historik</strong> — tidigare notiser med information om vad som hände och när.</span></li>
          <li className="flex gap-2"><span className="text-[var(--c-accent)] font-semibold shrink-0">·</span><span><strong>Oläst-indikator</strong> — en blå prick i topbaren på mobil visas tills notiser markerats som lästa.</span></li>
        </ul>
      </section>

      {/* Responsiv design & PWA */}
      <section>
        <SectionHeader icon={<Smartphone size={16} strokeWidth={2} />} title="Responsiv design & PWA" />
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="bg-[var(--c-bg-app)] rounded-[10px] border border-[var(--c-border)] p-4">
            <p className="text-[12px] font-semibold text-[var(--c-text-secondary)] uppercase tracking-wide mb-2">Mobil (&lt; 768px)</p>
            <ul className="space-y-1 text-[13px] text-[var(--c-text-muted)]">
              <li>Bottom navigation med 5 flikar</li>
              <li>Full-width "Lägg till"-knapp ovanför nav</li>
              <li>Detaljvy och modaler som fullskärm</li>
              <li>Kortvisning med svep-interaktion</li>
              <li>Safe area-insets för iOS notch och home indicator</li>
              <li>Inputfält har font-size 16px (förhindrar iOS Safari-zoom)</li>
            </ul>
          </div>
          <div className="bg-[var(--c-bg-app)] rounded-[10px] border border-[var(--c-border)] p-4">
            <p className="text-[12px] font-semibold text-[var(--c-text-secondary)] uppercase tracking-wide mb-2">Desktop (≥ 768px)</p>
            <ul className="space-y-1 text-[13px] text-[var(--c-text-muted)]">
              <li>Sidebar (188px) med ikonnavigation</li>
              <li>"Lägg till"-knapp alltid synlig i topbaren</li>
              <li>Master/detail: lista + höger sidopanel · modaler som fast bredd (480–560px)</li>
              <li>Stapeldiagram med 3× höjd jämfört med mobil</li>
              <li>Hover-states och keyboard-tillgänglighet</li>
            </ul>
          </div>
        </div>
        <div className="mt-3 bg-[var(--c-accent-subtle)] rounded-[10px] border border-[var(--c-accent-muted)] p-4">
          <p className="text-[12px] font-semibold text-[var(--c-accent)] mb-1">PWA — Progressive Web App</p>
          <p className="text-[13px] text-[var(--c-text-secondary)]">
            Appen har en <code className="bg-[var(--c-bg-card)] px-1 py-0.5 rounded text-[12px]">manifest.json</code> och korrekt meta-taggar för iOS. På iPhone: öppna appen i Safari → dela → "Lägg till på hemskärmen". Appen startar sedan i standalone-läge utan Safari-krom, med blå status­bar och Subtrack-ikon. Safe area-insets hanteras med <code className="bg-[var(--c-bg-card)] px-1 py-0.5 rounded text-[12px]">env(safe-area-inset-top/bottom)</code> i CSS.
          </p>
        </div>
      </section>

      {/* Deploy */}
      <section>
        <SectionHeader icon={<Server size={16} strokeWidth={2} />} title="Driftsättning" />
        <div className="mt-4 space-y-3">
          <div className="bg-[var(--c-bg-app)] rounded-[10px] border border-[var(--c-border)] p-4 space-y-2">
            <DeployRow label="Hosting" value="Vercel — statisk SPA-deploy med edge-nätverk" />
            <DeployRow label="Deploy-trigger" value="Push till main-branch (Git-integration)" />
            <DeployRow label="Routing" value="vercel.json rewriter: alla sökvägar → index.html" />
            <DeployRow label="Miljövariabler" value="VITE_SUPABASE_URL + VITE_SUPABASE_ANON_KEY i Vercel dashboard" />
            <DeployRow label="Databas" value="Supabase (EU-region) — managed Postgres + Auth" />
            <DeployRow label="Auth callback" value="/auth/callback — hanterar OAuth-redirect från Google" />
          </div>
          <p className="text-[12px] text-[var(--c-text-subtle)] leading-relaxed">
            Eftersom appen är en ren klient-SPA saknas server-side rendering. All data hämtas client-side via Supabase JS-klienten efter autentisering. Vite bygger en optimerad bundle med code splitting — sidorna laddas som separata chunks vid behov.
          </p>
        </div>
      </section>

      {/* Uppdateringsflöde */}
      <section>
        <SectionHeader icon={<RefreshCw size={16} strokeWidth={2} />} title="Dataflöde & cache" />
        <p className="text-[13px] text-[var(--c-text-secondary)] leading-relaxed mt-3">
          React Query används som server state-lager med en stale time på 5 minuter. Det innebär att data cachas lokalt och inte hämtas om i onödan. Vid varje skrivoperation (lägg till, redigera, ta bort abonnemang, prishistorik etc.) anropas <code className="bg-[var(--c-bg-subtle)] px-1.5 py-0.5 rounded text-[12px]">queryClient.invalidateQueries</code> som tvingar en färsk hämtning. Det garanterar att UI alltid reflekterar den senaste databasens tillstånd utan manuell sidladdning.
        </p>
        <div className="mt-3 bg-[var(--c-bg-app)] rounded-[10px] border border-[var(--c-border)] p-4 space-y-2 text-[13px] text-[var(--c-text-secondary)]">
          <p className="font-medium text-[var(--c-text-primary)]">Flöde vid dataskrivning:</p>
          <ol className="list-none space-y-1.5">
            {['Mutation anropas (t.ex. useAddSubscription)', 'Supabase JS INSERT/UPDATE/DELETE mot Postgres via RLS', 'onSuccess: queryClient.invalidateQueries(QUERY_KEY)', 'React Query hämtar ny data automatiskt', 'UI uppdateras reaktivt utan sidladdning'].map((step, i) => (
              <li key={i} className="flex gap-2.5">
                <span className="w-5 h-5 rounded-full bg-[var(--c-accent-subtle)] text-[var(--c-accent)] text-[11px] font-semibold flex items-center justify-center shrink-0">{i + 1}</span>
                <span>{step}</span>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Demo-läge */}
      <section>
        <SectionHeader icon={<MonitorPlay size={16} strokeWidth={2} />} title="Demo-läge" />
        <p className="text-[13px] text-[var(--c-text-secondary)] leading-relaxed mt-3 mb-4">
          Inloggningssidan erbjuder ett demo-läge för den som vill utforska appen utan att skapa ett konto. All data är hårdkodad och ingen Supabase-trafik sker överhuvudtaget — varken läsning eller skrivning. Läggs ett abonnemang till i demo-läget syns det direkt, men försvinner när fliken stängs.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
          <div className="bg-[var(--c-bg-app)] rounded-[10px] border border-[var(--c-border)] p-4">
            <p className="text-[12px] font-semibold text-[var(--c-text-primary)] mb-2">Exempeldata som ingår</p>
            <ul className="space-y-1 text-[12px] text-[var(--c-text-muted)]">
              <li>Netflix — prishistorik i fyra steg (99 → 139 → 189 → 219 kr)</li>
              <li>Spotify — prishistorik i tre steg (99 → 119 → 135 kr)</li>
              <li>Adobe Creative Cloud — 699 kr/mån</li>
              <li>iCloud+ 50 GB — 12 kr/mån</li>
              <li>GitHub Pro — 99 kr/mån</li>
              <li>Microsoft 365 — 1 149 kr/år (familjeplan)</li>
              <li>Headspace — pausad</li>
              <li>HBO Max — avslutad</li>
            </ul>
          </div>
          <div className="bg-[var(--c-bg-app)] rounded-[10px] border border-[var(--c-border)] p-4">
            <p className="text-[12px] font-semibold text-[var(--c-text-primary)] mb-2">6 kategorier med färger</p>
            <ul className="space-y-1 text-[12px] text-[var(--c-text-muted)]">
              <li><span className="inline-block w-2 h-2 rounded-full bg-[#EF4444] mr-1.5" />Streaming</li>
              <li><span className="inline-block w-2 h-2 rounded-full bg-[#8B5CF6] mr-1.5" />Musik</li>
              <li><span className="inline-block w-2 h-2 rounded-full bg-[#0EA5E9] mr-1.5" />Lagring</li>
              <li><span className="inline-block w-2 h-2 rounded-full bg-[#F59E0B] mr-1.5" />Mjukvara</li>
              <li><span className="inline-block w-2 h-2 rounded-full bg-[#10B981] mr-1.5" />Produktivitet</li>
              <li><span className="inline-block w-2 h-2 rounded-full bg-[#EC4899] mr-1.5" />Hälsa</li>
            </ul>
          </div>
        </div>
        <div className="bg-[var(--c-bg-app)] rounded-[10px] border border-[var(--c-border)] p-4 space-y-3 text-[13px] text-[var(--c-text-secondary)]">
          <p className="font-medium text-[var(--c-text-primary)]">Teknisk implementation</p>
          <p>Demo-läget styrs av <code className="bg-[var(--c-bg-subtle)] px-1.5 py-0.5 rounded text-[12px]">DemoContext</code> (<code className="bg-[var(--c-bg-subtle)] px-1.5 py-0.5 rounded text-[12px]">src/contexts/DemoContext.tsx</code>) som exponerar <code className="bg-[var(--c-bg-subtle)] px-1.5 py-0.5 rounded text-[12px]">isDemoMode</code>, <code className="bg-[var(--c-bg-subtle)] px-1.5 py-0.5 rounded text-[12px]">enterDemo()</code> och <code className="bg-[var(--c-bg-subtle)] px-1.5 py-0.5 rounded text-[12px]">exitDemo()</code>. Vid aktivering injiceras hårdkodad data direkt i React Query-cachen via <code className="bg-[var(--c-bg-subtle)] px-1.5 py-0.5 rounded text-[12px]">queryClient.setQueryData</code>.</p>
          <ul className="space-y-1.5 list-none">
            {[
              'Datahookarna (useSubscriptions, useCategories) sätter enabled: !isDemoMode — inga Supabase-anrop görs',
              'Alla mutationer (lägg till, redigera, ta bort) uppdaterar React Query-cachen direkt med setQueryData',
              'Auth-vakten i AppLayout låter demo-användare passera utan inloggad session',
              'En amber-banner i topbaren indikerar tydligt att man är i demo-läge',
              'exitDemo() rensar hela cachen och den reaktiva auth-vakten skickar tillbaka till login',
              'Demo­användaren "Alex Svensson" visas med avatar och namn i topbaren och i inställningars profilkort',
            ].map((item, i) => (
              <li key={i} className="flex gap-2">
                <span className="text-[var(--c-accent)] font-semibold shrink-0">·</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Tillgänglighet */}
      <section>
        <SectionHeader icon={<Eye size={16} strokeWidth={2} />} title="Tillgänglighet" />
        <p className="text-[13px] text-[var(--c-text-secondary)] leading-relaxed mt-3 mb-4">
          Subtrack är byggt med WCAG 2.1 AA som riktlinje. Målet är att appen ska fungera för alla — oavsett om man navigerar med mus, tangentbord, skärmläsare eller switch-kontroll.
        </p>
        <div className="bg-[var(--c-bg-app)] rounded-[10px] border border-[var(--c-border)] p-4 space-y-3">
          {[
            ['Tangentbordsnavigering', 'Alla interaktiva element — rader, knappar, staplar i diagrammet — är nåbara med Tab och aktiverbara med Enter eller Mellanslag.'],
            ['Skip-länk', 'En dold länk ("Hoppa till innehåll") dyker upp vid tangentbordsfokus och hoppar förbi navigationen direkt till sidinnehållet.'],
            ['Fokushantering i modaler', 'Fokus fångas inuti öppna modaler och återgår till utlösande element när de stängs — förhindrar att fokus hamnar på osynligt innehåll.'],
            ['Skärmläsarstöd', 'Modaler har role="dialog", aria-modal och aria-labelledby. Felmeddelanden har role="alert" för automatisk uppläsning. Laddningsstatus har role="status".'],
            ['Rubrikhierarki', 'Varje sida har exakt en h1 och sektionsrubriker är h2 — oavsett visuell storlek.'],
            ['Färgkontrast', 'Alla textstorlekar uppfyller kravet på 4,5:1 kontrastförhållande mot bakgrunden, i både ljust och mörkt läge.'],
            ['ARIA-states', 'Kollapsibla avsnitt har aria-expanded. Filterknappars aktivt läge kommuniceras via aria-pressed. Dekorativa ikoner har aria-hidden="true".'],
            ['Stapeldiagram', 'Varje stapel är ett button-element med aria-label som anger månad och belopp. Diagrambehållaren har role="img" med en beskrivande etikett.'],
            ['Tabellstruktur', 'Alla tabellrubriker har scope="col" och sorteringsbara kolumner exponerar aria-sort="ascending"/"descending"/"none" — skärmläsare annonserar aktiv sortering automatiskt.'],
            ['Fokusring', 'Synlig fokusring via :focus-visible vid tangentbordsnavigering — men inte vid musklick, för att hålla UI-n rent.'],
          ].map(([title, detail]) => (
            <div key={title} className="flex gap-2">
              <span className="text-[var(--c-accent)] font-semibold shrink-0 mt-0.5">·</span>
              <p className="text-[12px] text-[var(--c-text-muted)] leading-relaxed">
                <span className="font-semibold text-[var(--c-text-primary)]">{title}</span> — {detail}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Designsystem */}
      <section>
        <SectionHeader icon={<Globe size={16} strokeWidth={2} />} title="Designsystem" />
        <p className="text-[13px] text-[var(--c-text-secondary)] leading-relaxed mt-3 mb-4">
          Subtrack följer ett strikt designsystem definierat i <code className="bg-[var(--c-bg-subtle)] px-1.5 py-0.5 rounded text-[12px]">CLAUDE.md</code> — projektets instruktionsfil för AI-assisterad utveckling. Alla färger, typsnitt och radier är fastlagda. Mörkt läge hanteras via CSS-variabler med <code className="bg-[var(--c-bg-subtle)] px-1.5 py-0.5 rounded text-[12px]">[data-theme="dark"]</code> på html-elementet.
        </p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          <ColorSwatch hex="#1B4FD8" label="Accent" />
          <ColorSwatch hex="#111827" label="Text primär" />
          <ColorSwatch hex="#6B7280" label="Text sekundär" />
          <ColorSwatch hex="#E5E7EB" label="Kantlinje" />
          <ColorSwatch hex="#F9FAFB" label="Bakgrund" />
          <ColorSwatch hex="#166534" label="Aktiv/grön" bg="#F0FDF4" />
          <ColorSwatch hex="#92400E" label="Varning/amber" bg="#FFFBEB" />
          <ColorSwatch hex="#B91C1C" label="Fel/röd" bg="#FEF2F2" />
        </div>
        <p className="text-[12px] text-[var(--c-text-subtle)] mt-3">Typsnitt: Inter (Google Fonts) · Vikter: 400, 500, 600 · Tracking: −0.3px till −0.5px på rubriker ≥ 18px</p>
      </section>

      {/* Footer */}
      <div className="border-t border-[var(--c-border)] pt-6 text-center space-y-2">
        <a
          href="https://github.com/emorlin/subtrack"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-[13px] text-[var(--c-accent)] hover:underline"
        >
          <GitHubIcon />
          github.com/emorlin/subtrack
        </a>
        <p className="text-[12px] text-[var(--c-text-subtle)]">Subtrack · Byggd med React, TypeScript, Supabase & Vercel · 2026</p>
      </div>

    </div>
  )
}

function SectionHeader({ icon, title }: { icon: React.ReactNode; title: string }) {
  return (
    <div className="flex items-center gap-2 border-b border-[var(--c-border)] pb-2">
      <span className="text-[var(--c-accent)]">{icon}</span>
      <h2 className="text-[15px] font-semibold text-[var(--c-text-primary)] tracking-[-0.3px]">{title}</h2>
    </div>
  )
}

function FeatureCard({ title, description }: { title: string; description: string }) {
  return (
    <div className="bg-[var(--c-bg-app)] rounded-[10px] border border-[var(--c-border)] p-4">
      <p className="text-[13px] font-semibold text-[var(--c-text-primary)] mb-1">{title}</p>
      <p className="text-[12px] text-[var(--c-text-muted)] leading-relaxed">{description}</p>
    </div>
  )
}

function TechRow({ name, role, detail }: { name: string; role: string; detail: string }) {
  return (
    <div className="flex gap-3 py-2.5 border-b border-[var(--c-bg-subtle)] last:border-0">
      <div className="w-[160px] shrink-0">
        <span className="text-[13px] font-semibold text-[var(--c-text-primary)]">{name}</span>
        <span className="ml-2 text-[11px] text-[var(--c-text-subtle)]">{role}</span>
      </div>
      <p className="text-[12px] text-[var(--c-text-muted)] leading-relaxed">{detail}</p>
    </div>
  )
}

type ArchVariant = 'blue' | 'green' | 'amber' | 'red'

const archStyles: Record<ArchVariant, { bg: string; text: string }> = {
  blue:  { bg: 'bg-[var(--c-accent-subtle)]',  text: 'text-[var(--c-accent)]' },
  green: { bg: 'bg-[var(--c-success-bg)]',     text: 'text-[var(--c-success-text)]' },
  amber: { bg: 'bg-[var(--c-warning-bg)]',     text: 'text-[var(--c-warning-text)]' },
  red:   { bg: 'bg-[var(--c-danger-bg)]',      text: 'text-[var(--c-danger-text)]' },
}

function ArchLayer({ label, variant, items }: { label: string; variant: ArchVariant; items: string[] }) {
  const { bg, text } = archStyles[variant]
  return (
    <div className={`rounded-[8px] p-3 ${bg}`}>
      <p className={`text-[11px] font-semibold mb-1.5 ${text}`}>{label}</p>
      <ul className="space-y-0.5">
        {items.map((item, i) => (
          <li key={i} className="text-[12px] text-[var(--c-text-secondary)]">{item}</li>
        ))}
      </ul>
    </div>
  )
}

function TableCard({ name, description, columns }: {
  name: string
  description: string
  columns: { col: string; type: string; note: string }[]
}) {
  return (
    <div className="border border-[var(--c-border)] rounded-[12px] overflow-hidden">
      <div className="bg-[var(--c-bg-app)] px-4 py-3 border-b border-[var(--c-border)]">
        <p className="text-[13px] font-semibold text-[var(--c-text-primary)] font-mono">{name}</p>
        <p className="text-[12px] text-[var(--c-text-muted)] mt-0.5 leading-relaxed">{description}</p>
      </div>
      <div className="divide-y divide-[var(--c-bg-subtle)]">
        {columns.map(({ col, type, note }) => (
          <div key={col} className="flex gap-3 px-4 py-2 items-baseline bg-[var(--c-bg-card)]">
            <code className="text-[12px] text-[var(--c-accent)] font-mono w-[140px] shrink-0">{col}</code>
            <span className="text-[11px] text-[var(--c-text-muted)] font-mono flex-1">{type}</span>
            {note && <span className="text-[11px] text-[var(--c-text-subtle)] text-right shrink-0 max-w-[160px]">{note}</span>}
          </div>
        ))}
      </div>
    </div>
  )
}

function SecurityItem({ icon, title, detail }: { icon: React.ReactNode; title: string; detail: string }) {
  return (
    <div className="flex gap-3">
      <div className="mt-0.5 shrink-0">{icon}</div>
      <div>
        <p className="text-[12px] font-semibold text-[var(--c-text-primary)]">{title}</p>
        <p className="text-[12px] text-[var(--c-text-muted)] leading-relaxed">{detail}</p>
      </div>
    </div>
  )
}

function CalcCard({ name, description, formula }: { name: string; description: string; formula: string }) {
  return (
    <div className="border border-[var(--c-border)] rounded-[10px] p-4 bg-[var(--c-bg-card)]">
      <code className="text-[12px] text-[var(--c-accent)] font-mono">{name}</code>
      <p className="text-[12px] text-[var(--c-text-secondary)] leading-relaxed mt-1.5">{description}</p>
      <div className="mt-2 bg-[var(--c-bg-app)] rounded-[6px] px-3 py-1.5">
        <p className="text-[11px] text-[var(--c-text-subtle)] font-mono">{formula}</p>
      </div>
    </div>
  )
}

function DeployRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex gap-3">
      <span className="text-[12px] text-[var(--c-text-subtle)] w-[140px] shrink-0">{label}</span>
      <span className="text-[12px] text-[var(--c-text-secondary)] font-medium">{value}</span>
    </div>
  )
}

function ColorSwatch({ hex, label, bg }: { hex: string; label: string; bg?: string }) {
  const background = bg ?? hex
  return (
    <div className="rounded-[8px] overflow-hidden border border-[var(--c-border)]">
      <div className="h-10" style={{ backgroundColor: background }} />
      <div className="px-2 py-1.5 bg-[var(--c-bg-card)]">
        <p className="text-[11px] font-medium text-[var(--c-text-primary)]">{label}</p>
        <p className="text-[10px] text-[var(--c-text-subtle)] font-mono">{hex}</p>
      </div>
    </div>
  )
}

function GitHubIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
    </svg>
  )
}
