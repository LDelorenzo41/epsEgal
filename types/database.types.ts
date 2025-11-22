export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          created_at: string
          full_name: string | null
          role: string
          establishment_id: string | null
        }
        Insert: {
          id: string
          created_at?: string
          full_name?: string | null
          role?: string
          establishment_id?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          full_name?: string | null
          role?: string
          establishment_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_profiles_establishment"
            columns: ["establishment_id"]
            isOneToOne: false
            referencedRelation: "establishments"
            referencedColumns: ["id"]
          }
        ]
      }
      establishments: {
        Row: {
          id: string
          created_at: string
          name: string
          identification_code: string
          max_teachers: number
          nb_students_total: number | null
          nb_students_girls: number | null
          nb_students_boys: number | null
        }
        Insert: {
          id?: string
          created_at?: string
          name: string
          identification_code: string
          max_teachers: number
          nb_students_total?: number | null
          nb_students_girls?: number | null
          nb_students_boys?: number | null
        }
        Update: {
          id?: string
          created_at?: string
          name?: string
          identification_code?: string
          max_teachers?: number
          nb_students_total?: number | null
          nb_students_girls?: number | null
          nb_students_boys?: number | null
        }
        Relationships: []
      }
      levels: {
        Row: {
          id: string
          establishment_id: string
          name: string
          nb_classes: number | null
          created_at: string
        }
        Insert: {
          id?: string
          establishment_id: string
          name: string
          nb_classes?: number | null
          created_at?: string
        }
        Update: {
          id?: string
          establishment_id?: string
          name?: string
          nb_classes?: number | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "levels_establishment_id_fkey"
            columns: ["establishment_id"]
            isOneToOne: false
            referencedRelation: "establishments"
            referencedColumns: ["id"]
          }
        ]
      }
      classes: {
        Row: {
          id: string
          establishment_id: string
          level_id: string
          name: string
          nb_students_total: number | null
          nb_students_girls: number | null
          nb_students_boys: number | null
          created_at: string
        }
        Insert: {
          id?: string
          establishment_id: string
          level_id: string
          name: string
          nb_students_total?: number | null
          nb_students_girls?: number | null
          nb_students_boys?: number | null
          created_at?: string
        }
        Update: {
          id?: string
          establishment_id?: string
          level_id?: string
          name?: string
          nb_students_total?: number | null
          nb_students_girls?: number | null
          nb_students_boys?: number | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "classes_establishment_id_fkey"
            columns: ["establishment_id"]
            isOneToOne: false
            referencedRelation: "establishments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "classes_level_id_fkey"
            columns: ["level_id"]
            isOneToOne: false
            referencedRelation: "levels"
            referencedColumns: ["id"]
          }
        ]
      }
      cp: {
        Row: {
          id: string
          code: string
          label: string
          description: string | null
          created_at: string
        }
        Insert: {
          id?: string
          code: string
          label: string
          description?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          code?: string
          label?: string
          description?: string | null
          created_at?: string
        }
        Relationships: []
      }
      apsa: {
        Row: {
          id: string
          establishment_id: string
          cp_id: string
          name: string
          description: string | null
          created_at: string
        }
        Insert: {
          id?: string
          establishment_id: string
          cp_id: string
          name: string
          description?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          establishment_id?: string
          cp_id?: string
          name?: string
          description?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "apsa_establishment_id_fkey"
            columns: ["establishment_id"]
            isOneToOne: false
            referencedRelation: "establishments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "apsa_cp_id_fkey"
            columns: ["cp_id"]
            isOneToOne: false
            referencedRelation: "cp"
            referencedColumns: ["id"]
          }
        ]
      }
      teacher_classes: {
        Row: {
          id: string
          teacher_id: string
          class_id: string
          created_at: string
        }
        Insert: {
          id?: string
          teacher_id: string
          class_id: string
          created_at?: string
        }
        Update: {
          id?: string
          teacher_id?: string
          class_id?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "teacher_classes_teacher_id_fkey"
            columns: ["teacher_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "teacher_classes_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          }
        ]
      }
      class_activities: {
        Row: {
          id: string
          teacher_class_id: string
          apsa_id: string
          period: string | null
          avg_score_total: number | null
          avg_score_girls: number | null
          avg_score_boys: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          teacher_class_id: string
          apsa_id: string
          period?: string | null
          avg_score_total?: number | null
          avg_score_girls?: number | null
          avg_score_boys?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          teacher_class_id?: string
          apsa_id?: string
          period?: string | null
          avg_score_total?: number | null
          avg_score_girls?: number | null
          avg_score_boys?: number | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "class_activities_teacher_class_id_fkey"
            columns: ["teacher_class_id"]
            isOneToOne: false
            referencedRelation: "teacher_classes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "class_activities_apsa_id_fkey"
            columns: ["apsa_id"]
            isOneToOne: false
            referencedRelation: "apsa"
            referencedColumns: ["id"]
          }
        ]
      }
      equality_labels: {
        Row: {
          id: string
          establishment_id: string
          computed_at: string
          label: string
          details: Json | null
        }
        Insert: {
          id?: string
          establishment_id: string
          computed_at?: string
          label: string
          details?: Json | null
        }
        Update: {
          id?: string
          establishment_id?: string
          computed_at?: string
          label?: string
          details?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "equality_labels_establishment_id_fkey"
            columns: ["establishment_id"]
            isOneToOne: false
            referencedRelation: "establishments"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      generate_establishment_code: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
