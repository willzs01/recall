-- Create chats table
create table if not exists chats (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) not null,
  title text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create messages table
create table if not exists messages (
  id uuid default gen_random_uuid() primary key,
  chat_id uuid references chats(id) on delete cascade not null,
  role text not null check (role in ('user', 'assistant')),
  content text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Set up Row Level Security (RLS)
alter table chats enable row level security;
alter table messages enable row level security;

-- Policies for chats
drop policy if exists "Users can view their own chats" on chats;
create policy "Users can view their own chats"
  on chats for select
  using (auth.uid() = user_id);

drop policy if exists "Users can insert their own chats" on chats;
create policy "Users can insert their own chats"
  on chats for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users can delete their own chats" on chats;
create policy "Users can delete their own chats"
  on chats for delete
  using (auth.uid() = user_id);

-- Policies for messages
drop policy if exists "Users can view messages in their chats" on messages;
create policy "Users can view messages in their chats"
  on messages for select
  using (
    exists (
      select 1 from chats
      where chats.id = messages.chat_id
      and chats.user_id = auth.uid()
    )
  );

drop policy if exists "Users can insert messages in their chats" on messages;
create policy "Users can insert messages in their chats"
  on messages for insert
  with check (
    exists (
      select 1 from chats
      where chats.id = messages.chat_id
      and chats.user_id = auth.uid()
    )
  );
