-- Create simulations table
create table public.simulations (
  id uuid not null default gen_random_uuid (),
  user_id uuid references auth.users (id) on delete cascade,
  policy_id bigint,
  scenario_name text,
  status text check (status in ('Draft', 'Completed', 'Deployed')),
  data jsonb,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now(),
  constraint simulations_pkey primary key (id)
);

-- Enable RLS
alter table public.simulations enable row level security;

-- Create policies
create policy "Users can view their own simulations" on public.simulations
  for select using (auth.uid() = user_id);

create policy "Users can insert their own simulations" on public.simulations
  for insert with check (auth.uid() = user_id);

create policy "Users can update their own simulations" on public.simulations
  for update using (auth.uid() = user_id);

create policy "Users can delete their own simulations" on public.simulations
  for delete using (auth.uid() = user_id);
