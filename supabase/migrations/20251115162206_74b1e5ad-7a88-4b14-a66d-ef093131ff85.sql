-- Create profiles table to store user information
create table public.profiles (
  id uuid not null references auth.users(id) on delete cascade primary key,
  email text not null,
  created_at timestamp with time zone not null default now()
);

-- Enable RLS
alter table public.profiles enable row level security;

-- Allow everyone to view all profiles
create policy "Profiles are viewable by everyone"
on public.profiles
for select
to authenticated
using (true);

-- Allow users to insert their own profile
create policy "Users can insert their own profile"
on public.profiles
for insert
to authenticated
with check (auth.uid() = id);

-- Create function to handle new user signups
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email);
  return new;
end;
$$;

-- Trigger to create profile on signup
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Insert existing user into profiles
insert into public.profiles (id, email)
select id, email from auth.users
where id not in (select id from public.profiles);