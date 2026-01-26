-- Create analyses table
create table public.analyses (
  id uuid not null default gen_random_uuid (),
  user_id uuid references auth.users (id) on delete cascade,
  file_name text,
  data jsonb,
  is_public boolean default false,
  created_at timestamp with time zone not null default now(),
  constraint analyses_pkey primary key (id)
);

-- Add sharing capability to simulations
alter table public.simulations add column if not exists is_public boolean default false;

-- Enable RLS for analyses
alter table public.analyses enable row level security;

-- Policies for analyses
create policy "Users can view their own analyses" on public.analyses
  for select using (auth.uid() = user_id);

create policy "Users can insert their own analyses" on public.analyses
  for insert with check (auth.uid() = user_id);

create policy "Users can update their own analyses" on public.analyses
  for update using (auth.uid() = user_id);

create policy "Users can delete their own analyses" on public.analyses
  for delete using (auth.uid() = user_id);

-- Public access policies (Sharing)
create policy "Public analyses are viewable by everyone" on public.analyses
  for select using (is_public = true);

create policy "Public simulations are viewable by everyone" on public.simulations
  for select using (is_public = true);
