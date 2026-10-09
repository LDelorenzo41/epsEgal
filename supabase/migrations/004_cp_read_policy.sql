-- ============================================
-- Fix: Rendre la table cp lisible par les utilisateurs connectés
-- ============================================
-- La RLS a été activée sur public.cp sans aucune policy : plus aucun
-- utilisateur ne pouvait lire les CP. Conséquences :
--   - menu "Compétence Propre" vide (impossible d'ajouter une APSA)
--   - liste des APSA vide dans la page Établissement (impossible
--     d'associer des classes pour l'année en cours)
--   - CP absentes des statistiques
--
-- La table cp est un référentiel global (CP1 à CP5) : les utilisateurs
-- connectés peuvent la lire, personne ne la modifie depuis l'application.
-- ============================================

ALTER TABLE public.cp ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated users can view cp" ON public.cp;

CREATE POLICY "Authenticated users can view cp"
    ON public.cp
    FOR SELECT
    TO authenticated
    USING (true);
