export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      chat_participants: {
        Row: {
          chat_id: string
          created_at: string | null
          id: string
          user_id: string
        }
        Insert: {
          chat_id: string
          created_at?: string | null
          id?: string
          user_id: string
        }
        Update: {
          chat_id?: string
          created_at?: string | null
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_participants_chat_id_fkey"
            columns: ["chat_id"]
            isOneToOne: false
            referencedRelation: "chats"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chat_participants_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_requests: {
        Row: {
          created_at: string | null
          id: string
          message: string | null
          recipient_id: string
          sender_id: string
          status: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          message?: string | null
          recipient_id: string
          sender_id: string
          status: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          message?: string | null
          recipient_id?: string
          sender_id?: string
          status?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "chat_requests_recipient_id_fkey"
            columns: ["recipient_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chat_requests_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      chats: {
        Row: {
          created_at: string | null
          id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      deals: {
        Row: {
          additional_terms: string | null
          celebrity_id: string
          completed_at: string | null
          created_at: string | null
          description: string | null
          duration_days: number | null
          exclusivity: boolean | null
          funded_amount: number | null
          id: string
          name: string
          nft_image_url: string | null
          nft_metadata_uri: string | null
          nft_mint_address: string | null
          onchain_id: number | null
          payment_amount: number
          platform_authority: string | null
          royalty_percentage: number | null
          status: string
          studio_id: string
          updated_at: string | null
          usage_rights: string | null
        }
        Insert: {
          additional_terms?: string | null
          celebrity_id: string
          completed_at?: string | null
          created_at?: string | null
          description?: string | null
          duration_days?: number | null
          exclusivity?: boolean | null
          funded_amount?: number | null
          id?: string
          name: string
          nft_image_url?: string | null
          nft_metadata_uri?: string | null
          nft_mint_address?: string | null
          onchain_id?: number | null
          payment_amount: number
          platform_authority?: string | null
          royalty_percentage?: number | null
          status: string
          studio_id: string
          updated_at?: string | null
          usage_rights?: string | null
        }
        Update: {
          additional_terms?: string | null
          celebrity_id?: string
          completed_at?: string | null
          created_at?: string | null
          description?: string | null
          duration_days?: number | null
          exclusivity?: boolean | null
          funded_amount?: number | null
          id?: string
          name?: string
          nft_image_url?: string | null
          nft_metadata_uri?: string | null
          nft_mint_address?: string | null
          onchain_id?: number | null
          payment_amount?: number
          platform_authority?: string | null
          royalty_percentage?: number | null
          status?: string
          studio_id?: string
          updated_at?: string | null
          usage_rights?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "deals_celebrity_id_fkey"
            columns: ["celebrity_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deals_studio_id_fkey"
            columns: ["studio_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          chat_id: string
          content: string
          created_at: string | null
          id: string
          is_read: boolean | null
          sender_id: string
        }
        Insert: {
          chat_id: string
          content: string
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          sender_id: string
        }
        Update: {
          chat_id?: string
          content?: string
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_chat_id_fkey"
            columns: ["chat_id"]
            isOneToOne: false
            referencedRelation: "chats"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      nft_certificates: {
        Row: {
          created_at: string
          deal_id: string
          description: string | null
          id: string
          image_url: string | null
          metadata_uri: string
          mint_address: string
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          deal_id: string
          description?: string | null
          id?: string
          image_url?: string | null
          metadata_uri: string
          mint_address: string
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          deal_id?: string
          description?: string | null
          id?: string
          image_url?: string | null
          metadata_uri?: string
          mint_address?: string
          name?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "nft_certificates_deal_id_fkey"
            columns: ["deal_id"]
            isOneToOne: false
            referencedRelation: "deals"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          category: string | null
          created_at: string | null
          description: string | null
          discord_url: string | null
          id: string
          instagram_url: string | null
          name: string
          profile_image_url: string | null
          twitter_url: string | null
          updated_at: string | null
          user_type: string
          verification_document_url: string | null
          verified: boolean | null
          wallet_address: string
          website: string | null
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          description?: string | null
          discord_url?: string | null
          id?: string
          instagram_url?: string | null
          name: string
          profile_image_url?: string | null
          twitter_url?: string | null
          updated_at?: string | null
          user_type: string
          verification_document_url?: string | null
          verified?: boolean | null
          wallet_address: string
          website?: string | null
        }
        Update: {
          category?: string | null
          created_at?: string | null
          description?: string | null
          discord_url?: string | null
          id?: string
          instagram_url?: string | null
          name?: string
          profile_image_url?: string | null
          twitter_url?: string | null
          updated_at?: string | null
          user_type?: string
          verification_document_url?: string | null
          verified?: boolean | null
          wallet_address?: string
          website?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      create_chat_from_request: {
        Args: {
          request_id: string
        }
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

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
