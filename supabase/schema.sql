-- Run this in your Supabase SQL editor

create table if not exists daily_editions (
  id uuid primary key default gen_random_uuid(),
  date date not null unique,
  top_summary text,
  article_count int,
  created_at timestamptz default now()
);

create table if not exists articles (
  id uuid primary key default gen_random_uuid(),
  edition_date date not null references daily_editions(date),
  title text not null,
  source text,
  url text,
  category text check (category in (
    'ai_ml',
    'tech',
    'economy',
    'business',
    'finance'
  )),
  summary text,
  original_snippet text,
  image_url text,
  created_at timestamptz default now()
);

create index if not exists articles_edition_date_idx on articles(edition_date);
create index if not exists articles_category_idx on articles(category);

-- Allow public read access (anon key used by the frontend)
alter table daily_editions enable row level security;
alter table articles enable row level security;

create policy "Public read daily_editions"
  on daily_editions for select
  using (true);

create policy "Public read articles"
  on articles for select
  using (true);
