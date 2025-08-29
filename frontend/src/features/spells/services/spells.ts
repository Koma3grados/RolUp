import api from "@/api/axios";
import type { SpellDTO } from "@/types/spells";

export const spellsAPI = {
  getAllSpells: async (characterId?: string): Promise<SpellDTO[]> => {
    const url = characterId 
      ? `/api/spells/all?characterId=${characterId}`
      : `/api/spells/all`;
    const response = await api.get<SpellDTO[]>(url);
    return response.data;
  },

  toggleFavorite: async (spellId: number, characterId: string): Promise<void> => {
    await api.patch(`/api/spells/${spellId}/toggle-favourite?characterId=${characterId}`);
  },

  togglePrepared: async (spellId: number, characterId: string): Promise<void> => {
    await api.patch(`/api/spells/${spellId}/toggle-prepared?characterId=${characterId}`);
  },

  createSpell: async (spellData: Partial<SpellDTO>): Promise<SpellDTO> => {
    const response = await api.post<SpellDTO>("/api/spells/create", spellData);
    return response.data;
  },

  updateSpell: async (spellId: number, spellData: Partial<SpellDTO>): Promise<SpellDTO> => {
    const response = await api.patch<SpellDTO>(`/api/spells/${spellId}`, spellData);
    return response.data;
  },

  deleteSpell: async (spellId: number): Promise<void> => {
    await api.delete(`/api/spells/${spellId}`);
  },

};