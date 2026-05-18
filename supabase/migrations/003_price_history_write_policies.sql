-- Ensure INSERT, UPDATE and DELETE policies exist for price_history.
-- DROP IF EXISTS makes this safe to re-run regardless of current state.

drop policy if exists "Users insert own price history" on price_history;
drop policy if exists "Users update own price history" on price_history;
drop policy if exists "Users delete own price history" on price_history;

create policy "Users insert own price history"
  on price_history for insert
  with check (
    exists (
      select 1 from subscriptions s
      where s.id = price_history.subscription_id
        and s.user_id = auth.uid()
    )
  );

create policy "Users update own price history"
  on price_history for update
  using (
    exists (
      select 1 from subscriptions s
      where s.id = price_history.subscription_id
        and s.user_id = auth.uid()
    )
  );

create policy "Users delete own price history"
  on price_history for delete
  using (
    exists (
      select 1 from subscriptions s
      where s.id = price_history.subscription_id
        and s.user_id = auth.uid()
    )
  );
