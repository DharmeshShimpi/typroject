create table if not exists organizations (
    id uuid default gen_random_uuid() primary key,
    teacher_id uuid references auth.users(id) on delete cascade not null,
    name text not null,
    description text,
    department text not null,
    academic_year text not null,
    min_members int default 2,
    max_members int default 4,
    join_code text not null unique,
    created_at timestamp with time zone default now()
);