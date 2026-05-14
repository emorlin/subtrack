-- Lägg till stöd för provperiod-spårning
alter table subscriptions
  add column if not exists trial_ends_at date;
