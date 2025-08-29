import type { Source } from "@/types/enums";
import api from "@/api/axios";
import type { CharacterDTO, CharacterSummaryDTO } from "@/types/characters";

export const charactersAPI = {
  fetchCharacters: async (): Promise<CharacterSummaryDTO[]> => {
    const response = await api.get<CharacterSummaryDTO[]>("/api/characters");
    return response.data;
  },

  createCharacter: async (characterData: { name: string }): Promise<any> => {
    const response = await api.post("/api/characters/create", characterData);
    return response.data;
  },

  deleteCharacter: async (characterId: number): Promise<void> => {
    await api.delete(`/api/characters/${characterId}`);
  },

  getCharacter: async (id: number): Promise<CharacterDTO> => {
    const response = await api.get<CharacterDTO>(`/api/characters/${id}`);
    return response.data;
  },

  updateCharacter: async (id: number, data: Partial<CharacterDTO>): Promise<CharacterDTO> => {
    const response = await api.patch<CharacterDTO>(`/api/characters/${id}/update`, data);
    return response.data;
  },


  // En tu archivo charactersAPI
  addSpellsToCharacter: async (characterId: number, spellIds: number[], source: Source): Promise<void> => {
    await api.post(`/api/characters/${characterId}/spells/add`, {
      listOfIds: spellIds,
      source: source // Enviar el enum, no string hardcodeado
    });
  },

  removeSpellsFromCharacter: async (characterId: number, spellIds: number[], source: Source): Promise<void> => {
    await api.put(`/api/characters/${characterId}/spells/remove`, {
      listOfIds: spellIds,
      source: source
    });
  },
};