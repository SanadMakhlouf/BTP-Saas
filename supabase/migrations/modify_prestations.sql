-- Ajouter la colonne produit_id à la table prestations
ALTER TABLE public.prestations
ADD COLUMN IF NOT EXISTS produit_id uuid REFERENCES public.produits(id) ON DELETE SET NULL;

-- Mettre à jour les politiques pour les prestations
DROP POLICY IF EXISTS "Les utilisateurs peuvent voir leurs prestations" ON public.prestations;
DROP POLICY IF EXISTS "Les utilisateurs peuvent créer des prestations" ON public.prestations;
DROP POLICY IF EXISTS "Les utilisateurs peuvent modifier leurs prestations" ON public.prestations;
DROP POLICY IF EXISTS "Les utilisateurs peuvent supprimer leurs prestations" ON public.prestations;

-- Recréer les politiques pour les prestations
CREATE POLICY "Les utilisateurs peuvent voir leurs prestations"
    ON public.prestations FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM public.devis
        WHERE devis.id = prestations.devis_id
        AND devis.user_id = auth.uid()
    ));

CREATE POLICY "Les utilisateurs peuvent créer des prestations"
    ON public.prestations FOR INSERT
    WITH CHECK (EXISTS (
        SELECT 1 FROM public.devis
        WHERE devis.id = prestations.devis_id
        AND devis.user_id = auth.uid()
    ));

CREATE POLICY "Les utilisateurs peuvent modifier leurs prestations"
    ON public.prestations FOR UPDATE
    USING (EXISTS (
        SELECT 1 FROM public.devis
        WHERE devis.id = prestations.devis_id
        AND devis.user_id = auth.uid()
    ));

CREATE POLICY "Les utilisateurs peuvent supprimer leurs prestations"
    ON public.prestations FOR DELETE
    USING (EXISTS (
        SELECT 1 FROM public.devis
        WHERE devis.id = prestations.devis_id
        AND devis.user_id = auth.uid()
    )); 