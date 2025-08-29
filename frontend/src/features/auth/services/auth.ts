import api from "@/api/axios";

export interface LoginError {
  code: string;
  message: string;
}

export async function loginRequest(username: string, password: string): Promise<{ token: string; isAdmin: boolean }> {
  try {
    const response = await api.post<{ 
      token: string; 
      admin: boolean 
    }>("/api/auth/login", { 
      username, 
      password 
    });
    
    return {
      token: response.data.token,
      isAdmin: response.data.admin
    };
  } catch (error: any) {
    const errorMessage = error.response?.data || "Error al iniciar sesión";
    
    throw new Error(errorMessage);
  }
}

export async function registerRequest(username: string, password: string) {
  const response = await api.post("/api/accounts/register", {
    username,
    password,
  });
  return response.data;
}