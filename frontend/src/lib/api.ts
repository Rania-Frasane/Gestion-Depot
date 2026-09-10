import axios from 'axios';
import { toast } from 'sonner';

export const api = axios.create({
  baseURL: '/api/',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach token to requests
api.interceptors.request.use((config) => {
  const token = typeof window !== 'undefined' ? localStorage.getItem("token") : null;
  if (token && !config.url?.includes('login')) {
    config.headers.Authorization = `Token ${token}`;
  }
  
  if (config.data instanceof FormData) {
    delete config.headers['Content-Type'];
  }
  
  return config;
});

// Global error handling with toast
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const data = error.response?.data;
    console.error("API Error:", error.response?.status, data);
    
    const isLoginPage = typeof window !== 'undefined' && window.location.pathname === '/login';
    
    if (error.response?.status === 401 && !isLoginPage) {
      localStorage.removeItem("token");
      localStorage.removeItem("username");
      window.location.href = "/login";
    }
    
    // Extract the most descriptive message from DRF validation errors
    let message = "Erreur de communication avec le serveur";
    if (data) {
      if (typeof data === 'string') {
        message = data;
      } else if (data.detail) {
        message = data.detail;
      } else if (data.error) {
        message = data.error;
      } else if (typeof data === 'object') {
        // DRF field validation errors come as { field: ["error msg"] }
        const fieldErrors = Object.entries(data)
          .map(([field, errs]) => `${field}: ${Array.isArray(errs) ? errs.join(', ') : errs}`)
          .join(' | ');
        if (fieldErrors) message = fieldErrors;
      }
    }
    
    if (!(error.response?.status === 401 && isLoginPage)) {
      toast.error("Erreur", {
        description: message,
      });
    }
    
    return Promise.reject(error);
  }
);

// Core API Functions
export const fetchDashboardStats = () => api.get('dashboard-stats/').then(res => res.data);

export const fetchProduits = () => api.get('produits/').then(res => res.data);
export const createProduit = (data: any) => api.post('produits/', data).then(res => res.data);
export const updateProduit = (id: number, data: any) => api.put(`produits/${id}/`, data).then(res => res.data);
export const deleteProduit = (id: number) => api.delete(`produits/${id}/`).then(res => res.data);
export const regenerateQr = (id: number) => api.post(`produits/${id}/regenerate-qr/`).then(res => res.data);

export const fetchFournisseurs = () => api.get('fournisseurs/').then(res => res.data);
export const createFournisseur = (data: any) => api.post('fournisseurs/', data).then(res => res.data);
export const updateFournisseur = (id: number, data: any) => api.patch(`fournisseurs/${id}/`, data).then(res => res.data);
export const deleteFournisseur = (id: number) => api.delete(`fournisseurs/${id}/`).then(res => res.data);

export const fetchClients = () => api.get('clients/').then(res => res.data);
export const createClient = (data: any) => api.post('clients/', data).then(res => res.data);
export const updateClient = (id: number, data: any) => api.patch(`clients/${id}/`, data).then(res => res.data);
export const deleteClient = (id: number) => api.delete(`clients/${id}/`).then(res => res.data);
export const downloadClientsPdf = () => api.get('clients/export_pdf/', { responseType: 'blob' });

export const fetchEntrepots = () => api.get('entrepots/').then(res => res.data);
export const createEntrepot = (data: any) => api.post('entrepots/', data).then(res => res.data);
export const updateEntrepot = (id: number, data: any) => api.put(`entrepots/${id}/`, data).then(res => res.data);
export const deleteEntrepot = (id: number) => api.delete(`entrepots/${id}/`).then(res => res.data);

export const fetchEmplacements = (entrepotId?: number) =>
  api.get('emplacements/', { params: entrepotId ? { entrepot: entrepotId } : {} }).then(res => res.data);
export const createEmplacement = (data: any) => api.post('emplacements/', data).then(res => res.data);
export const updateEmplacement = (id: number, data: any) => api.put(`emplacements/${id}/`, data).then(res => res.data);
export const deleteEmplacement = (id: number) => api.delete(`emplacements/${id}/`).then(res => res.data);

export const fetchStocksEmplacement = (params?: { entrepot?: number; emplacement?: number }) =>
  api.get('stocks-emplacement/', { params }).then(res => res.data);
export const createStockEmplacement = (data: any) => api.post('stocks-emplacement/', data).then(res => res.data);
export const updateStockEmplacement = (id: number, data: any) => api.put(`stocks-emplacement/${id}/`, data).then(res => res.data);
export const deleteStockEmplacement = (id: number) => api.delete(`stocks-emplacement/${id}/`).then(res => res.data);

export const fetchEmployes = () => api.get('employes/').then(res => res.data);
export const createEmploye = (data: any) => api.post('employes/', data, { headers: { 'Content-Type': 'multipart/form-data' } }).then(res => res.data);
export const updateEmploye = (id: number, data: any) => api.patch(`employes/${id}/`, data, { headers: { 'Content-Type': 'multipart/form-data' } }).then(res => res.data);
export const deleteEmploye = (id: number) => api.delete(`employes/${id}/`).then(res => res.data);
export const fetchEmployePerformance = () => api.get('employes/performance/').then(res => res.data);

export const fetchCommandes = () => api.get('commandes/').then(res => res.data);
export const fetchCommandeDetail = (id: number) => api.get(`commandes/${id}/`).then(res => res.data);
export const createCommande = (data: any) => api.post('commandes/', data).then(res => res.data);
export const updateCommande = (id: number, data: any) => api.put(`commandes/${id}/`, data).then(res => res.data);
export const patchCommande = (id: number, data: any) => api.patch(`commandes/${id}/`, data).then(res => res.data);
export const deleteCommande = (id: number) => api.delete(`commandes/${id}/`).then(res => res.data);
export const downloadCommandePdf = (id: number) => api.get(`commandes/${id}/download_pdf/`, { responseType: 'blob' });

export const fetchTransferts = () => api.get('transferts/').then(res => res.data);
export const fetchTransfertDetail = (id: number) => api.get(`transferts/${id}/`).then(res => res.data);
export const createTransfert = (data: any) => api.post('transferts/', data).then(res => res.data);
export const updateTransfert = (id: number, data: any) => api.put(`transferts/${id}/`, data).then(res => res.data);
export const deleteTransfert = (id: number) => api.delete(`transferts/${id}/`).then(res => res.data);

export const fetchFactures = () => api.get('factures/').then(res => res.data);
export const fetchFactureDetail = (id: number) => api.get(`factures/${id}/`).then(res => res.data);
export const createFacture = (data: any) => api.post('factures/', data).then(res => res.data);
export const updateFacture = (id: number, data: any) => api.put(`factures/${id}/`, data).then(res => res.data);
export const patchFacture = (id: number, data: any) => api.patch(`factures/${id}/`, data).then(res => res.data);
export const deleteFacture = (id: number) => api.delete(`factures/${id}/`).then(res => res.data);
export const downloadFacturePdf = (id: number) => api.get(`factures/${id}/download_pdf/`, { responseType: 'blob' });

export const fetchAvailableResponsibles = () => api.get('available-responsibles/').then(res => res.data);

// Building (Bâtiment) Management API
export const fetchBatiments = () => api.get('batiments/').then(res => res.data);
export const createBatiment = (data: any) => api.post('batiments/', data).then(res => res.data);
export const updateBatiment = (id: number, data: any) => api.put(`batiments/${id}/`, data).then(res => res.data);
export const deleteBatiment = (id: number) => api.delete(`batiments/${id}/`).then(res => res.data);

export const fetchEtages = () => api.get('etages/').then(res => res.data);
export const createEtage = (data: any) => api.post('etages/', data).then(res => res.data);
export const deleteEtage = (id: number) => api.delete(`etages/${id}/`).then(res => res.data);

export const fetchLocaux = () => api.get('locaux/').then(res => res.data);
export const createLocal = (data: any) => api.post('locaux/', data).then(res => res.data);
export const updateLocal = (id: number, data: any) => api.put(`locaux/${id}/`, data).then(res => res.data);
export const deleteLocal = (id: number) => api.delete(`locaux/${id}/`).then(res => res.data);

// AI Assistant Functions
export const sendMessageToAi = (message: string, session_id?: number) => 
  api.post('ai/ask/', { message, session_id }).then(res => res.data);

export const fetchAiAnalytics = () => api.get('ai/api/analytics/').then(res => res.data);
export const fetchAiReorders = () => api.get('ai/api/reorders/').then(res => res.data);
export const fetchAiAlertRules = () => api.get('ai/api/alert-rules/').then(res => res.data);
export const updateAiAlertRules = (data: any) => api.post('ai/api/alert-rules/', data).then(res => res.data);

export const fetchAlertes = () => api.get('alertes/').then(res => res.data);
export const deleteAlerte = (id: number) => api.delete(`alertes/${id}/`).then(res => res.data);
export const fetchPostes = () => api.get('postes/').then(res => res.data);

export default api;
