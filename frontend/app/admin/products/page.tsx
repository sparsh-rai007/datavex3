'use client';

import { useEffect, useState } from 'react';
import { 
  Search, 
  Loader2, 
  Package, 
  Eye,
  EyeOff,
  AlertTriangle,
  CheckCircle2,
  Plus,
  Edit2,
  Trash2,
  X,
  PlusCircle,
  TrendingUp,
  HelpCircle
} from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { apiClient } from '@/lib/api';

const COLOR_PRESETS = [
  {
    name: 'Blue/Indigo',
    color: 'from-blue-500 via-blue-600 to-indigo-700',
    iconColor: 'text-blue-600',
    iconBg: 'bg-blue-50 border-blue-100',
    glow: 'shadow-blue-500/10 hover:shadow-blue-500/20 border-blue-100'
  },
  {
    name: 'Cyan/Blue',
    color: 'from-cyan-500 via-cyan-600 to-blue-700',
    iconColor: 'text-cyan-600',
    iconBg: 'bg-cyan-50 border-cyan-100',
    glow: 'shadow-cyan-500/10 hover:shadow-cyan-500/20 border-cyan-100'
  },
  {
    name: 'Emerald/Teal',
    color: 'from-emerald-500 via-teal-600 to-emerald-700',
    iconColor: 'text-emerald-600',
    iconBg: 'bg-emerald-50 border-emerald-100',
    glow: 'shadow-emerald-500/10 hover:shadow-emerald-500/20 border-emerald-100'
  },
  {
    name: 'Amber/Orange',
    color: 'from-amber-500 via-amber-600 to-orange-700',
    iconColor: 'text-amber-600',
    iconBg: 'bg-amber-50 border-amber-100',
    glow: 'shadow-amber-500/10 hover:shadow-amber-500/20 border-amber-100'
  },
  {
    name: 'Slate/Zinc',
    color: 'from-slate-700 via-slate-800 to-zinc-900',
    iconColor: 'text-slate-700',
    iconBg: 'bg-slate-50 border-slate-200',
    glow: 'shadow-slate-500/10 hover:shadow-slate-500/20 border-slate-200'
  },
  {
    name: 'Violet/Purple',
    color: 'from-violet-500 via-violet-600 to-purple-800',
    iconColor: 'text-violet-600',
    iconBg: 'bg-violet-50 border-violet-100',
    glow: 'shadow-violet-500/10 hover:shadow-violet-500/20 border-violet-100'
  },
  {
    name: 'Purple/Pink',
    color: 'from-purple-500 via-purple-600 to-pink-700',
    iconColor: 'text-purple-600',
    iconBg: 'bg-purple-50 border-purple-100',
    glow: 'shadow-purple-500/10 hover:shadow-purple-500/20 border-purple-100'
  },
  {
    name: 'Indigo/Blue',
    color: 'from-indigo-600 via-indigo-700 to-blue-800',
    iconColor: 'text-indigo-600',
    iconBg: 'bg-indigo-50 border-indigo-100',
    glow: 'shadow-indigo-500/10 hover:shadow-indigo-500/20 border-indigo-100'
  },
  {
    name: 'Rose/Pink',
    color: 'from-rose-500 via-rose-600 to-pink-700',
    iconColor: 'text-rose-600',
    iconBg: 'bg-rose-50 border-rose-100',
    glow: 'shadow-rose-500/10 hover:shadow-rose-500/20 border-rose-100'
  },
  {
    name: 'Teal/Emerald',
    color: 'from-teal-500 via-teal-600 to-emerald-700',
    iconColor: 'text-teal-600',
    iconBg: 'bg-teal-50 border-teal-100',
    glow: 'shadow-teal-500/10 hover:shadow-teal-500/20 border-teal-100'
  }
];

const ICON_OPTIONS = [
  'Layers',
  'CreditCard',
  'HeartPulse',
  'Compass',
  'Scale',
  'CheckSquare',
  'Mic',
  'Users',
  'Calculator',
  'Anchor',
  'Activity',
  'Briefcase',
  'Cpu',
  'Database',
  'Globe',
  'Shield',
  'Terminal'
];

interface Product {
  id: string;
  name: string;
  category: string;
  tagline: string;
  description: string;
  detailed_description: string;
  metric: string;
  metric_label: string;
  icon: string;
  logo_url?: string;
  color: string;
  icon_color: string;
  icon_bg: string;
  glow: string;
  features: string[];
  tech_stack: string[];
}

const getLogoUrl = (url?: string) => {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:')) {
    return url;
  }
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || '';
  return `${baseUrl.replace(/\/$/, '')}/${url.replace(/^\//, '')}`;
};

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [delistedIds, setDelistedIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [togglingGlobal, setTogglingGlobal] = useState(false);
  const [togglingProduct, setTogglingProduct] = useState<string | null>(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form Fields State
  const [formData, setFormData] = useState({
    id: '',
    name: '',
    category: '',
    tagline: '',
    description: '',
    detailed_description: '',
    metric: '',
    metric_label: '',
    icon: 'Layers',
    logo_url: '',
    visualType: 'icon' as 'icon' | 'logo',
    colorPresetIndex: 0,
    features: [] as string[],
    tech_stack: [] as string[]
  });

  const [featureInput, setFeatureInput] = useState('');
  const [techInput, setTechInput] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [saving, setSaving] = useState(false);
  const [savingLogo, setSavingLogo] = useState(false);

  useEffect(() => {
    loadProductsData();
  }, []);

  const loadProductsData = async () => {
    setLoading(true);
    try {
      const [delistedRes, productsRes] = await Promise.all([
        apiClient.getDelistedProducts(),
        apiClient.getProducts()
      ]);

      if (delistedRes?.success) {
        setDelistedIds(delistedRes.delisted || []);
      }
      if (productsRes?.success) {
        // Parse features and tech_stack if they are strings
        const items = (productsRes.products || []).map((p: any) => ({
          ...p,
          features: Array.isArray(p.features) ? p.features : JSON.parse(p.features || '[]'),
          tech_stack: Array.isArray(p.tech_stack) ? p.tech_stack : JSON.parse(p.tech_stack || '[]')
        }));
        setProducts(items);
      }
    } catch (error) {
      console.error('Failed to load products page data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleGlobal = async () => {
    setTogglingGlobal(true);
    const isGlobalDelisted = delistedIds.includes('global_products_page');
    try {
      if (isGlobalDelisted) {
        const response = await apiClient.enlistProduct('global_products_page');
        if (response?.success) {
          setDelistedIds(prev => prev.filter(id => id !== 'global_products_page'));
        }
      } else {
        const response = await apiClient.delistProduct('global_products_page');
        if (response?.success) {
          setDelistedIds(prev => [...prev, 'global_products_page']);
        }
      }
    } catch (error) {
      console.error('Failed to toggle global products page status:', error);
    } finally {
      setTogglingGlobal(false);
    }
  };

  const handleToggleProductStatus = async (productId: string) => {
    setTogglingProduct(productId);
    const isProductDelisted = delistedIds.includes(productId);
    try {
      if (isProductDelisted) {
        const response = await apiClient.enlistProduct(productId);
        if (response?.success) {
          setDelistedIds(prev => prev.filter(id => id !== productId));
        }
      } else {
        const response = await apiClient.delistProduct(productId);
        if (response?.success) {
          setDelistedIds(prev => [...prev, productId]);
        }
      }
    } catch (error) {
      console.error(`Failed to toggle visibility for product ${productId}:`, error);
    } finally {
      setTogglingProduct(null);
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    if (!window.confirm('Are you sure you want to delete this product? This action is permanent.')) {
      return;
    }
    try {
      const response = await apiClient.deleteProduct(productId);
      if (response?.success) {
        setProducts(prev => prev.filter(p => p.id !== productId));
        setDelistedIds(prev => prev.filter(id => id !== productId));
      }
    } catch (error) {
      console.error(`Failed to delete product ${productId}:`, error);
      alert('Delete failed. Please try again.');
    }
  };

  const openCreateModal = () => {
    setModalMode('create');
    setEditingId(null);
    setErrorMsg('');
    setFormData({
      id: '',
      name: '',
      category: '',
      tagline: '',
      description: '',
      detailed_description: '',
      metric: '',
      metric_label: '',
      icon: 'Layers',
      logo_url: '',
      visualType: 'icon',
      colorPresetIndex: 0,
      features: [],
      tech_stack: []
    });
    setFeatureInput('');
    setTechInput('');
    setIsModalOpen(true);
  };

  const openEditModal = (product: Product) => {
    setModalMode('edit');
    setEditingId(product.id);
    setErrorMsg('');

    // Find if the product's colors match one of the presets
    let presetIdx = COLOR_PRESETS.findIndex(preset => preset.color === product.color);
    if (presetIdx === -1) presetIdx = 0;

    setFormData({
      id: product.id,
      name: product.name,
      category: product.category,
      tagline: product.tagline,
      description: product.description,
      detailed_description: product.detailed_description,
      metric: product.metric,
      metric_label: product.metric_label,
      icon: product.icon || 'Layers',
      logo_url: product.logo_url || '',
      visualType: product.logo_url ? 'logo' : 'icon',
      colorPresetIndex: presetIdx,
      features: [...(product.features || [])],
      tech_stack: [...(product.tech_stack || [])]
    });
    setFeatureInput('');
    setTechInput('');
    setIsModalOpen(true);
  };

  const addFeature = () => {
    if (featureInput.trim()) {
      setFormData(prev => ({
        ...prev,
        features: [...prev.features, featureInput.trim()]
      }));
      setFeatureInput('');
    }
  };

  const removeFeature = (idx: number) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== idx)
    }));
  };

  const addTech = () => {
    if (techInput.trim()) {
      setFormData(prev => ({
        ...prev,
        tech_stack: [...prev.tech_stack, techInput.trim()]
      }));
      setTechInput('');
    }
  };

  const removeTech = (idx: number) => {
    setFormData(prev => ({
      ...prev,
      tech_stack: prev.tech_stack.filter((_, i) => i !== idx)
    }));
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    // Simple validations
    if (modalMode === 'create' && !formData.id.trim()) {
      setErrorMsg('Product ID (slug) is required.');
      return;
    }
    if (!formData.name.trim()) {
      setErrorMsg('Product Name is required.');
      return;
    }
    if (!formData.category.trim()) {
      setErrorMsg('Category is required.');
      return;
    }
    if (!formData.tagline.trim()) {
      setErrorMsg('Tagline description is required.');
      return;
    }
    if (formData.visualType === 'logo' && !formData.logo_url.trim()) {
      setErrorMsg('Product Logo image or URL is required.');
      return;
    }
    if (formData.visualType === 'icon' && !formData.icon) {
      setErrorMsg('Product Icon is required.');
      return;
    }

    setSaving(true);
    const selectedColorPreset = COLOR_PRESETS[formData.colorPresetIndex];
    const payload = {
      id: formData.id.trim().toLowerCase(),
      name: formData.name.trim(),
      category: formData.category.trim(),
      tagline: formData.tagline.trim(),
      description: formData.description.trim(),
      detailed_description: formData.detailed_description.trim(),
      metric: formData.metric.trim(),
      metric_label: formData.metric_label.trim(),
      icon: formData.visualType === 'icon' ? formData.icon : null,
      logo_url: formData.visualType === 'logo' ? formData.logo_url.trim() : null,
      color: selectedColorPreset.color,
      icon_color: selectedColorPreset.iconColor,
      icon_bg: selectedColorPreset.iconBg,
      glow: selectedColorPreset.glow,
      features: formData.features,
      tech_stack: formData.tech_stack
    };

    try {
      if (modalMode === 'create') {
        const res = await apiClient.createProduct(payload);
        if (res?.success) {
          const newProd = {
            ...res.product,
            features: Array.isArray(res.product.features) ? res.product.features : JSON.parse(res.product.features || '[]'),
            tech_stack: Array.isArray(res.product.tech_stack) ? res.product.tech_stack : JSON.parse(res.product.tech_stack || '[]')
          };
          setProducts(prev => [...prev, newProd]);
          setIsModalOpen(false);
        } else {
          setErrorMsg(res?.error || 'Failed to create product.');
        }
      } else {
        const res = await apiClient.updateProduct(editingId!, payload);
        if (res?.success) {
          const updatedProd = {
            ...res.product,
            features: Array.isArray(res.product.features) ? res.product.features : JSON.parse(res.product.features || '[]'),
            tech_stack: Array.isArray(res.product.tech_stack) ? res.product.tech_stack : JSON.parse(res.product.tech_stack || '[]')
          };
          setProducts(prev => prev.map(p => p.id === editingId ? updatedProd : p));
          setIsModalOpen(false);
        } else {
          setErrorMsg(res?.error || 'Failed to update product.');
        }
      }
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.response?.data?.error || 'An error occurred while saving.');
    } finally {
      setSaving(false);
    }
  };

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.tagline.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const isGlobalDelisted = delistedIds.includes('global_products_page');

  return (
    <div className="min-h-screen bg-[#F8F9FA] font-sans">
      <main className="max-w-7xl mx-auto px-6 py-12">
        
        {/* Header Block */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 text-left">
          <div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">Products Visibility Engine</h2>
            <p className="text-sm text-slate-500 mt-1">Control which SaaS platforms are active, add new platforms, or delist the entire landing page globally.</p>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <div className="relative group min-w-[240px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-slate-900 transition-colors" size={14} />
              <input
                type="text"
                placeholder="Search products..."
                className="h-10 pl-9 pr-4 bg-white border border-slate-200 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900 transition-all w-full"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <button
              onClick={openCreateModal}
              className="h-10 px-4 bg-primary-600 hover:bg-primary-700 text-white rounded-md text-sm font-bold flex items-center gap-2 shadow-sm transition-colors cursor-pointer shrink-0"
            >
              <Plus size={16} /> Add Product
            </button>
          </div>
        </div>

        {/* Global Page Visibility Toggle */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-[0_1px_3px_rgba(0,0,0,0.02)] mb-8 flex flex-col md:flex-row md:items-center justify-between gap-6 text-left">
          <div className="flex items-start gap-4">
            <div className={`p-3 rounded-2xl border flex items-center justify-center shrink-0 ${
              !isGlobalDelisted 
                ? 'bg-emerald-50 text-emerald-600 border-emerald-100/50' 
                : 'bg-amber-50 text-amber-600 border-amber-100/50'
            }`}>
              {!isGlobalDelisted ? <Eye className="w-6 h-6" /> : <EyeOff className="w-6 h-6" />}
            </div>
            <div>
              <h3 className="text-lg font-extrabold text-slate-900">Global Products Page Status</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-xl">
                When deactivated, the Products page link is hidden from the header/navigation, and direct visits to `/products` show a technical offline notice.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 shrink-0">
            <span className={`text-xs font-extrabold uppercase tracking-wider transition-colors duration-200 ${
              !isGlobalDelisted ? 'text-emerald-600' : 'text-slate-400'
            }`}>
              {!isGlobalDelisted ? 'Online' : 'Offline'}
            </span>
            <button
              role="switch"
              aria-checked={!isGlobalDelisted}
              disabled={togglingGlobal || loading}
              onClick={handleToggleGlobal}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-slate-900 focus:ring-offset-2 ${
                togglingGlobal || loading
                  ? 'bg-slate-200 cursor-not-allowed'
                  : !isGlobalDelisted
                    ? 'bg-emerald-500 hover:bg-emerald-600'
                    : 'bg-slate-300 hover:bg-slate-400'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out flex items-center justify-center ${
                  !isGlobalDelisted ? 'translate-x-5' : 'translate-x-0'
                }`}
              >
                {togglingGlobal && (
                  <Loader2 className="animate-spin w-2.5 h-2.5 text-slate-400" />
                )}
              </span>
            </button>
          </div>
        </div>

        {/* Dynamic Status Counter Panel */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 text-left">
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-[0_1px_3px_rgba(0,0,0,0.02)] flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Total Products</span>
              <span className="text-2xl font-black text-slate-900 mt-1 block">{products.length}</span>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <Package className="w-5 h-5 text-slate-500" />
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-[0_1px_3px_rgba(0,0,0,0.02)] flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Global Landing Page</span>
              <span className={`text-2xl font-black mt-1 block ${!isGlobalDelisted ? 'text-emerald-600' : 'text-amber-600'}`}>
                {!isGlobalDelisted ? 'ONLINE' : 'OFFLINE'}
              </span>
            </div>
            <div className={`p-3 rounded-xl border ${!isGlobalDelisted ? 'bg-emerald-50 border-emerald-100/50 text-emerald-500' : 'bg-amber-50 border-amber-100/50 text-amber-500'}`}>
              {!isGlobalDelisted ? <CheckCircle2 className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
            </div>
          </div>
        </div>

        {/* Database Table view */}
        <div className="bg-white border border-slate-200 rounded-xl shadow-[0_1px_3px_rgba(0,0,0,0.02)] overflow-hidden">
          {loading ? (
            <div className="py-24 flex flex-col items-center justify-center">
              <Loader2 className="animate-spin text-slate-400 mb-4" size={24} />
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-widest">Loading Products Catalog...</span>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/50 border-b border-slate-200">
                    <th className="px-6 py-4 text-[11px] font-extrabold uppercase tracking-wider text-slate-500">Product & Sector</th>
                    <th className="px-6 py-4 text-[11px] font-extrabold uppercase tracking-wider text-slate-500">Tagline Description</th>
                    <th className="px-6 py-4 text-[11px] font-extrabold uppercase tracking-wider text-slate-500 text-center">Status</th>
                    <th className="px-6 py-4 text-[11px] font-extrabold uppercase tracking-wider text-slate-500 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  <AnimatePresence mode="popLayout">
                    {filteredProducts.map((product) => {
                      const IconComp = (LucideIcons as any)[product.icon] || LucideIcons.Package;
                      const isProductDelisted = delistedIds.includes(product.id);

                      return (
                        <motion.tr
                          key={product.id}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="hover:bg-slate-50/30 transition-colors group"
                        >
                          {/* Product Details */}
                          <td className="px-6 py-5">
                            <div className="flex items-center gap-3">
                              {product.logo_url ? (
                                <div className="w-10 h-10 rounded-xl border border-slate-200 bg-white flex items-center justify-center p-1.5 shrink-0 overflow-hidden shadow-sm">
                                  <img src={getLogoUrl(product.logo_url)} alt={product.name} className="w-full h-full object-contain" />
                                </div>
                              ) : (
                                <div className={`w-10 h-10 rounded-xl border bg-gradient-to-br ${product.color} text-white flex items-center justify-center shrink-0`}>
                                  <IconComp className="w-5 h-5" />
                                </div>
                              )}
                              <div className="flex flex-col text-left">
                                <div className="flex items-center gap-1.5">
                                  <span className="text-sm font-extrabold text-slate-900 group-hover:text-black transition-colors">
                                    {product.name}
                                  </span>
                                  <span className="text-[10px] text-slate-400 font-mono">({product.id})</span>
                                </div>
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                  {product.category}
                                </span>
                              </div>
                            </div>
                          </td>

                          {/* Tagline */}
                          <td className="px-6 py-5 text-left">
                            <span className="text-xs text-slate-600 font-medium">
                              {product.tagline}
                            </span>
                          </td>

                          {/* Status Toggle */}
                          <td className="px-6 py-5 text-center">
                            <div className="flex items-center gap-2 justify-center">
                              <button
                                disabled={togglingProduct === product.id}
                                onClick={() => handleToggleProductStatus(product.id)}
                                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[10px] font-extrabold uppercase tracking-wide cursor-pointer transition-all ${
                                  !isProductDelisted
                                    ? 'bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100'
                                    : 'bg-amber-50 border-amber-200 text-amber-700 hover:bg-amber-100'
                                }`}
                              >
                                <span className={`w-1.5 h-1.5 rounded-full ${!isProductDelisted ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                                {togglingProduct === product.id ? 'Saving...' : !isProductDelisted ? 'Active' : 'Offline'}
                              </button>
                            </div>
                          </td>

                          {/* Action Buttons */}
                          <td className="px-6 py-5 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => openEditModal(product)}
                                className="p-1.5 hover:bg-slate-100 text-slate-500 hover:text-slate-900 rounded-md transition-colors cursor-pointer"
                                title="Edit Product"
                              >
                                <Edit2 size={14} />
                              </button>
                              <button
                                onClick={() => handleDeleteProduct(product.id)}
                                className="p-1.5 hover:bg-rose-50 text-slate-500 hover:text-rose-600 rounded-md transition-colors cursor-pointer"
                                title="Delete Product"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </td>
                        </motion.tr>
                      );
                    })}
                  </AnimatePresence>
                </tbody>
              </table>

              {!loading && filteredProducts.length === 0 && (
                <div className="py-20 text-center">
                  <p className="text-sm text-slate-400 font-medium italic">No products found matching your search.</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer info panel */}
        <div className="mt-6 flex items-center justify-between text-[11px] text-slate-400 font-medium uppercase tracking-wider">
          <span>Displaying {filteredProducts.length} of {products.length} Platforms</span>
          <span>Last Refreshed: {new Date().toLocaleTimeString()}</span>
        </div>
      </main>

      {/* Add / Edit Product Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm"
            />

            {/* Modal Dialog */}
            <motion.div
              initial={{ scale: 0.95, y: 10, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.95, y: 10, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="bg-white border border-slate-200 rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl z-10 text-left overflow-hidden"
            >
              {/* Modal Header */}
              <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-black text-slate-900 tracking-tight">
                    {modalMode === 'create' ? 'Add New Product Platform' : 'Edit Product Specifications'}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">Configure capabilities, tech stack, and visual style.</p>
                </div>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-1.5 hover:bg-slate-100 text-slate-400 hover:text-slate-600 rounded-md transition-colors cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Modal Body (Scrollable) */}
              <form onSubmit={handleSaveProduct} className="flex-1 overflow-y-auto p-6 space-y-6">
                
                {errorMsg && (
                  <div className="p-3 bg-rose-50 border border-rose-100 rounded-lg text-rose-700 text-xs font-semibold flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    <span>{errorMsg}</span>
                  </div>
                )}

                {/* ID & Name Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      Product ID (Slug) *
                    </label>
                    <input
                      type="text"
                      disabled={modalMode === 'edit'}
                      placeholder="e.g. cloudcompute"
                      value={formData.id}
                      onChange={(e) => setFormData({ ...formData, id: e.target.value })}
                      className="h-10 px-3 bg-white border border-slate-200 rounded-md text-sm w-full focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900 disabled:bg-slate-50 disabled:text-slate-400 disabled:cursor-not-allowed"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      Product Name *
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. CloudCompute"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="h-10 px-3 bg-white border border-slate-200 rounded-md text-sm w-full focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900"
                    />
                  </div>
                </div>

                {/* Category & Tagline */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      Category *
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Cloud & Operations"
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="h-10 px-3 bg-white border border-slate-200 rounded-md text-sm w-full focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      Tagline *
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Multi-cloud deployment sync orchestrator"
                      value={formData.tagline}
                      onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                      className="h-10 px-3 bg-white border border-slate-200 rounded-md text-sm w-full focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900"
                    />
                  </div>
                </div>

                {/* Descriptions */}
                <div className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      Short Description *
                    </label>
                    <textarea
                      placeholder="Brief product abstract displayed in the card grid."
                      rows={2}
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="p-3 bg-white border border-slate-200 rounded-md text-sm w-full focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900 resize-y"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      Detailed Specifications Description
                    </label>
                    <textarea
                      placeholder="Deep technical overview displayed inside the details specification modal."
                      rows={4}
                      value={formData.detailed_description}
                      onChange={(e) => setFormData({ ...formData, detailed_description: e.target.value })}
                      className="p-3 bg-white border border-slate-200 rounded-md text-sm w-full focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900 resize-y"
                    />
                  </div>
                </div>

                {/* Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      Success Metric (Value)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 99.9% or 10x or 45k"
                      value={formData.metric}
                      onChange={(e) => setFormData({ ...formData, metric: e.target.value })}
                      className="h-10 px-3 bg-white border border-slate-200 rounded-md text-sm w-full focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      Metric Label Description
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Server Uptime SLA, Increase in Compilation Speed"
                      value={formData.metric_label}
                      onChange={(e) => setFormData({ ...formData, metric_label: e.target.value })}
                      className="h-10 px-3 bg-white border border-slate-200 rounded-md text-sm w-full focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900"
                    />
                  </div>
                </div>

                {/* Color Preset Palette */}
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Visual Accent Color & Glow Presets
                  </label>
                  <p className="text-[10px] text-slate-500">Pick a color scheme to automatically style cards, headers, and drop shadows.</p>
                  <div className="flex flex-wrap gap-2 pt-1">
                    {COLOR_PRESETS.map((preset, idx) => (
                      <button
                        key={preset.name}
                        type="button"
                        onClick={() => setFormData({ ...formData, colorPresetIndex: idx })}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border flex items-center gap-1.5 cursor-pointer ${
                          formData.colorPresetIndex === idx
                            ? 'bg-slate-900 text-white border-slate-900 shadow-sm scale-105'
                            : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50 hover:border-slate-300'
                        }`}
                      >
                        <span className={`inline-block w-2.5 h-2.5 rounded-full bg-gradient-to-br ${preset.color}`} />
                        {preset.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Representation Type Toggle */}
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Product Visual Option *
                  </label>
                  <div className="flex items-center gap-2 bg-slate-50 p-1 rounded-lg border border-slate-200 w-fit">
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, visualType: 'icon' })}
                      className={`px-4 py-2 rounded-md text-xs font-extrabold uppercase tracking-wide transition-all cursor-pointer ${
                        formData.visualType === 'icon'
                          ? 'bg-white text-slate-950 shadow-sm border border-slate-200/50'
                          : 'text-slate-500 hover:text-slate-950'
                      }`}
                    >
                      Lucide Icon
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, visualType: 'logo' })}
                      className={`px-4 py-2 rounded-md text-xs font-extrabold uppercase tracking-wide transition-all cursor-pointer ${
                        formData.visualType === 'logo'
                          ? 'bg-white text-slate-950 shadow-sm border border-slate-200/50'
                          : 'text-slate-500 hover:text-slate-950'
                      }`}
                    >
                      Image Logo
                    </button>
                  </div>
                </div>

                {formData.visualType === 'icon' ? (
                  <div className="space-y-4">
                    {/* Icon Selection grid */}
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                        Select Icon
                      </label>
                      <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 pt-1">
                        {ICON_OPTIONS.map((iconName) => {
                          const IconComp = (LucideIcons as any)[iconName] || LucideIcons.HelpCircle;
                          return (
                            <button
                              key={iconName}
                              type="button"
                              onClick={() => setFormData({ ...formData, icon: iconName })}
                              className={`p-2.5 rounded-xl border flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${
                                formData.icon === iconName
                                  ? 'bg-primary-50 border-primary-500 text-primary-600 ring-2 ring-primary-500/10'
                                  : 'bg-white border-slate-100 text-slate-500 hover:bg-slate-50 hover:text-slate-800'
                              }`}
                            >
                              <IconComp className="w-5 h-5 shrink-0" />
                              <span className="text-[8px] font-bold tracking-tight text-ellipsis overflow-hidden w-full text-center">
                                {iconName}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4 p-5 rounded-2xl bg-slate-50 border border-slate-200">
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      Product Logo Details
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {/* Logo Upload Box */}
                      <div className="md:col-span-2 space-y-4">
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-500 uppercase block">
                            Upload Logo Image
                          </label>
                          <div className="flex items-center gap-3">
                            <input
                              type="file"
                              accept="image/*"
                              id="logo-file-input"
                              className="hidden"
                              onChange={async (e) => {
                                const file = e.target.files?.[0];
                                if (!file) return;
                                setSavingLogo(true);
                                try {
                                  const res = await apiClient.uploadProductLogo(file);
                                  if (res?.success && res.logoUrl) {
                                    setFormData(prev => ({ ...prev, logo_url: res.logoUrl }));
                                  } else {
                                    alert(res?.error || 'Failed to upload logo.');
                                  }
                                } catch (err) {
                                  console.error(err);
                                  alert('Error uploading file. Please try again.');
                                } finally {
                                  setSavingLogo(false);
                                }
                              }}
                            />
                            <label
                              htmlFor="logo-file-input"
                              className="px-4 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-extrabold rounded-lg text-xs flex items-center gap-2 cursor-pointer shadow-sm transition-all"
                            >
                              {savingLogo ? (
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              ) : (
                                <PlusCircle className="w-3.5 h-3.5" />
                              )}
                              {savingLogo ? 'Uploading...' : 'Choose File'}
                            </label>
                            <span className="text-[10px] text-slate-400">
                              PNG, JPG, SVG or WEBP (Max 2MB)
                            </span>
                          </div>
                        </div>

                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-500 uppercase block">
                            OR Paste Logo URL
                          </label>
                          <input
                            type="text"
                            placeholder="https://example.com/logo.png"
                            value={formData.logo_url}
                            onChange={(e) => setFormData({ ...formData, logo_url: e.target.value })}
                            className="h-10 px-3 bg-white border border-slate-200 rounded-md text-sm w-full focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900"
                          />
                        </div>
                      </div>

                      {/* Logo Preview Card */}
                      <div className="flex flex-col items-center justify-center p-4 bg-white border border-slate-200 rounded-xl">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                          Preview
                        </span>
                        <div className="w-20 h-20 rounded-2xl border border-slate-100 bg-white flex items-center justify-center p-2.5 overflow-hidden shadow-sm">
                          {formData.logo_url ? (
                            <img
                              src={getLogoUrl(formData.logo_url)}
                              alt="Logo Preview"
                              className="w-full h-full object-contain animate-fadeIn"
                            />
                          ) : (
                            <HelpCircle className="w-8 h-8 text-slate-300" />
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Core Capabilities (Features) */}
                <div className="space-y-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      Core Capabilities & Features
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Add a core feature capability..."
                        value={featureInput}
                        onChange={(e) => setFeatureInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            addFeature();
                          }
                        }}
                        className="h-10 px-3 bg-white border border-slate-200 rounded-md text-sm flex-1 focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900"
                      />
                      <button
                        type="button"
                        onClick={addFeature}
                        className="h-10 px-4 bg-slate-900 hover:bg-slate-850 text-white rounded-md text-sm font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <PlusCircle size={16} /> Add
                      </button>
                    </div>
                  </div>

                  {formData.features.length > 0 ? (
                    <div className="space-y-2 max-h-[160px] overflow-y-auto p-1 bg-slate-50/50 rounded-lg border border-slate-150">
                      {formData.features.map((feature, idx) => (
                        <div key={idx} className="flex items-center justify-between gap-3 bg-white p-2 rounded-md border border-slate-200 text-xs">
                          <span className="text-slate-700 font-medium text-left">{feature}</span>
                          <button
                            type="button"
                            onClick={() => removeFeature(idx)}
                            className="text-slate-400 hover:text-rose-600 transition-colors p-1"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-[11px] text-slate-400 italic">No features added yet. Add at least 3 features for cards to look rich.</p>
                  )}
                </div>

                {/* Technology Stack */}
                <div className="space-y-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      Technology Stack
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Add technology tag (e.g. React, PyTorch, C++)"
                        value={techInput}
                        onChange={(e) => setTechInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            addTech();
                          }
                        }}
                        className="h-10 px-3 bg-white border border-slate-200 rounded-md text-sm flex-1 focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900"
                      />
                      <button
                        type="button"
                        onClick={addTech}
                        className="h-10 px-4 bg-slate-900 hover:bg-slate-850 text-white rounded-md text-sm font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <PlusCircle size={16} /> Add
                      </button>
                    </div>
                  </div>

                  {formData.tech_stack.length > 0 ? (
                    <div className="flex flex-wrap gap-1.5 p-2 bg-slate-50/50 rounded-lg border border-slate-150">
                      {formData.tech_stack.map((tech, idx) => (
                        <span
                          key={idx}
                          className="inline-flex items-center gap-1 px-2 py-1 bg-white border border-slate-200 rounded-md text-xs font-bold text-slate-650"
                        >
                          {tech}
                          <button
                            type="button"
                            onClick={() => removeTech(idx)}
                            className="text-slate-400 hover:text-rose-600 transition-colors"
                          >
                            <X size={10} />
                          </button>
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-[11px] text-slate-400 italic">No tech stack items specified yet.</p>
                  )}
                </div>

                {/* Submit Actions */}
                <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 text-sm text-slate-600 hover:text-slate-900 font-bold rounded-md hover:bg-slate-50 transition-all cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-5 py-2.5 bg-primary-650 hover:bg-primary-750 text-black font-bold rounded-md text-sm flex items-center gap-2 shadow-md transition-colors cursor-pointer"
                  >
                    {saving && <Loader2 className="animate-spin w-4 h-4" />}
                    {modalMode === 'create' ? 'Create Product' : 'Save Specifications'}
                  </button>
                </div>

              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
