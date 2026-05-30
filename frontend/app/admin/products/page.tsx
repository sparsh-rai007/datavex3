'use client';

import { useEffect, useState } from 'react';
import { 
  Search, 
  Loader2, 
  Package, 
  Layers, 
  CreditCard, 
  HeartPulse, 
  Compass, 
  Scale, 
  CheckSquare, 
  Mic, 
  Users, 
  Calculator, 
  Anchor,
  Eye,
  EyeOff,
  AlertTriangle,
  CheckCircle2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { apiClient } from '@/lib/api';

const staticProducts = [
  { id: 'vexcad', name: 'VexCAD', category: 'Engineering & Design', tagline: '2D to 3D CAD draft conversion engine', icon: Layers, color: 'text-blue-600 bg-blue-50 border-blue-100' },
  { id: 'credivex', name: 'CrediVex', category: 'FinTech & Security', tagline: 'Credit Card Information System', icon: CreditCard, color: 'text-cyan-600 bg-cyan-50 border-cyan-100' },
  { id: 'cureconnect', name: 'CureConnect', category: 'Healthcare & Logistics', tagline: 'Medical Tourism Platform', icon: HeartPulse, color: 'text-emerald-600 bg-emerald-50 border-emerald-100' },
  { id: 'mysticroutes', name: 'MysticRoutes', category: 'Tourism & Travel', tagline: 'Spiritual & Sacred Tourism Platform', icon: Compass, color: 'text-amber-600 bg-amber-50 border-amber-100' },
  { id: 'lexos', name: 'LexOS', category: 'Enterprise & Compliance', tagline: 'Legal OS for Organisations', icon: Scale, color: 'text-slate-700 bg-slate-50 border-slate-200' },
  { id: 'taskvera', name: 'TaskVera', category: 'Productivity & SaaS', tagline: 'Project Management Core', icon: CheckSquare, color: 'text-violet-600 bg-violet-50 border-violet-100' },
  { id: 'meetingmind', name: 'MeetingMind', category: 'AI & Collaboration', tagline: 'AI Speech To Text Scribe', icon: Mic, color: 'text-purple-600 bg-purple-50 border-purple-100' },
  { id: 'vexhr', name: 'VexHR', category: 'Enterprise & HRMS', tagline: 'Human Resource Management System', icon: Users, color: 'text-indigo-600 bg-indigo-50 border-indigo-100' },
  { id: 'kaasvex', name: 'KaasVex', category: 'FinTech & Finance', tagline: 'Billing & Invoicing Software', icon: Calculator, color: 'text-rose-600 bg-rose-50 border-rose-100' },
  { id: 'hullsync', name: 'HullSync', category: 'Industrial & Maritime', tagline: 'Ship Building Platform', icon: Anchor, color: 'text-teal-600 bg-teal-50 border-teal-100' }
];

export default function AdminProductsPage() {
  const [delistedIds, setDelistedIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [togglingGlobal, setTogglingGlobal] = useState(false);

  useEffect(() => {
    loadProductStatus();
  }, []);

  const loadProductStatus = async () => {
    setLoading(true);
    try {
      const data = await apiClient.getDelistedProducts();
      if (data?.success) {
        setDelistedIds(data.delisted || []);
      }
    } catch (error) {
      console.error('Failed to load products visibility status:', error);
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

  const filteredProducts = staticProducts.filter(p =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.tagline.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const isGlobalDelisted = delistedIds.includes('global_products_page');

  return (
    <div className="min-h-screen bg-[#F8F9FA] font-sans">
      <main className="max-w-7xl mx-auto px-6 py-12">
        
        {/* Header Block */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
          <div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">Products Visibility Engine</h2>
            <p className="text-sm text-slate-500 mt-1">Control which SaaS platforms are active, or delist the entire products landing page globally.</p>
          </div>

          <div className="relative group min-w-[260px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-slate-900 transition-colors" size={14} />
            <input
              type="text"
              placeholder="Search products..."
              className="h-10 pl-9 pr-4 bg-white border border-slate-200 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900 transition-all w-full"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-[0_1px_3px_rgba(0,0,0,0.02)] flex items-center justify-between text-left">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Total Products</span>
              <span className="text-2xl font-black text-slate-900 mt-1 block">{staticProducts.length}</span>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <Package className="w-5 h-5 text-slate-500" />
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-[0_1px_3px_rgba(0,0,0,0.02)] flex items-center justify-between text-left">
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
                    <th className="px-6 py-4 text-[11px] font-extrabold uppercase tracking-wider text-slate-500 text-right">Public Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  <AnimatePresence mode="popLayout">
                    {filteredProducts.map((product) => {
                      const IconComp = product.icon;

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
                              <div className={`w-10 h-10 rounded-xl border flex items-center justify-center shrink-0 ${product.color}`}>
                                <IconComp className="w-5 h-5" />
                              </div>
                              <div className="flex flex-col text-left">
                                <span className="text-sm font-extrabold text-slate-900 group-hover:text-black transition-colors">
                                  {product.name}
                                </span>
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

                          {/* Status Badge */}
                          <td className="px-6 py-5 text-right">
                            <div className="flex items-center gap-2 justify-end">
                              <div className={`w-1.5 h-1.5 rounded-full ${!isGlobalDelisted ? 'bg-emerald-500' : 'bg-amber-400'}`} />
                              <span className={`text-[10px] font-extrabold uppercase tracking-wide ${!isGlobalDelisted ? 'text-emerald-600' : 'text-amber-600'}`}>
                                {!isGlobalDelisted ? 'Active' : 'Offline'}
                              </span>
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
          <span>Displaying {filteredProducts.length} of {staticProducts.length} Platforms</span>
          <span>Last Refreshed: {new Date().toLocaleTimeString()}</span>
        </div>
      </main>
    </div>
  );
}
