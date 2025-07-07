-- Création de la table produits
create table public.produits (
    id uuid default uuid_generate_v4() primary key,
    user_id uuid references auth.users(id) on delete cascade,
    nom text not null,
    description text,
    prix_unitaire numeric(10,2) not null,
    unite text not null default 'unité',
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Politiques de sécurité pour produits
alter table public.produits enable row level security;

create policy "Les utilisateurs peuvent voir leurs produits"
    on public.produits for select
    using (auth.uid() = user_id);

create policy "Les utilisateurs peuvent créer des produits"
    on public.produits for insert
    with check (auth.uid() = user_id);

create policy "Les utilisateurs peuvent modifier leurs produits"
    on public.produits for update
    using (auth.uid() = user_id);

create policy "Les utilisateurs peuvent supprimer leurs produits"
    on public.produits for delete
    using (auth.uid() = user_id); 