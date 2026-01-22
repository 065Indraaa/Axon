-- Create snaps table
create table if not exists snaps (
  id uuid primary key default gen_random_uuid(),
  sender_address text not null,
  token_symbol text not null,
  total_amount decimal not null,
  remaining_amount decimal not null,
  snappers_count int not null,
  mode text check (mode in ('equal', 'random')),
  status text check (status in ('active', 'completed', 'expired')) default 'active',
  created_at timestamptz default now()
);

-- Create snap_claims table
create table if not exists snap_claims (
  id uuid primary key default gen_random_uuid(),
  snap_id uuid references snaps(id) on delete cascade,
  claimer_address text not null,
  amount decimal not null,
  tx_hash text,
  created_at timestamptz default now(),
  unique(snap_id, claimer_address)
);

-- RLS (Row Level Security)
alter table snaps enable row level security;
alter table snap_claims enable row level security;

-- Policies for snaps (Public Read, Authenticated Write - adjust based on your needs)
create policy "Snaps are publicly readable" on snaps for select using (true);
create policy "Authenticated users can create snaps" on snaps for insert with check (true);

-- Policies for snap_claims (Public Read)
create policy "Snap claims are publicly readable" on snap_claims for select using (true);
create policy "Authenticated users can create claims" on snap_claims for insert with check (true);
