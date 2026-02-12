export interface ApiErrorResponse {
  status: number
  message: string
  errors: FieldErrors[]
}

export interface FieldErrors {
  field: string
  message: string
}
