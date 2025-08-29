import api from "@/api/axios";
import type { ItemPropertyDTO } from "@/types/items";

export const itemPropertiesAPI = {
  getAllProperties: async (): Promise<ItemPropertyDTO[]> => {
    const response = await api.get<ItemPropertyDTO[]>("/api/item-properties/all");
    return response.data;
  },

  createProperty: async (propertyData: Partial<ItemPropertyDTO>): Promise<ItemPropertyDTO> => {
    const response = await api.post<ItemPropertyDTO>("/api/item-properties/create", propertyData);
    return response.data;
  },

  updateProperty: async (propertyId: number, propertyData: Partial<ItemPropertyDTO>): Promise<ItemPropertyDTO> => {
    const response = await api.patch<ItemPropertyDTO>(`/api/item-properties/${propertyId}`, propertyData);
    return response.data;
  },

  deleteProperty: async (propertyId: number): Promise<void> => {
    await api.delete(`/api/item-properties/${propertyId}`);
  },

  associatePropertiesToItem: async (propertyIds: number[], itemId: number): Promise<void> => {
    await api.post(`/api/items/${itemId}/properties/add`, {
      listOfIds: propertyIds
    });
  },

  removePropertiesFromItem: async (propertyIds: number[], itemId: number): Promise<void> => {
    await api.put(`/api/items/${itemId}/properties/remove`, {
      listOfIds: propertyIds
    });
  }
};