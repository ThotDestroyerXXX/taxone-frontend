import apiClient from './axios'

/**
 * Example API module showing how to use the axios instance
 * Replace this with your actual API endpoints
 */

// Example: Get list of items
export const getItems = async () => {
  const response = await apiClient.get('/items')
  return response.data
}

// Example: Get single item by ID
export const getItemById = async (id: string) => {
  const response = await apiClient.get(`/items/${id}`)
  return response.data
}

// Example: Create new item
export const createItem = async (data: any) => {
  const response = await apiClient.post('/items', data)
  return response.data
}

// Example: Update item
export const updateItem = async (id: string, data: any) => {
  const response = await apiClient.put(`/items/${id}`, data)
  return response.data
}

// Example: Delete item
export const deleteItem = async (id: string) => {
  const response = await apiClient.delete(`/items/${id}`)
  return response.data
}

// Example: Upload file
export const uploadFile = async (file: File) => {
  const formData = new FormData()
  formData.append('file', file)

  const response = await apiClient.post('/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })

  return response.data
}
