import React, { useEffect, useState } from 'react';
import axios from 'axios';

const emptyCategory = { name: '', id: '', subcategories: [] };
const emptySubcategory = { name: '', id: '' };

export default function AdminCategories() {
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState(emptyCategory);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get('/api/categories');
      setCategories(data.categories || []);
    } catch (err) {
      setError('Failed to fetch categories');
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleInput = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubInput = (idx, e) => {
    const updatedSubs = [...form.subcategories];
    updatedSubs[idx][e.target.name] = e.target.value;
    setForm({ ...form, subcategories: updatedSubs });
  };

  const addSubcategory = () => {
    setForm({ ...form, subcategories: [...form.subcategories, { ...emptySubcategory }] });
  };

  const removeSubcategory = (idx) => {
    setForm({ ...form, subcategories: form.subcategories.filter((_, i) => i !== idx) });
  };

  const resetForm = () => {
    setForm(emptyCategory);
    setEditingId(null);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    // Filter out empty subcategories
    const filteredSubs = (form.subcategories || []).filter(
      sub => sub.name && sub.id
    );
    // Check for duplicate subcategory IDs
    const ids = filteredSubs.map(sub => sub.id);
    const hasDupes = ids.length !== new Set(ids).size;
    if (hasDupes) {
      setError('Duplicate subcategory IDs are not allowed');
      setLoading(false);
      return;
    }
    try {
      const submitData = { ...form, subcategories: filteredSubs };
      if (editingId) {
        await axios.put(`/api/categories/${editingId}`, submitData);
      } else {
        await axios.post('/api/categories', submitData);
      }
      fetchCategories();
      resetForm();
    } catch (err) {
      setError(err.response?.data?.message || 'Error saving category');
    }
    setLoading(false);
  };


  const handleEdit = (cat) => {
    setForm({ ...cat, subcategories: cat.subcategories || [] });
    setEditingId(cat.id);
    setError('');
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this category?')) return;
    setLoading(true);
    try {
      await axios.delete(`/api/categories/${id}`);
      fetchCategories();
      resetForm();
    } catch (err) {
      setError('Error deleting category');
    }
    setLoading(false);
  };

  return (
    <div className="max-w-3xl mx-auto py-8">
      <h1 className="text-2xl font-bold mb-4">Manage Categories & Subcategories</h1>
      <form onSubmit={handleSubmit} className="bg-white p-4 rounded-xl shadow mb-6">
        <div className="mb-2">
          <label className="block font-semibold">Category Name</label>
          <input name="name" value={form.name} onChange={handleInput} className="border rounded px-2 py-1 w-full" required />
        </div>
        <div className="mb-2">
          <label className="block font-semibold">Category ID</label>
          <input name="id" value={form.id} onChange={handleInput} className="border rounded px-2 py-1 w-full" required disabled={!!editingId} />
        </div>
        <div className="mb-2">
          <label className="block font-semibold">Subcategories</label>
          {(form.subcategories.length === 0 ? [{}] : form.subcategories).map((sub, idx) => (
            <div key={idx} className="flex gap-2 mb-1 items-center">
              <input name="name" placeholder="Subcategory Name" value={sub.name || ''} onChange={e => handleSubInput(idx, e)} className="border rounded px-2 py-1 flex-1" required />
              <input name="id" placeholder="Subcategory ID" value={sub.id || ''} onChange={e => handleSubInput(idx, e)} className="border rounded px-2 py-1 w-36" required />
              <button type="button" onClick={() => removeSubcategory(idx)} className="ml-1 px-2 py-1 bg-red-100 text-red-600 rounded hover:bg-red-200" title="Remove Subcategory">&times;</button>
            </div>
          ))}
          <button type="button" onClick={addSubcategory} className="mt-2 px-3 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 font-semibold" title="Add Subcategory">+ Add Subcategory</button>
        </div>
        {error && <div className="text-red-600 mb-2">{error}</div>}
        <div className="flex gap-2 mt-4">
          <button type="submit" className="bg-blue-700 text-white px-4 py-2 rounded-xl" disabled={loading}>{editingId ? 'Update' : 'Add'} Category</button>
          <button type="button" onClick={resetForm} className="bg-gray-200 px-4 py-2 rounded-xl">Cancel</button>
        </div>
      </form>
      <div className="bg-white p-4 rounded-xl shadow">
        <h2 className="font-semibold mb-2">All Categories</h2>
        {loading && <div>Loading...</div>}
        <ul>
          {categories.map(cat => (
            <li key={cat.id} className="border-b py-2 flex flex-col">
              <div className="flex items-center justify-between">
                <span className="font-bold">{cat.name}</span>
                <div className="flex gap-2">
                  <button onClick={() => handleEdit(cat)} className="text-blue-600 underline">Edit</button>
                  <button onClick={() => handleDelete(cat.id)} className="text-red-600 underline">Delete</button>
                </div>
              </div>
              {cat.subcategories && cat.subcategories.length > 0 && (
                <ul className="ml-4 mt-1 text-sm text-gray-700">
                  {cat.subcategories.map(sub => (
                    <li key={sub.id}>- {sub.name} <span className="text-gray-400">({sub.id})</span></li>
                  ))}
                </ul>
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
