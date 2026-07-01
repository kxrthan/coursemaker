-- Run this in the Supabase SQL Editor to create the necessary table

create table user_courses (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) not null,
  course_id text not null,
  course_data jsonb not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(user_id, course_id)
);

-- Set up Row Level Security (RLS)
alter table user_courses enable row level security;

create policy "Users can view their own courses."
  on user_courses for select
  using ( auth.uid() = user_id );

create policy "Users can insert their own courses."
  on user_courses for insert
  with check ( auth.uid() = user_id );

create policy "Users can update their own courses."
  on user_courses for update
  using ( auth.uid() = user_id );

create policy "Users can delete their own courses."
  on user_courses for delete
  using ( auth.uid() = user_id );
