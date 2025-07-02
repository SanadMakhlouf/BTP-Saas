-- Enable les extensions nécessaires
create extension if not exists "uuid-ossp";

-- Table clients
create table public.clients (
    id uuid default uuid_generate_v4() primary key,
    user_id uuid references auth.users(id) on delete cascade,
    nom text not null,
    adresse text,
    code_postal text,
    ville text,
    telephone text,
    email text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Politiques de sécurité pour clients
alter table public.clients enable row level security;

create policy "Les utilisateurs peuvent voir leurs clients"
    on public.clients for select
    using (auth.uid() = user_id);

create policy "Les utilisateurs peuvent créer des clients"
    on public.clients for insert
    with check (auth.uid() = user_id);

create policy "Les utilisateurs peuvent modifier leurs clients"
    on public.clients for update
    using (auth.uid() = user_id);

create policy "Les utilisateurs peuvent supprimer leurs clients"
    on public.clients for delete
    using (auth.uid() = user_id);

-- Table devis
create table public.devis (
    id uuid default uuid_generate_v4() primary key,
    user_id uuid references auth.users(id) on delete cascade,
    client_id uuid references public.clients(id) on delete cascade,
    reference text not null unique,
    date_creation date not null,
    date_validite date,
    conditions_paiement text,
    notes text,
    taux_tva numeric(5,2) not null,
    montant_ht numeric(10,2) not null,
    montant_tva numeric(10,2) not null,
    montant_ttc numeric(10,2) not null,
    statut text not null default 'en_cours',
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    check (statut in ('en_cours', 'envoyé', 'accepté', 'refusé', 'annulé'))
);

-- Politiques de sécurité pour devis
alter table public.devis enable row level security;

create policy "Les utilisateurs peuvent voir leurs devis"
    on public.devis for select
    using (auth.uid() = user_id);

create policy "Les utilisateurs peuvent créer des devis"
    on public.devis for insert
    with check (auth.uid() = user_id);

create policy "Les utilisateurs peuvent modifier leurs devis"
    on public.devis for update
    using (auth.uid() = user_id);

create policy "Les utilisateurs peuvent supprimer leurs devis"
    on public.devis for delete
    using (auth.uid() = user_id);

-- Table ouvrages
create table public.ouvrages (
    id uuid default uuid_generate_v4() primary key,
    devis_id uuid references public.devis(id) on delete cascade,
    titre text not null
);

-- Politiques de sécurité pour ouvrages
alter table public.ouvrages enable row level security;

create policy "Les utilisateurs peuvent voir leurs ouvrages"
    on public.ouvrages for select
    using (exists (
        select 1 from public.devis
        where devis.id = ouvrages.devis_id
        and devis.user_id = auth.uid()
    ));

create policy "Les utilisateurs peuvent créer des ouvrages"
    on public.ouvrages for insert
    with check (exists (
        select 1 from public.devis
        where devis.id = ouvrages.devis_id
        and devis.user_id = auth.uid()
    ));

create policy "Les utilisateurs peuvent modifier leurs ouvrages"
    on public.ouvrages for update
    using (exists (
        select 1 from public.devis
        where devis.id = ouvrages.devis_id
        and devis.user_id = auth.uid()
    ));

create policy "Les utilisateurs peuvent supprimer leurs ouvrages"
    on public.ouvrages for delete
    using (exists (
        select 1 from public.devis
        where devis.id = ouvrages.devis_id
        and devis.user_id = auth.uid()
    ));

-- Table prestations
create table public.prestations (
    id uuid default uuid_generate_v4() primary key,
    ouvrage_id uuid references public.ouvrages(id) on delete cascade,
    devis_id uuid references public.devis(id) on delete cascade,
    description text not null,
    quantite numeric(10,2) not null,
    unite text not null,
    prix_unitaire numeric(10,2) not null,
    total_ht numeric(10,2) not null
);

-- Politiques de sécurité pour prestations
alter table public.prestations enable row level security;

create policy "Les utilisateurs peuvent voir leurs prestations"
    on public.prestations for select
    using (exists (
        select 1 from public.devis
        where devis.id = prestations.devis_id
        and devis.user_id = auth.uid()
    ));

create policy "Les utilisateurs peuvent créer des prestations"
    on public.prestations for insert
    with check (exists (
        select 1 from public.devis
        where devis.id = prestations.devis_id
        and devis.user_id = auth.uid()
    ));

create policy "Les utilisateurs peuvent modifier leurs prestations"
    on public.prestations for update
    using (exists (
        select 1 from public.devis
        where devis.id = prestations.devis_id
        and devis.user_id = auth.uid()
    ));

create policy "Les utilisateurs peuvent supprimer leurs prestations"
    on public.prestations for delete
    using (exists (
        select 1 from public.devis
        where devis.id = prestations.devis_id
        and devis.user_id = auth.uid()
    )); 