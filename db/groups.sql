create table if not exists student_groups (
    id uuid default gen_random_uuid() primary key,
    organization_id uuid references organizations(id) on delete cascade not null,
    name text not null,
    created_by uuid references auth.users(id) on delete cascade not null,
    max_members int default 3,
    created_at timestamp with time zone default now()
);
create table if not exists group_members (
    id uuid default gen_random_uuid() primary key,
    group_id uuid references student_groups(id) on delete cascade not null,
    student_id uuid references auth.users(id) on delete cascade not null,
    joined_at timestamp with time zone default now(),
    unique (group_id, student_id)
);