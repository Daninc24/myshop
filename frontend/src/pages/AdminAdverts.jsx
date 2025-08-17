import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { 
  PhotoIcon, 
  XMarkIcon, 
  PlusIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  CalendarIcon,
  ChartBarIcon,
  CogIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';
import { Link } from 'react-router-dom';
import { getOptimizedImageUrl } from '../utils/imageUtils';
import { advertTemplates, templateCategories, getTemplatePreview } from '../components/AdvertTemplates';
import advertisementService from '../services/advertisementService';

const emptyAdvert = {
  title: '',
  message: '',
  product: '',
  image: '',
  startDate: '',
  endDate: '',
  active: true,
  template: 'premium-hero'
};

const getProductTitle = (productField, products) => {
  if (!productField) return '';
  if (typeof productField === 'string') {
    const found = products.find(p => p._id === productField);
    return found ? found.title : productField;
  }
  if (typeof productField === 'object') {
    return productField.title || productField.name || productField._id || '';
  }
  return '';
};

const AdminAdverts = () => {
  const [adverts, setAdverts] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(emptyAdvert);
  const [editingId, setEditingId] = useState(null);
  const [msg, setMsg] = useState('');
  const [template, setTemplate] = useState('premium-hero');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [productSearch, setProductSearch] = useState('');
  const [selectedAdvert, setSelectedAdvert] = useState(null);
  const [showPreview, setShowPreview] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    inactive: 0,
    expiring: 0
  });

  useEffect(() => {
    fetchAdverts();
    fetchProducts();
    fetchStats();
  }, []);

  const fetchAdverts = async () => {
    setLoading(true);
    try {
      const adverts = await advertisementService.getAllAdvertisements();
      setAdverts(adverts);
    } catch (error) {
      console.error('Error fetching adverts:', error);
      setAdverts([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    try {
      const res = await axios.get('/products');
      setProducts(Array.isArray(res.data) ? res.data : (res.data.products || []));
    } catch (error) {
      console.error('Error fetching products:', error);
      setProducts([]);
    }
  };

  const fetchStats = async () => {
    try {
      const adStats = await advertisementService.getAdStatistics();
      setStats(adStats);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleChange = e => {
    const { name, value, type, checked } = e.target;
    setForm(f => ({ ...f, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleImageChange = e => {
    const file = e.target.files[0];
    setImageFile(file);
    if (file) setImagePreview(URL.createObjectURL(file));
    else setImagePreview('');
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setMsg('');

    // Validate form
    const errors = advertisementService.validateAdvertisementData(form);
    if (errors.length > 0) {
      setMsg('Error: ' + errors.join(', '));
      return;
    }

    try {
      const data = new FormData();
      data.append('title', form.title);
      data.append('message', form.message);
      data.append('product', form.product);
      data.append('startDate', form.startDate);
      data.append('endDate', form.endDate);
      data.append('active', form.active);
      data.append('template', template);
      if (imageFile) data.append('image', imageFile);
      else if (form.image) data.append('image', form.image);

      if (editingId) {
        await advertisementService.updateAdvertisement(editingId, data);
        setMsg('✅ Advertisement updated successfully!');
      } else {
        await advertisementService.createAdvertisement(data);
        setMsg('✅ Advertisement created successfully!');
      }
      
      setForm(emptyAdvert);
      setEditingId(null);
      setImageFile(null);
      setImagePreview('');
      fetchAdverts();
      fetchStats();
    } catch (err) {
      setMsg('❌ Error: ' + (err.message || 'Failed to save advertisement'));
    }
  };

  const handleEdit = advert => {
    setForm({
      ...advert,
      product: advert.product?._id || advert.product,
      startDate: advert.startDate ? advert.startDate.slice(0, 10) : '',
      endDate: advert.endDate ? advert.endDate.slice(0, 10) : '',
    });
    setEditingId(advert._id);
    setTemplate(advert.template || 'premium-hero');
    setImageFile(null);
    setImagePreview(advert.image || '');
    setMsg('');
  };

  const handleDelete = async id => {
    if (!window.confirm('Are you sure you want to delete this advertisement?')) return;
    setMsg('');
    try {
      await advertisementService.deleteAdvertisement(id);
      setMsg('✅ Advertisement deleted successfully!');
      fetchAdverts();
      fetchStats();
    } catch (err) {
      setMsg('❌ Error: ' + (err.message || 'Failed to delete advertisement'));
    }
  };

  const filteredAdverts = adverts.filter(advert => {
    if (selectedCategory === 'all') return true;
    const templateObj = advertTemplates.find(t => t.id === advert.template);
    return templateObj?.category === selectedCategory;
  });

  const getPreviewData = () => ({
    title: form.title || 'Sample Advertisement',
    message: form.message || 'This is a sample advertisement message',
    image: imagePreview || form.image || '/images/placeholder-advert.png',
    product: getProductTitle(form.product, products),
    productId: form.product
  });

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <SparklesIcon className="w-8 h-8 text-orange-500" />
              Advertisement Management
            </h1>
            <p className="text-gray-600 mt-2">Create and manage promotional advertisements for your store</p>
          </div>
          <button
            onClick={() => {
              setForm(emptyAdvert);
              setEditingId(null);
              setImageFile(null);
              setImagePreview('');
              setMsg('');
            }}
            className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors flex items-center gap-2"
          >
            <PlusIcon className="w-5 h-5" />
            New Advertisement
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg p-4 shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Ads</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
              <ChartBarIcon className="w-8 h-8 text-blue-500" />
            </div>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active</p>
                <p className="text-2xl font-bold text-green-600">{stats.active}</p>
              </div>
              <EyeIcon className="w-8 h-8 text-green-500" />
            </div>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Inactive</p>
                <p className="text-2xl font-bold text-red-600">{stats.inactive}</p>
              </div>
              <XMarkIcon className="w-8 h-8 text-red-500" />
            </div>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Expiring Soon</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.expiring}</p>
              </div>
              <CalendarIcon className="w-8 h-8 text-yellow-500" />
            </div>
          </div>
        </div>

        {msg && (
          <div className={`mb-4 p-4 rounded-lg ${
            msg.includes('✅') ? 'bg-green-50 border border-green-200 text-green-700' : 
            msg.includes('❌') ? 'bg-red-50 border border-red-200 text-red-700' : 
            'bg-blue-50 border border-blue-200 text-blue-700'
          }`}>
            {msg}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form Section */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-lg p-6 sticky top-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <CogIcon className="w-5 h-5" />
              {editingId ? 'Edit Advertisement' : 'Create Advertisement'}
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                <input 
                  name="title" 
                  value={form.title} 
                  onChange={handleChange} 
                  placeholder="Enter advertisement title" 
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent" 
                  required 
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Message</label>
                <textarea 
                  name="message" 
                  value={form.message} 
                  onChange={handleChange} 
                  placeholder="Enter advertisement message" 
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent" 
                  required 
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Product</label>
                <select
                  name="product"
                  value={form.product}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  required
                >
                  <option value="">Select a product</option>
                  {products.map((product) => (
                    <option key={product._id} value={product._id}>
                      {product.title}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Template</label>
                <select
                  value={template}
                  onChange={e => setTemplate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                >
                  {advertTemplates.map(t => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Image</label>
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={handleImageChange} 
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent" 
                />
                {imagePreview && (
                  <img src={imagePreview} alt="Preview" className="mt-2 w-full h-32 object-cover rounded-lg" />
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
                  <input 
                    type="date" 
                    name="startDate" 
                    value={form.startDate} 
                    onChange={handleChange} 
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent" 
                    required 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
                  <input 
                    type="date" 
                    name="endDate" 
                    value={form.endDate} 
                    onChange={handleChange} 
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent" 
                    required 
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input 
                  type="checkbox" 
                  name="active" 
                  checked={form.active} 
                  onChange={handleChange} 
                  className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500" 
                />
                <label className="text-sm text-gray-700">Active</label>
              </div>

              <div className="flex gap-3">
                <button 
                  type="submit" 
                  className="flex-1 bg-orange-500 text-white py-2 px-4 rounded-lg hover:bg-orange-600 transition-colors"
                >
                  {editingId ? 'Update' : 'Create'}
                </button>
                {editingId && (
                  <button 
                    type="button" 
                    onClick={() => { 
                      setForm(emptyAdvert); 
                      setEditingId(null); 
                      setImageFile(null); 
                      setImagePreview(''); 
                    }}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>

        {/* Preview and List Section */}
        <div className="lg:col-span-2 space-y-6">
          {/* Template Preview */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Template Preview</h3>
              <button
                onClick={() => setShowPreview(!showPreview)}
                className="text-orange-600 hover:text-orange-700 text-sm font-medium"
              >
                {showPreview ? 'Hide Preview' : 'Show Preview'}
              </button>
            </div>
            {showPreview && (
              <div className="border border-gray-200 rounded-lg p-4">
                {getTemplatePreview(template, getPreviewData())}
              </div>
            )}
          </div>

          {/* Category Filter */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Filter by Category</h3>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedCategory('all')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  selectedCategory === 'all' 
                    ? 'bg-orange-500 text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                All Templates
              </button>
              {templateCategories.map(category => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    selectedCategory === category.id 
                      ? 'bg-orange-500 text-white' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {category.name}
                </button>
              ))}
            </div>
          </div>

          {/* Advertisements List */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Advertisements</h3>
            
            {loading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="bg-gray-200 rounded-lg h-32"></div>
                  </div>
                ))}
              </div>
            ) : filteredAdverts.length === 0 ? (
              <div className="text-center py-8">
                <PhotoIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No advertisements found.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredAdverts.map(advert => (
                  <div key={advert._id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          advert.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {advert.active ? 'Active' : 'Inactive'}
                        </span>
                        <span className="text-sm text-gray-500">
                          {advertTemplates.find(t => t.id === advert.template)?.name || 'Unknown Template'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEdit(advert)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        >
                          <PencilIcon className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(advert._id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <TrashIcon className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    
                    <div className="mb-3">
                      {getTemplatePreview(advert.template, {
                        title: advert.title,
                        message: advert.message,
                        image: advert.image,
                        product: getProductTitle(advert.product, products),
                        productId: advert.product?._id || advert.product
                      })}
                    </div>
                    
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <div className="flex items-center gap-4">
                        <span>Start: {new Date(advert.startDate).toLocaleDateString()}</span>
                        <span>End: {new Date(advert.endDate).toLocaleDateString()}</span>
                      </div>
                      {advert.product && (
                        <Link 
                          to={`/products/${advert.product._id || advert.product}`}
                          className="text-orange-600 hover:text-orange-700 font-medium"
                        >
                          View Product
                        </Link>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminAdverts;