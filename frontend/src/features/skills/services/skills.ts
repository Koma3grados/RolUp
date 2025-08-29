import api from "@/api/axios";
import type { SkillDTO } from "@/types/skills";

export const skillsAPI = {
  getSkillsByCharacter: async (characterId: string): Promise<SkillDTO[]> => {
    const response = await api.get<SkillDTO[]>(`/api/skills/all?characterId=${characterId}`);
    return response.data;
  },

  updateSkillUses: async (skillId: number, characterId: string, uses: number): Promise<void> => {
    await api.patch(`/api/skills/${skillId}/change-current-uses?characterId=${characterId}&uses=${uses}`);
  },

  getAllSkills: async (): Promise<SkillDTO[]> => {
    const response = await api.get<SkillDTO[]>("/api/skills/all");
    return response.data;
  },
  
  createSkill: async (skillData: any): Promise<SkillDTO> => {
    const response = await api.post<SkillDTO>("/api/skills/create", skillData);
    return response.data;
  },
  
  updateSkill: async (id: number, skillData: any): Promise<SkillDTO> => {
    const response = await api.patch<SkillDTO>(`/api/skills/${id}`, skillData);
    return response.data;
  },

  deleteSkill: async (id: number): Promise<void> => {
    await api.delete(`/api/skills/${id}`);
  },

  associateSkillsToCharacter: async (characterId: string, skillIds: number[], source: string): Promise<void> => {
    await api.post(`/api/characters/${characterId}/skills/add`, {
      listOfIds: skillIds,
      source: source.toUpperCase()
    });
  },

  disassociateSkillsFromCharacter: async (characterId: string, skillIds: number[], source: string): Promise<void> => {
    await api.put(`/api/characters/${characterId}/skills/remove`, {
      listOfIds: skillIds,
      source: source.toUpperCase()
    });
  }
};