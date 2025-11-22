-- ============================================
-- EPS Égalité - Migration initiale
-- ============================================

-- Extension pour générer des UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- 1. TABLE PROFILES
-- ============================================
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    full_name TEXT,
    role TEXT NOT NULL DEFAULT 'teacher' CHECK (role IN ('teacher', 'admin')),
    establishment_id UUID
);

-- Index pour améliorer les performances
CREATE INDEX idx_profiles_establishment_id ON public.profiles(establishment_id);

-- ============================================
-- 2. TABLE ESTABLISHMENTS
-- ============================================
CREATE TABLE IF NOT EXISTS public.establishments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    name TEXT NOT NULL,
    identification_code TEXT NOT NULL UNIQUE,
    max_teachers INTEGER NOT NULL,
    nb_students_total INTEGER,
    nb_students_girls INTEGER,
    nb_students_boys INTEGER
);

-- Index pour recherche rapide par code
CREATE INDEX idx_establishments_code ON public.establishments(identification_code);

-- Ajouter la contrainte FK après création de establishments
ALTER TABLE public.profiles
ADD CONSTRAINT fk_profiles_establishment
FOREIGN KEY (establishment_id)
REFERENCES public.establishments(id)
ON DELETE SET NULL;

-- ============================================
-- 3. TABLE LEVELS
-- ============================================
CREATE TABLE IF NOT EXISTS public.levels (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    establishment_id UUID NOT NULL REFERENCES public.establishments(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    nb_classes INTEGER,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_levels_establishment_id ON public.levels(establishment_id);

-- ============================================
-- 4. TABLE CLASSES
-- ============================================
CREATE TABLE IF NOT EXISTS public.classes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    establishment_id UUID NOT NULL REFERENCES public.establishments(id) ON DELETE CASCADE,
    level_id UUID NOT NULL REFERENCES public.levels(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    nb_students_total INTEGER,
    nb_students_girls INTEGER,
    nb_students_boys INTEGER,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_classes_establishment_id ON public.classes(establishment_id);
CREATE INDEX idx_classes_level_id ON public.classes(level_id);

-- ============================================
-- 5. TABLE CP (Compétences Propres)
-- ============================================
CREATE TABLE IF NOT EXISTS public.cp (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code TEXT NOT NULL UNIQUE,
    label TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Pré-remplir avec CP1 à CP5
INSERT INTO public.cp (code, label, description) VALUES
    ('CP1', 'Réaliser une performance motrice maximale mesurable à une échéance donnée', 'Activités athlétiques, de natation'),
    ('CP2', 'Se déplacer en s''adaptant à des environnements variés et incertains', 'Activités de pleine nature'),
    ('CP3', 'Réaliser une prestation corporelle à visée artistique ou acrobatique', 'Activités artistiques, acrosport, gymnastique'),
    ('CP4', 'Conduire et maîtriser un affrontement individuel ou collectif', 'Sports de combat, sports collectifs'),
    ('CP5', 'Réaliser et orienter son activité physique en vue du développement et de l''entretien de soi', 'Activités de la forme, step, musculation')
ON CONFLICT (code) DO NOTHING;

-- ============================================
-- 6. TABLE APSA
-- ============================================
CREATE TABLE IF NOT EXISTS public.apsa (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    establishment_id UUID NOT NULL REFERENCES public.establishments(id) ON DELETE CASCADE,
    cp_id UUID NOT NULL REFERENCES public.cp(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_apsa_establishment_id ON public.apsa(establishment_id);
CREATE INDEX idx_apsa_cp_id ON public.apsa(cp_id);

-- ============================================
-- 7. TABLE TEACHER_CLASSES
-- ============================================
CREATE TABLE IF NOT EXISTS public.teacher_classes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    teacher_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    class_id UUID NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    UNIQUE(teacher_id, class_id)
);

CREATE INDEX idx_teacher_classes_teacher_id ON public.teacher_classes(teacher_id);
CREATE INDEX idx_teacher_classes_class_id ON public.teacher_classes(class_id);

-- ============================================
-- 8. TABLE CLASS_ACTIVITIES
-- ============================================
CREATE TABLE IF NOT EXISTS public.class_activities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    teacher_class_id UUID NOT NULL REFERENCES public.teacher_classes(id) ON DELETE CASCADE,
    apsa_id UUID NOT NULL REFERENCES public.apsa(id) ON DELETE CASCADE,
    period TEXT,
    avg_score_total NUMERIC(4, 2),
    avg_score_girls NUMERIC(4, 2),
    avg_score_boys NUMERIC(4, 2),
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_class_activities_teacher_class_id ON public.class_activities(teacher_class_id);
CREATE INDEX idx_class_activities_apsa_id ON public.class_activities(apsa_id);

-- ============================================
-- 9. TABLE EQUALITY_LABELS
-- ============================================
CREATE TABLE IF NOT EXISTS public.equality_labels (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    establishment_id UUID NOT NULL REFERENCES public.establishments(id) ON DELETE CASCADE,
    computed_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    label TEXT NOT NULL CHECK (label IN ('Équilibré', 'En progrès', 'À renforcer')),
    details JSONB
);

CREATE INDEX idx_equality_labels_establishment_id ON public.equality_labels(establishment_id);

-- ============================================
-- FONCTION HELPER : Générer un code établissement unique
-- ============================================
CREATE OR REPLACE FUNCTION generate_establishment_code()
RETURNS TEXT AS $$
DECLARE
    code TEXT;
    code_exists BOOLEAN;
BEGIN
    LOOP
        -- Générer un code de 8 caractères alphanumériques
        code := upper(substring(md5(random()::text) from 1 for 8));

        -- Vérifier si le code existe déjà
        SELECT EXISTS(SELECT 1 FROM public.establishments WHERE identification_code = code) INTO code_exists;

        -- Si le code n'existe pas, on sort de la boucle
        IF NOT code_exists THEN
            EXIT;
        END IF;
    END LOOP;

    RETURN code;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- TRIGGER : Mettre à jour updated_at automatiquement
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_class_activities_updated_at
    BEFORE UPDATE ON public.class_activities
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
