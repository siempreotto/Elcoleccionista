// Generado con Supabase (generate_typescript_types). No editar a mano.
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: "14.18"
  }
  public: {
    Tables: {
      admins: {
        Row: { created_at: string; user_id: string }
        Insert: { created_at?: string; user_id: string }
        Update: { created_at?: string; user_id?: string }
        Relationships: []
      }
      combo_categories: {
        Row: {
          blurb: string
          card_alone: number
          combo_with_mega_box: number | null
          combo_with_value_box: number
          id: string
          position: number
          stock: number | null
          updated_at: string
        }
        Insert: {
          blurb?: string
          card_alone: number
          combo_with_mega_box?: number | null
          combo_with_value_box: number
          id: string
          position?: number
          stock?: number | null
          updated_at?: string
        }
        Update: {
          blurb?: string
          card_alone?: number
          combo_with_mega_box?: number | null
          combo_with_value_box?: number
          id?: string
          position?: number
          stock?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      order_items: {
        Row: {
          combo_box_product_id: string | null
          combo_category: string | null
          description: string
          id: string
          kind: Database["public"]["Enums"]["order_item_kind"]
          order_id: string
          product_id: string | null
          qty: number
          unit_price: number
        }
        Insert: {
          combo_box_product_id?: string | null
          combo_category?: string | null
          description: string
          id?: string
          kind: Database["public"]["Enums"]["order_item_kind"]
          order_id: string
          product_id?: string | null
          qty: number
          unit_price: number
        }
        Update: {
          combo_box_product_id?: string | null
          combo_category?: string | null
          description?: string
          id?: string
          kind?: Database["public"]["Enums"]["order_item_kind"]
          order_id?: string
          product_id?: string | null
          qty?: number
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          address: string | null
          code: string
          created_at: string
          customer_name: string
          delivery: Database["public"]["Enums"]["delivery_method"]
          delivery_cost: number
          delivery_cost_pending: boolean
          department: string | null
          email: string | null
          id: string
          notes: string | null
          payment_method: string
          status: Database["public"]["Enums"]["order_status"]
          subtotal: number
          total: number
          updated_at: string
          whatsapp: string
        }
        Insert: {
          address?: string | null
          code: string
          created_at?: string
          customer_name: string
          delivery: Database["public"]["Enums"]["delivery_method"]
          delivery_cost?: number
          delivery_cost_pending?: boolean
          department?: string | null
          email?: string | null
          id?: string
          notes?: string | null
          payment_method: string
          status?: Database["public"]["Enums"]["order_status"]
          subtotal: number
          total: number
          updated_at?: string
          whatsapp: string
        }
        Update: {
          address?: string | null
          code?: string
          created_at?: string
          customer_name?: string
          delivery?: Database["public"]["Enums"]["delivery_method"]
          delivery_cost?: number
          delivery_cost_pending?: boolean
          department?: string | null
          email?: string | null
          id?: string
          notes?: string | null
          payment_method?: string
          status?: Database["public"]["Enums"]["order_status"]
          subtotal?: number
          total?: number
          updated_at?: string
          whatsapp?: string
        }
        Relationships: []
      }
      product_images: {
        Row: {
          alt: string
          created_at: string
          id: string
          kind: string
          position: number
          product_id: string
          storage_path: string
        }
        Insert: {
          alt?: string
          created_at?: string
          id?: string
          kind?: string
          position?: number
          product_id: string
          storage_path: string
        }
        Update: {
          alt?: string
          created_at?: string
          id?: string
          kind?: string
          position?: number
          product_id?: string
          storage_path?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_images_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          cards_per_pack: number | null
          combo_category: string | null
          competition: string | null
          created_at: string
          featured: boolean
          id: string
          name: string
          packs: number | null
          price_gtq: number | null
          published: boolean
          ref_price_date: string | null
          ref_price_gtq: number | null
          ref_price_source: string | null
          seo_description: string
          seo_title: string
          short_detail: string
          slug: string
          sort_order: number
          specs: Json
          stock: number | null
          story_body: string
          story_note: string
          story_title: string
          tags: string[]
          type: Database["public"]["Enums"]["product_type"]
          updated_at: string
        }
        Insert: {
          cards_per_pack?: number | null
          combo_category?: string | null
          competition?: string | null
          created_at?: string
          featured?: boolean
          id?: string
          name: string
          packs?: number | null
          price_gtq?: number | null
          published?: boolean
          ref_price_date?: string | null
          ref_price_gtq?: number | null
          ref_price_source?: string | null
          seo_description?: string
          seo_title?: string
          short_detail?: string
          slug: string
          sort_order?: number
          specs?: Json
          stock?: number | null
          story_body?: string
          story_note?: string
          story_title?: string
          tags?: string[]
          type: Database["public"]["Enums"]["product_type"]
          updated_at?: string
        }
        Update: {
          cards_per_pack?: number | null
          combo_category?: string | null
          competition?: string | null
          created_at?: string
          featured?: boolean
          id?: string
          name?: string
          packs?: number | null
          price_gtq?: number | null
          published?: boolean
          ref_price_date?: string | null
          ref_price_gtq?: number | null
          ref_price_source?: string | null
          seo_description?: string
          seo_title?: string
          short_detail?: string
          slug?: string
          sort_order?: number
          specs?: Json
          stock?: number | null
          story_body?: string
          story_note?: string
          story_title?: string
          tags?: string[]
          type?: Database["public"]["Enums"]["product_type"]
          updated_at?: string
        }
        Relationships: []
      }
      settings: {
        Row: {
          id: boolean
          instagram: string
          mega_box_price: number
          mega_combo_mode: string
          pickup_hours: string | null
          pickup_point: string | null
          shipping_cost: number | null
          updated_at: string
          value_box_price: number
          whatsapp: string | null
        }
        Insert: {
          id?: boolean
          instagram?: string
          mega_box_price: number
          mega_combo_mode?: string
          pickup_hours?: string | null
          pickup_point?: string | null
          shipping_cost?: number | null
          updated_at?: string
          value_box_price: number
          whatsapp?: string | null
        }
        Update: {
          id?: boolean
          instagram?: string
          mega_box_price?: number
          mega_combo_mode?: string
          pickup_hours?: string | null
          pickup_point?: string | null
          shipping_cost?: number | null
          updated_at?: string
          value_box_price?: number
          whatsapp?: string | null
        }
        Relationships: []
      }
      vending_waitlist: {
        Row: { created_at: string; email: string; id: string }
        Insert: { created_at?: string; email: string; id?: string }
        Update: { created_at?: string; email?: string; id?: string }
        Relationships: []
      }
    }
    Views: { [_ in never]: never }
    Functions: {
      combo_price: {
        Args: { box_type: Database["public"]["Enums"]["product_type"]; category_id: string }
        Returns: number
      }
      place_order: { Args: { payload: Json }; Returns: Json }
    }
    Enums: {
      delivery_method: "envio" | "recoger"
      order_item_kind: "product" | "combo" | "surprise"
      order_status: "nuevo" | "confirmado" | "pagado" | "enviado" | "entregado" | "cancelado"
      product_type: "value_box" | "mega_box" | "single_card" | "accessory"
    }
    CompositeTypes: { [_ in never]: never }
  }
}

export type Tables<T extends keyof Database["public"]["Tables"]> = Database["public"]["Tables"][T]["Row"]
export type Enums<T extends keyof Database["public"]["Enums"]> = Database["public"]["Enums"][T]
