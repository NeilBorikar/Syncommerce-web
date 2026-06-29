import axios from 'axios';
import { Customer, Employee, InventoryItem, SalesReport } from './types';

const API = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'https://syncommerce.onrender.com/api/v1',
});

API.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

export const api = {
  // Auth
  registerBusiness: async (data: any) => {
    const res = await API.post('/auth/business/register', data);
    return res.data;
  },
  loginBusiness: async (data: any) => {
    const res = await API.post('/auth/business/login', data);
    return res.data;
  },
  loginUser: async (data: any) => {
    const formData = new URLSearchParams();
    formData.append('email', data.email);
    formData.append('password', data.password);
    const res = await API.post(`/auth/user/login?email=${data.email}&password=${data.password}`);
    return res.data;
  },
  
  // Customers
  getCustomers: async (businessId: string) => {
    const res = await API.get(`/customers/${businessId}`);
    return res.data as Customer[];
  },
  exportCustomers: async (businessId: string) => {
    const res = await API.get(`/customers/export/${businessId}`, { responseType: 'blob' });
    return res.data;
  },
  
  // Employees
  getEmployees: async (businessId: string) => {
    const res = await API.get(`/employees/${businessId}`);
    return res.data as Employee[];
  },
  addEmployee: async (data: any) => {
    const res = await API.post('/employees/', data);
    return res.data;
  },
  deleteEmployee: async (id: string) => {
    const res = await API.delete(`/employees/${id}`);
    return res.data;
  },
  exportEmployees: async (businessId: string) => {
    const res = await API.get(`/employees/export/${businessId}`, { responseType: 'blob' });
    return res.data;
  },
  
  // Inventory
  getInventory: async (businessId: string) => {
    const res = await API.get(`/inventory/?business_id=${businessId}`);
    return res.data as InventoryItem[];
  },
  exportInventory: async (businessId: string) => {
    const res = await API.get(`/inventory/export/${businessId}`, { responseType: 'blob' });
    return res.data;
  },
  
  // Reports
  getSalesReport: async (businessId: string, from: string, to: string) => {
    const res = await API.get(`/reports/sales?business_id=${businessId}&from_date=${from}&to_date=${to}`);
    return res.data;
  },
};
