-- ============================================================
-- Subtrack – Initial Schema
-- ============================================================

-- profiles (mirrors auth.users)
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  full_name text,
  avatar_url text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table profiles enable row level security;

create policy "Users can read own profile"
  on profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on profiles for update
  using (auth.uid() = id);

-- Trigger: create profile on signup
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

-- ============================================================
-- categories
-- ============================================================
create table categories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  name text not null,
  color_hex text default '#6B7280',
  sort_order int default 0,
  created_at timestamptz default now()
);

alter table categories enable row level security;

create policy "Users manage own categories"
  on categories
  using (auth.uid() = user_id);

-- Trigger: seed default categories for new user
create or replace function public.handle_new_user_categories()
returns trigger as $$
begin
  insert into public.categories (user_id, name, color_hex, sort_order)
  values
    (new.id, 'Underhållning', '#7C3AED', 0),
    (new.id, 'Mjukvara',      '#1B4FD8', 1),
    (new.id, 'Hälsa',         '#059669', 2),
    (new.id, 'Nyheter',       '#D97706', 3),
    (new.id, 'Övrigt',        '#6B7280', 4);
  return new;
end;
$$ language plpgsql security definer;

create trigger on_profile_created_seed_categories
  after insert on public.profiles
  for each row execute procedure public.handle_new_user_categories();

-- ============================================================
-- subscriptions
-- ============================================================
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
  legacy_amount_paid numeric(10,2),
  status text default 'active' check (status in ('active','paused','cancelled')),
  notes text,
  reminder_days_before int default 3,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table subscriptions enable row level security;

create policy "Users manage own subscriptions"
  on subscriptions
  using (auth.uid() = user_id);

-- Trigger: insert price_history row when amount changes
create or replace function public.handle_subscription_price_change()
returns trigger as $$
begin
  if (TG_OP = 'INSERT') then
    insert into public.price_history (subscription_id, amount, interval, effective_from)
    values (new.id, new.amount, new.interval, new.start_date);
  elsif (TG_OP = 'UPDATE' and new.amount <> old.amount) then
    insert into public.price_history (subscription_id, amount, interval, effective_from)
    values (new.id, new.amount, new.interval, current_date);
  end if;
  return new;
end;
$$ language plpgsql security definer;

create trigger on_subscription_price_change
  after insert or update on public.subscriptions
  for each row execute procedure public.handle_subscription_price_change();

-- updated_at trigger
create or replace function public.update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger subscriptions_updated_at
  before update on public.subscriptions
  for each row execute procedure public.update_updated_at();

create trigger profiles_updated_at
  before update on public.profiles
  for each row execute procedure public.update_updated_at();

-- ============================================================
-- price_history
-- ============================================================
create table price_history (
  id uuid primary key default gen_random_uuid(),
  subscription_id uuid not null references subscriptions(id) on delete cascade,
  amount numeric(10,2) not null,
  interval text not null,
  effective_from date not null,
  created_at timestamptz default now()
);

alter table price_history enable row level security;

create policy "Users read own price history"
  on price_history for select
  using (
    exists (
      select 1 from subscriptions s
      where s.id = price_history.subscription_id
        and s.user_id = auth.uid()
    )
  );

-- ============================================================
-- notifications
-- ============================================================
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

create policy "Users manage own notifications"
  on notifications
  using (auth.uid() = user_id);
