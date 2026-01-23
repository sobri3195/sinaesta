import { apiClient } from '../apiClient';

export const templateEndpoints = {
  getQuestionTemplate: (specialty: string, type: 'xlsx' | 'csv' = 'xlsx') => {
    // For downloads, we use a different approach than standard JSON API calls
    const token = localStorage.getItem('accessToken');
    const url = `${import.meta.env.VITE_API_URL || 'http://localhost:3001/api'}/templates/questions?specialty=${encodeURIComponent(specialty)}&type=${type}`;
    
    // Create a hidden link and click it to trigger browser download
    const link = document.createElement('a');
    link.href = url;
    // We add the token if available for authentication
    if (token) {
        // Since we can't easily add headers to a direct link download without using fetch/blob
        // we'll use the fetch approach to include headers
        return fetch(url, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })
        .then(response => {
            if (!response.ok) throw new Error('Download failed');
            return response.blob();
        })
        .then(blob => {
            const blobUrl = URL.createObjectURL(blob);
            link.href = blobUrl;
            link.download = `template_soal_${specialty.replace(/\s+/g, '_').toLowerCase()}.${type}`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(blobUrl);
        });
    } else {
        link.download = `template_soal_${specialty.replace(/\s+/g, '_').toLowerCase()}.${type}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        return Promise.resolve();
    }
  }
};
