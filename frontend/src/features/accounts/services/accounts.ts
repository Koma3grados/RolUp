import api from "@/api/axios";
import type { AccountResponseDTO } from "@/types/accounts";

export interface AccountRequestDTO {
  username?: string;
  currentPassword?: string;
  newPassword?: string;
}

export interface RegisterRequestDTO {
  username: string;
  password: string;
}

export const accountsAPI = {
  register: async (data: RegisterRequestDTO): Promise<AccountResponseDTO> => {
    const response = await api.post<AccountResponseDTO>("/api/accounts/register", data);
    return response.data;
  },

  getMyAccount: async (): Promise<AccountResponseDTO> => {
    const response = await api.get<AccountResponseDTO>("/api/accounts/me");
    return response.data;
  },

  getAllAccounts: async (): Promise<AccountResponseDTO[]> => {
    const response = await api.get<AccountResponseDTO[]>("/api/accounts");
    return response.data;
  },

  getAccount: async (username: string): Promise<AccountResponseDTO> => {
    const response = await api.get<AccountResponseDTO>(`/api/accounts/${username}`);
    return response.data;
  },

  updateMyAccount: async (data: AccountRequestDTO): Promise<AccountResponseDTO> => {
    const response = await api.put<AccountResponseDTO>("/api/accounts/me", data);
    return response.data;
  },

  resetPassword: async (username: string, newPassword: string): Promise<void> => {
    await api.patch(`/api/accounts/${username}/reset-password`, {
      newPassword
    });
  },

  deleteAccount: async (username: string): Promise<string> => {
    const response = await api.delete<string>(`/api/accounts/${username}`);
    return response.data;
  },

  deleteMyAccount: async (): Promise<string> => {
    const response = await api.delete<string>("/api/accounts/me");
    return response.data;
  }
};