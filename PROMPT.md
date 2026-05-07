# Initialprompt till Claude Code CLI

Klistra in detta i terminalen när du står i projektmappen och kör `claude`:

---

```
Jag ska bygga en app som heter Subtrack — ett verktyg för att hålla koll på löpande abonnemang.

Läs CLAUDE.md i projektmappen noggrant. Där finns:
- Komplett databasschema (Supabase/Postgres med RLS)
- Grafisk profil (Inter, #1B4FD8 som accentfärg, Tailwind-klasser)
- Projektstruktur
- UX-flöde för mobil och desktop
- Auth-flöde (Google OAuth via Supabase)
- Beräkningslogik för totalt betalt och månadsbelopp
- Byggordering (1–12)

Börja från punkt 1 i prioritetsordningen:

1. Skapa Vite + React + TypeScript-projekt med Tailwind
2. Lägg till Supabase-klient och miljövariabler
3. Skapa migrations/001_initial_schema.sql med hela schemat från CLAUDE.md
4. Skapa TypeScript-typer i src/types/index.ts som matchar databasen exakt
5. Implementera Google Auth-flödet med Supabase

Ställ frågor om något är oklart innan du kodar. Koda aldrig utan att ha läst CLAUDE.md.
```

---

## Hur du skickar med skisser

Claude Code kan ta emot bilder direkt i terminalen. Gör så här:

```bash
# Starta Claude Code och bifoga en bild
claude --image path/till/skiss.png

# Eller inne i en session, skriv:
# /image path/till/skiss.png
```

För att exportera skisserna från den här chatten som PNG:
1. Högerklicka på varje mockup-widget → "Spara bild"
2. Döp dem: `screen1-home.png`, `screen2-detail.png`, `screen3-form.png`, `screen4-cost.png`, `screen5-notifications.png`
3. Lägg dem i en mapp: `subtrack/docs/screens/`

---

## Kompletterande prompts per fas

### Fas 2 — Layout och navigation
```
Implementera layout enligt CLAUDE.md:
- TopBar.tsx med Subtrack-logga (blå ruta + vit border-radius-ikon) och användarnamn
- Sidebar.tsx för desktop (188px, navigationslänkar med aktiv-state border-r-2 border-[#1B4FD8])
- BottomNav.tsx för mobil (4 ikoner: Hem, Kostnad, Notiser, Inställningar)
- Responsiv layout: under md = BottomNav, över md = Sidebar
Bifogad skiss: docs/screens/screen1-home.png
```

### Fas 3 — Prenumerationslista
```
Bygg SubscriptionList och SubscriptionRow enligt CLAUDE.md.
- Mobil: kortlista med tjänsteikon (2 bokstäver), namn, kategori, badge (aktiv/varning), pris, förnyelsedatum
- Desktop: tabellvy med kolumner: Tjänst | Kategori | Kostnad | Intervall | Förnyelse | Status
- Filterpiller för kategori (scrollbar horisontellt på mobil)
- FAB-knapp (mobil) och "+ Lägg till"-knapp (desktop)
Bifogad skiss: docs/screens/screen1-home.png
```

### Fas 4 — Lägg till abonnemang (3-stegsformulär)
```
Bygg AddSubscriptionModal enligt CLAUDE.md.
Steg 1: namn, kategori, kostnad + intervall, startdatum, bindningstid, påminnelse
Steg 2: historikfråga — "Har du betalat innan du lade till denna?" Ja → textfält (låses). Nej → visar autoberäknat belopp.
Steg 3: bekräftelse + kommentarsfält → spara till Supabase
- Mobil: fullskärm med stepper-indikator
- Desktop: modal (max-w-xl, 2-kolumns-grid i formuläret)
Bifogad skiss: docs/screens/screen3-form.png
```

### Fas 5 — Detaljvy
```
Bygg SubscriptionDetail.tsx:
- Mobil: fullskärm (slide från höger), tillbaka-knapp, ta bort-knapp (röd), varningsbanner om förnyelse < 7 dagar
- Desktop: höger sidopanel (220px) i master/detail-layout, redigera + ta bort-knappar
- Visa: kostnad, startdatum, nästa förnyelse, bindningstid, totalt betalt (calculateTotalPaid), påminnelse, kommentar
Bifogad skiss: docs/screens/screen2-detail.png
```

### Fas 6 — Kostnadssida
```
Bygg CostView.tsx med:
- Stat-grid: hittills i år (acc blå), prognos helår, snitt/mån, dyraste tjänst
- BarChart: månadsvis stapelgraf, aktuell månad i #1B4FD8, historik i #BFDBFE, prognos streckad (#E5E7EB)
- Kategoriuppdelning: lista med färgpunkt, kategorinamn, horisontell bar, belopp
- Desktop: chart + kategori sida vid sida (grid-cols-[1fr_200px])
Bifogad skiss: docs/screens/screen4-cost.png
```

### Fas 7 — Notiser
```
Bygg NotificationList.tsx:
- Sektioner: "Kommande" och "Historik"
- Notisrad: färgad bakgrund (röd < 3 dagar, amber < 14 dagar, grön < 30 dagar, grå = historik)
- Klick på notis navigerar till abonnemangets detaljvy
Bifogad skiss: docs/screens/screen5-notifications.png
```

---

## Snabbstart i terminalen

```bash
# 1. Skapa projekt
npm create vite@latest subtrack -- --template react-ts
cd subtrack

# 2. Installera beroenden
npm install @supabase/supabase-js @tanstack/react-query
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p

# 3. Kopiera CLAUDE.md till projektmappen
cp ../CLAUDE.md .

# 4. Starta Claude Code
claude

# 5. Klistra in initialprompt ovan
```
