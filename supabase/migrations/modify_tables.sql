-- Supprimer les politiques existantes pour prestations
drop policy if exists "Les utilisateurs peuvent voir leurs prestations" on public.prestations;
drop policy if exists "Les utilisateurs peuvent créer des prestations" on public.prestations;
drop policy if exists "Les utilisateurs peuvent modifier leurs prestations" on public.prestations;
drop policy if exists "Les utilisateurs peuvent supprimer leurs prestations" on public.prestations;

-- Supprimer les politiques existantes pour ouvrages
drop policy if exists "Les utilisateurs peuvent voir leurs ouvrages" on public.ouvrages;
drop policy if exists "Les utilisateurs peuvent créer des ouvrages" on public.ouvrages;
drop policy if exists "Les utilisateurs peuvent modifier leurs ouvrages" on public.ouvrages;
drop policy if exists "Les utilisateurs peuvent supprimer leurs ouvrages" on public.ouvrages;

-- Supprimer les politiques existantes pour devis
drop policy if exists "Les utilisateurs peuvent voir leurs devis" on public.devis;
drop policy if exists "Les utilisateurs peuvent créer des devis" on public.devis;
drop policy if exists "Les utilisateurs peuvent modifier leurs devis" on public.devis;
drop policy if exists "Les utilisateurs peuvent supprimer leurs devis" on public.devis;

-- Supprimer les politiques existantes pour clients
drop policy if exists "Les utilisateurs peuvent voir leurs clients" on public.clients;
drop policy if exists "Les utilisateurs peuvent créer des clients" on public.clients;
drop policy if exists "Les utilisateurs peuvent modifier leurs clients" on public.clients;
drop policy if exists "Les utilisateurs peuvent supprimer leurs clients" on public.clients;

-- Modifier la table clients
alter table public.clients 
    drop constraint if exists clients_entreprise_id_fkey,
    drop column if exists entreprise_id,
    add column if not exists user_id uuid references auth.users(id) on delete cascade;

-- Modifier la table devis
alter table public.devis
    drop constraint if exists devis_entreprise_id_fkey,
    drop column if exists entreprise_id,
    add column if not exists user_id uuid references auth.users(id) on delete cascade;

-- Créer les nouvelles politiques pour clients
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

-- Créer les nouvelles politiques pour devis
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

-- Créer les nouvelles politiques pour ouvrages
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

-- Créer les nouvelles politiques pour prestations
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

-- Supprimer la table entreprises
drop table if exists public.entreprises cascade; 