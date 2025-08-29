import api from "../../../api/axios";
import type { ItemDTO, ItemPropertyDTO } from "@/types/items";

export const itemsAPI = {
  getCharacterItems: async (characterId: string): Promise<ItemDTO[]> => {
    const response = await api.get<ItemDTO[]>("/api/items/all", {
      params: { characterId }
    });
    return response.data;
  },

  getAllItems: async (): Promise<ItemDTO[]> => {
    const response = await api.get<ItemDTO[]>("/api/items/all");
    return response.data;
  },

  getAllItemProperties: async (): Promise<ItemPropertyDTO[]> => {
    const response = await api.get<ItemPropertyDTO[]>("/api/item-properties/all");
    return response.data;
  },

  updateItem: async (itemId: number, itemData: Partial<ItemDTO>): Promise<ItemDTO> => {
    const response = await api.patch<ItemDTO>(`/api/items/${itemId}`, itemData);
    return response.data;
  },

  createItem: async (itemData: Partial<ItemDTO>): Promise<ItemDTO> => {
    const response = await api.post<ItemDTO>("/api/items/create", itemData);
    return response.data;
  },

  deleteItem: async (itemId: number): Promise<void> => {
    await api.delete(`/api/items/${itemId}`);
  },

  updateCharacterItem: async (itemId: number, itemData: Partial<ItemDTO>): Promise<ItemDTO> => {
    const response = await api.patch<ItemDTO>(`/api/items/character-items/${itemId}`, itemData);
    return response.data;
  },

  updateCharacterItemProperty: async (propertyId: number, propertyData: Partial<ItemPropertyDTO>): Promise<ItemPropertyDTO> => {
    const response = await api.patch<ItemPropertyDTO>(`/api/items/character-item-properties/${propertyId}`, propertyData);
    return response.data;
  },

  assignItemsToCharacter: async (characterId: number, itemIds: number[]): Promise<void> => {
    await api.post(`/api/characters/${characterId}/items/add`, {
      listOfIds: itemIds
    });
  },

  addItemToCharacter: async (characterId: number, itemId: number, data: { quantity: number; equipped: boolean }): Promise<void> => {
    await api.post(`/api/characters/${characterId}/items/${itemId}`, data);
  }
};