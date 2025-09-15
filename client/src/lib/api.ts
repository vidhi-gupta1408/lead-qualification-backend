import { apiRequest } from "./queryClient";

export interface OfferData {
  name: string;
  value_props: string;
  ideal_use_cases: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  errors?: any[];
}

export const api = {
  // Submit offer data
  submitOffer: async (data: OfferData): Promise<ApiResponse> => {
    const response = await apiRequest("POST", "/api/offer", data);
    return response.json();
  },

  // Upload CSV file
  uploadLeads: async (file: File): Promise<ApiResponse> => {
    const formData = new FormData();
    formData.append('csvFile', file);
    
    const response = await fetch('/api/leads/upload', {
      method: 'POST',
      body: formData,
      credentials: 'include',
    });
    
    if (!response.ok) {
      const error = await response.text();
      throw new Error(`${response.status}: ${error}`);
    }
    
    return response.json();
  },

  // Start scoring pipeline
  scoreLeads: async (): Promise<ApiResponse> => {
    const response = await apiRequest("POST", "/api/score");
    return response.json();
  },

  // Get scoring results
  getResults: async (): Promise<ApiResponse> => {
    const response = await apiRequest("GET", "/api/results");
    return response.json();
  },

  // Export results as CSV
  exportCsv: async (): Promise<void> => {
    const response = await fetch('/api/results/csv', {
      credentials: 'include',
    });
    
    if (!response.ok) {
      throw new Error('Failed to export CSV');
    }
    
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'lead_scores.csv';
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  },
};
