-- ============================================
-- EPS Égalité - Politiques RLS (Row Level Security)
-- ============================================

-- ============================================
-- Activer RLS sur toutes les tables
-- ============================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.establishments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.levels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.classes ENABLE ROW LEVEL SECURITY;
-- La table cp est globale, pas besoin de RLS
ALTER TABLE public.apsa ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teacher_classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.class_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.equality_labels ENABLE ROW LEVEL SECURITY;

-- ============================================
-- POLICIES POUR PROFILES
-- ============================================

-- Les utilisateurs peuvent voir leur propre profil
CREATE POLICY "Users can view own profile"
    ON public.profiles
    FOR SELECT
    USING (auth.uid() = id);

-- Les utilisateurs peuvent voir les profils des collègues du même établissement
CREATE POLICY "Users can view colleagues profiles"
    ON public.profiles
    FOR SELECT
    USING (
        establishment_id IS NOT NULL
        AND establishment_id IN (
            SELECT establishment_id
            FROM public.profiles
            WHERE id = auth.uid()
        )
    );

-- Les utilisateurs peuvent mettre à jour leur propre profil
CREATE POLICY "Users can update own profile"
    ON public.profiles
    FOR UPDATE
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- Les nouveaux utilisateurs peuvent insérer leur profil
CREATE POLICY "Users can insert own profile"
    ON public.profiles
    FOR INSERT
    WITH CHECK (auth.uid() = id);

-- ============================================
-- POLICIES POUR ESTABLISHMENTS
-- ============================================

-- Les utilisateurs peuvent voir leur propre établissement
CREATE POLICY "Users can view own establishment"
    ON public.establishments
    FOR SELECT
    USING (
        id IN (
            SELECT establishment_id
            FROM public.profiles
            WHERE profiles.id = auth.uid()
        )
    );

-- Permettre la lecture du code pour vérification lors de l'inscription
CREATE POLICY "Anyone can check establishment code existence"
    ON public.establishments
    FOR SELECT
    USING (true);

-- Les utilisateurs peuvent créer un établissement (lors de l'inscription)
CREATE POLICY "Users can create establishment"
    ON public.establishments
    FOR INSERT
    WITH CHECK (true);

-- Les utilisateurs peuvent mettre à jour leur établissement
CREATE POLICY "Users can update own establishment"
    ON public.establishments
    FOR UPDATE
    USING (
        id IN (
            SELECT establishment_id
            FROM public.profiles
            WHERE profiles.id = auth.uid()
        )
    )
    WITH CHECK (
        id IN (
            SELECT establishment_id
            FROM public.profiles
            WHERE profiles.id = auth.uid()
        )
    );

-- ============================================
-- POLICIES POUR LEVELS
-- ============================================

-- Les utilisateurs peuvent voir les niveaux de leur établissement
CREATE POLICY "Users can view establishment levels"
    ON public.levels
    FOR SELECT
    USING (
        establishment_id IN (
            SELECT establishment_id
            FROM public.profiles
            WHERE id = auth.uid()
        )
    );

-- Les utilisateurs peuvent créer des niveaux pour leur établissement
CREATE POLICY "Users can create establishment levels"
    ON public.levels
    FOR INSERT
    WITH CHECK (
        establishment_id IN (
            SELECT establishment_id
            FROM public.profiles
            WHERE id = auth.uid()
        )
    );

-- Les utilisateurs peuvent mettre à jour les niveaux de leur établissement
CREATE POLICY "Users can update establishment levels"
    ON public.levels
    FOR UPDATE
    USING (
        establishment_id IN (
            SELECT establishment_id
            FROM public.profiles
            WHERE id = auth.uid()
        )
    )
    WITH CHECK (
        establishment_id IN (
            SELECT establishment_id
            FROM public.profiles
            WHERE id = auth.uid()
        )
    );

-- Les utilisateurs peuvent supprimer les niveaux de leur établissement
CREATE POLICY "Users can delete establishment levels"
    ON public.levels
    FOR DELETE
    USING (
        establishment_id IN (
            SELECT establishment_id
            FROM public.profiles
            WHERE id = auth.uid()
        )
    );

-- ============================================
-- POLICIES POUR CLASSES
-- ============================================

-- Les utilisateurs peuvent voir les classes de leur établissement
CREATE POLICY "Users can view establishment classes"
    ON public.classes
    FOR SELECT
    USING (
        establishment_id IN (
            SELECT establishment_id
            FROM public.profiles
            WHERE id = auth.uid()
        )
    );

-- Les utilisateurs peuvent créer des classes pour leur établissement
CREATE POLICY "Users can create establishment classes"
    ON public.classes
    FOR INSERT
    WITH CHECK (
        establishment_id IN (
            SELECT establishment_id
            FROM public.profiles
            WHERE id = auth.uid()
        )
    );

-- Les utilisateurs peuvent mettre à jour les classes de leur établissement
CREATE POLICY "Users can update establishment classes"
    ON public.classes
    FOR UPDATE
    USING (
        establishment_id IN (
            SELECT establishment_id
            FROM public.profiles
            WHERE id = auth.uid()
        )
    )
    WITH CHECK (
        establishment_id IN (
            SELECT establishment_id
            FROM public.profiles
            WHERE id = auth.uid()
        )
    );

-- Les utilisateurs peuvent supprimer les classes de leur établissement
CREATE POLICY "Users can delete establishment classes"
    ON public.classes
    FOR DELETE
    USING (
        establishment_id IN (
            SELECT establishment_id
            FROM public.profiles
            WHERE id = auth.uid()
        )
    );

-- ============================================
-- POLICIES POUR APSA
-- ============================================

-- Les utilisateurs peuvent voir les APSA de leur établissement
CREATE POLICY "Users can view establishment apsa"
    ON public.apsa
    FOR SELECT
    USING (
        establishment_id IN (
            SELECT establishment_id
            FROM public.profiles
            WHERE id = auth.uid()
        )
    );

-- Les utilisateurs peuvent créer des APSA pour leur établissement
CREATE POLICY "Users can create establishment apsa"
    ON public.apsa
    FOR INSERT
    WITH CHECK (
        establishment_id IN (
            SELECT establishment_id
            FROM public.profiles
            WHERE id = auth.uid()
        )
    );

-- Les utilisateurs peuvent mettre à jour les APSA de leur établissement
CREATE POLICY "Users can update establishment apsa"
    ON public.apsa
    FOR UPDATE
    USING (
        establishment_id IN (
            SELECT establishment_id
            FROM public.profiles
            WHERE id = auth.uid()
        )
    )
    WITH CHECK (
        establishment_id IN (
            SELECT establishment_id
            FROM public.profiles
            WHERE id = auth.uid()
        )
    );

-- Les utilisateurs peuvent supprimer les APSA de leur établissement
CREATE POLICY "Users can delete establishment apsa"
    ON public.apsa
    FOR DELETE
    USING (
        establishment_id IN (
            SELECT establishment_id
            FROM public.profiles
            WHERE id = auth.uid()
        )
    );

-- ============================================
-- POLICIES POUR TEACHER_CLASSES
-- ============================================

-- Les utilisateurs peuvent voir leurs propres associations classe-prof
CREATE POLICY "Teachers can view own classes"
    ON public.teacher_classes
    FOR SELECT
    USING (teacher_id = auth.uid());

-- Les utilisateurs peuvent voir les associations des collègues du même établissement
CREATE POLICY "Teachers can view colleagues classes"
    ON public.teacher_classes
    FOR SELECT
    USING (
        teacher_id IN (
            SELECT id
            FROM public.profiles
            WHERE establishment_id IN (
                SELECT establishment_id
                FROM public.profiles
                WHERE id = auth.uid()
            )
        )
    );

-- Les utilisateurs peuvent créer leurs propres associations
CREATE POLICY "Teachers can create own class associations"
    ON public.teacher_classes
    FOR INSERT
    WITH CHECK (teacher_id = auth.uid());

-- Les utilisateurs peuvent supprimer leurs propres associations
CREATE POLICY "Teachers can delete own class associations"
    ON public.teacher_classes
    FOR DELETE
    USING (teacher_id = auth.uid());

-- ============================================
-- POLICIES POUR CLASS_ACTIVITIES
-- ============================================

-- Les utilisateurs peuvent voir les activités de leurs classes
CREATE POLICY "Teachers can view own class activities"
    ON public.class_activities
    FOR SELECT
    USING (
        teacher_class_id IN (
            SELECT id
            FROM public.teacher_classes
            WHERE teacher_id = auth.uid()
        )
    );

-- Les utilisateurs peuvent voir les activités des collègues (pour stats établissement)
CREATE POLICY "Teachers can view colleagues activities"
    ON public.class_activities
    FOR SELECT
    USING (
        teacher_class_id IN (
            SELECT tc.id
            FROM public.teacher_classes tc
            JOIN public.profiles p ON tc.teacher_id = p.id
            WHERE p.establishment_id IN (
                SELECT establishment_id
                FROM public.profiles
                WHERE id = auth.uid()
            )
        )
    );

-- Les utilisateurs peuvent créer des activités pour leurs classes
CREATE POLICY "Teachers can create own class activities"
    ON public.class_activities
    FOR INSERT
    WITH CHECK (
        teacher_class_id IN (
            SELECT id
            FROM public.teacher_classes
            WHERE teacher_id = auth.uid()
        )
    );

-- Les utilisateurs peuvent mettre à jour les activités de leurs classes
CREATE POLICY "Teachers can update own class activities"
    ON public.class_activities
    FOR UPDATE
    USING (
        teacher_class_id IN (
            SELECT id
            FROM public.teacher_classes
            WHERE teacher_id = auth.uid()
        )
    )
    WITH CHECK (
        teacher_class_id IN (
            SELECT id
            FROM public.teacher_classes
            WHERE teacher_id = auth.uid()
        )
    );

-- Les utilisateurs peuvent supprimer les activités de leurs classes
CREATE POLICY "Teachers can delete own class activities"
    ON public.class_activities
    FOR DELETE
    USING (
        teacher_class_id IN (
            SELECT id
            FROM public.teacher_classes
            WHERE teacher_id = auth.uid()
        )
    );

-- ============================================
-- POLICIES POUR EQUALITY_LABELS
-- ============================================

-- Les utilisateurs peuvent voir le label de leur établissement
CREATE POLICY "Users can view establishment label"
    ON public.equality_labels
    FOR SELECT
    USING (
        establishment_id IN (
            SELECT establishment_id
            FROM public.profiles
            WHERE id = auth.uid()
        )
    );

-- Les utilisateurs peuvent créer/mettre à jour le label de leur établissement
CREATE POLICY "Users can manage establishment label"
    ON public.equality_labels
    FOR ALL
    USING (
        establishment_id IN (
            SELECT establishment_id
            FROM public.profiles
            WHERE id = auth.uid()
        )
    )
    WITH CHECK (
        establishment_id IN (
            SELECT establishment_id
            FROM public.profiles
            WHERE id = auth.uid()
        )
    );
