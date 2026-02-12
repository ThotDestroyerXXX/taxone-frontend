export interface LoginRequest {
  email: string
  password: string
}

export interface AuthResponse {
  token: string
  expiresIn: number
}

export interface User {
  id: string
  email: string
  name: string
  roles: string[]
}

export interface RefreshTokenRequest {
  refreshToken: string
}

export interface RefreshTokenResponse {
  accessToken: string
  refreshToken?: string
  tokenType: string
  expiresIn: number
}

export interface RegisterRequest {
  email: string
  password: string
  name: string
}

export interface RegisterResponse {
  user: User
  message: string
}

export interface ApiError {
  message: string
  status: number
  timestamp: string
  errors?: Record<string, string[]>
}
