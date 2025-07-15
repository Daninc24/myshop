import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { PhotoIcon, XMarkIcon } from '@heroicons/react/24/outline';

const emptyAdvert = {
  title: '',
  message: '',
  product: '',
  image: '',
  startDate: '',
  endDate: '',
  active: true,
};

const advertTemplates = [
  {
    id: 'classic',
    name: 'Classic',
    render: ({ title, message, image, product }) => (
      <div className="border rounded p-4 bg-white flex gap-4 items-center">
        {image && <img src={image} alt="Advert" className="w-24 h-24 object-cover rounded" />}
        <div>
          <h2 className="text-xl font-bold">{title}</h2>
          <p className="text-gray-700">{message}</p>
          <div className="text-xs text-gray-500 mt-2">{product}</div>
        </div>
      </div>
    )
  },
  {
    id: 'banner',
    name: 'Banner',
    render: ({ title, message, image }) => (
      <div className="relative h-32 flex items-center justify-center bg-blue-100 rounded overflow-hidden">
        {image && <img src={image} alt="Advert" className="absolute inset-0 w-full h-full object-cover opacity-40" />}
        <div className="relative z-10 text-center">
          <h2 className="text-2xl font-bold text-blue-900 drop-shadow">{title}</h2>
          <p className="text-blue-800 mt-1">{message}</p>
        </div>
      </div>
    )
  },
  {
    id: 'card',
    name: 'Card',
    render: ({ title, message, image }) => (
      <div className="bg-gradient-to-br from-pink-100 to-yellow-100 rounded-lg p-4 flex flex-col items-center">
        {image && <img src={image} alt="Advert" className="w-20 h-20 object-cover rounded-full mb-2" />}
        <h2 className="text-lg font-bold text-pink-700">{title}</h2>
        <p className="text-sm text-gray-700">{message}</p>
      </div>
    )
  },
  {
    id: 'left-image',
    name: 'Left Image Banner',
    render: ({ title, message, image, product }) => (
      <div className="flex items-center bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg p-4 gap-4">
        {image && <img src={image} alt="Advert" className="w-28 h-28 object-cover rounded-lg shadow-lg" />}
        <div>
          <h2 className="text-2xl font-bold mb-1">{title}</h2>
          <p className="text-white mb-2">{message}</p>
          {product && <span className="text-xs bg-white/20 px-2 py-1 rounded">{product}</span>}
        </div>
      </div>
    )
  },
  {
    id: 'cta-card',
    name: 'CTA Card',
    render: ({ title, message, image, product }) => (
      <div className="bg-white border-2 border-pink-400 rounded-xl p-6 flex flex-col items-center shadow-md">
        {image && <img src={image} alt="Advert" className="w-24 h-24 object-cover rounded-full border-4 border-pink-200 mb-2" />}
        <h2 className="text-xl font-bold text-pink-700 mb-1">{title}</h2>
        <p className="text-gray-700 mb-2">{message}</p>
        {product && <span className="text-xs text-pink-600 mb-2">{product}</span>}
        <button className="bg-pink-500 text-white px-4 py-2 rounded-full font-semibold hover:bg-pink-600 transition">Shop Now</button>
      </div>
    )
  },
];

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
  const [template, setTemplate] = useState('classic');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [productSearch, setProductSearch] = useState('');
  const [selectedAdvert, setSelectedAdvert] = useState(null);

  useEffect(() => {
    fetchAdverts();
    fetchProducts();
  }, []);

  const fetchAdverts = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/adverts/all');
      setAdverts(res.data.adverts || []);
    } catch {
      setAdverts([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    try {
      const res = await axios.get('/products');
      setProducts(Array.isArray(res.data) ? res.data : (res.data.products || []));
    } catch {
      setProducts([]);
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
        await axios.put(`/adverts/${editingId}`, data, { headers: { 'Content-Type': 'multipart/form-data' } });
        setMsg('Advert updated!');
      } else {
        await axios.post('/adverts', data, { headers: { 'Content-Type': 'multipart/form-data' } });
        setMsg('Advert created!');
      }
      setForm(emptyAdvert);
      setEditingId(null);
      setImageFile(null);
      setImagePreview('');
      fetchAdverts();
    } catch (err) {
      setMsg('Error: ' + (err.response?.data?.message || err.message));
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
    setTemplate(advert.template || 'classic');
    setImageFile(null);
    setImagePreview(advert.image || '');
    setMsg('');
  };

  const handleDelete = async id => {
    if (!window.confirm('Delete this advert?')) return;
    setMsg('');
    try {
      await axios.delete(`/adverts/${id}`);
      setMsg('Advert deleted!');
      fetchAdverts();
    } catch (err) {
      setMsg('Error: ' + (err.response?.data?.message || err.message));
    }
  };

  return (
    <div className="card max-w-4xl mx-auto mt-8">
      <h1 className="text-3xl font-heading font-bold mb-6 text-secondary">Manage Product Adverts</h1>
      {msg && <div className="mb-2 bg-green-50 border border-green-200 text-green-700 rounded-lg px-4 py-2 animate-slide-in">{msg}</div>}
      <form onSubmit={handleSubmit} className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4" encType="multipart/form-data">
        <input name="title" value={form.title} onChange={handleChange} placeholder="Advert Title" className="input-field" required />
        <input name="message" value={form.message} onChange={handleChange} placeholder="Message" className="input-field" required />
        <div className="flex flex-col gap-1">
          <label className="font-medium">Product</label>
          <select
            name="product"
            value={form.product}
            onChange={handleChange}
            className="input-field"
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
        <div className="flex flex-col gap-1">
          <label className="font-medium">Image</label>
          <input type="file" accept="image/*" onChange={handleImageChange} className="file-upload-area" />
          {imagePreview && <img src={imagePreview} alt="Preview" className="image-preview mt-2" />}
        </div>
        <input type="date" name="startDate" value={form.startDate} onChange={handleChange} className="input-field" required />
        <input type="date" name="endDate" value={form.endDate} onChange={handleChange} className="input-field" required />
        <div className="flex items-center gap-2">
          <input type="checkbox" name="active" checked={form.active} onChange={handleChange} className="form-checkbox" />
          <label className="text-sm">Active</label>
        </div>
        <div className="flex flex-col gap-1">
          <label className="font-medium">Template</label>
          <select value={template} onChange={e => setTemplate(e.target.value)} className="input-field">
            {advertTemplates.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
          </select>
        </div>
        <div className="flex gap-2 mt-2 md:col-span-2">
          <button type="submit" className="btn-primary">{editingId ? 'Update Advert' : 'Create Advert'}</button>
          {editingId && <button type="button" className="btn-secondary" onClick={() => { setForm(emptyAdvert); setEditingId(null); setImageFile(null); setImagePreview(''); }}>Cancel</button>}
        </div>
      </form>
      <div className="grid gap-4">
        {adverts.map(advert => (
          <div key={advert._id} className="card flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex-1 cursor-pointer" onClick={() => setSelectedAdvert(advert)}>
              {(advertTemplates.find(t => t.id === (advert.template || 'classic'))?.render || advertTemplates[0].render)({
                title: advert.title,
                message: advert.message,
                image: advert.image,
                product: getProductTitle(advert.product, products),
                productId: advert.product,
              })}
            </div>
            <div className="flex flex-col gap-2 md:ml-4">
              <button className="btn-secondary" onClick={() => handleEdit(advert)}>Edit</button>
              <button className="btn-danger" onClick={() => handleDelete(advert._id)}>Delete</button>
            </div>
          </div>
        ))}
        {adverts.length === 0 && <div className="text-gray-400 text-center">No adverts found.</div>}
      </div>
      {/* Advert Detail Modal */}
      {selectedAdvert && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-strong max-w-lg w-full p-6 relative animate-fade-in">
            <button className="absolute top-2 right-2 text-gray-400 hover:text-red-500" onClick={() => setSelectedAdvert(null)}>
              <XMarkIcon className="h-6 w-6" />
            </button>
            <h2 className="text-2xl font-bold mb-2">{selectedAdvert.title}</h2>
            {selectedAdvert.image && <img src={selectedAdvert.image} alt="Advert" className="w-full h-48 object-cover rounded mb-3" />}
            <div className="mb-2 text-gray-700">{selectedAdvert.message}</div>
            <div className="mb-2 text-sm text-gray-500">Product: {getProductTitle(selectedAdvert.product, products)}</div>
            <div className="mb-2 text-sm text-gray-500">Start: {selectedAdvert.startDate ? new Date(selectedAdvert.startDate).toLocaleDateString() : '-'}</div>
            <div className="mb-2 text-sm text-gray-500">End: {selectedAdvert.endDate ? new Date(selectedAdvert.endDate).toLocaleDateString() : '-'}</div>
            <div className="mb-2 text-sm text-gray-500">Active: {selectedAdvert.active ? 'Yes' : 'No'}</div>
            <div className="mb-2 text-sm text-gray-500">Template: {selectedAdvert.template || 'classic'}</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminAdverts; 