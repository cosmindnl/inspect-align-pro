import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useProfile } from "./useProfile";

export interface Equipment {
  id: string;
  company_id: string;
  name: string;
  manufacturer: string | null;
  model: string | null;
  serial_number: string | null;
  verification_valid_until: string | null;
  verification_certificate_number: string | null;
  category: string | null;
  notes: string | null;
  is_active: boolean | null;
  created_at: string | null;
  updated_at: string | null;
}

export type EquipmentInsert = Omit<Equipment, 'id' | 'created_at' | 'updated_at'>;
export type EquipmentUpdate = Partial<EquipmentInsert>;

export const equipmentCategories = [
  "Multimetru digital",
  "Megohmetru (tester izolație)",
  "Tester RCD/PRCD",
  "Tester impedanță buclă",
  "Tester continuitate",
  "Luxmetru",
  "Termometru",
  "Analizor rețea",
  "Altele",
];

export const knownManufacturers = [
  "Fluke",
  "Metrel",
  "Megger",
  "Sonel",
  "Kyoritsu",
  "Hioki",
  "Chauvin Arnoux",
  "Amprobe",
  "Gossen Metrawatt",
  "Beha-Amprobe",
];

export function useEquipment() {
  const { data: profile } = useProfile();

  return useQuery({
    queryKey: ["equipment", profile?.company_id],
    queryFn: async () => {
      if (!profile?.company_id) return [];
      
      const { data, error } = await supabase
        .from("equipment")
        .select("*")
        .eq("company_id", profile.company_id)
        .order("name");

      if (error) throw error;
      return data as Equipment[];
    },
    enabled: !!profile?.company_id,
  });
}

export function useActiveEquipment() {
  const { data: profile } = useProfile();

  return useQuery({
    queryKey: ["equipment", "active", profile?.company_id],
    queryFn: async () => {
      if (!profile?.company_id) return [];
      
      const { data, error } = await supabase
        .from("equipment")
        .select("*")
        .eq("company_id", profile.company_id)
        .eq("is_active", true)
        .order("name");

      if (error) throw error;
      return data as Equipment[];
    },
    enabled: !!profile?.company_id,
  });
}

export function useCreateEquipment() {
  const queryClient = useQueryClient();
  const { data: profile } = useProfile();

  return useMutation({
    mutationFn: async (equipment: Omit<EquipmentInsert, 'company_id'>) => {
      if (!profile?.company_id) throw new Error("Nu există companie asociată");
      
      const { data, error } = await supabase
        .from("equipment")
        .insert({
          ...equipment,
          company_id: profile.company_id,
        })
        .select()
        .single();

      if (error) throw error;
      return data as Equipment;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["equipment"] });
    },
  });
}

export function useUpdateEquipment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: string } & EquipmentUpdate) => {
      const { data, error } = await supabase
        .from("equipment")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data as Equipment;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["equipment"] });
    },
  });
}

export function useDeleteEquipment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("equipment")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["equipment"] });
    },
  });
}
