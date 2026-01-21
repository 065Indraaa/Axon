create table if not exists app_settings (
  key text primary key,
  value text not null
);

-- Optional: Enable RLS nicely, though this is for server-side mostly
alter table app_settings enable row level security;
