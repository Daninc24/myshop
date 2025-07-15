import { useState, useEffect } from 'react';
import { PencilIcon, TrashIcon, PlusIcon, PhotoIcon, XMarkIcon } from '@heroicons/react/24/outline';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';

const AdminProducts = () => {
  const { isManagerOrAdmin } = useAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [imageFiles, setImageFiles] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    category: '',
    stock: ''
  });

  const categories = [
    { id: 'Electronics', name: 'Electronics' },
    { id: 'Computers & Laptops', name: 'Computers & Laptops' },
    { id: 'Mobile Phones', name: 'Mobile Phones' },
    { id: 'Accessories', name: 'Accessories' },
    { id: 'Home & Kitchen', name: 'Home & Kitchen' },
    { id: 'Sports', name: 'Sports' },
    { id: 'Fashion', name: 'Fashion' },
    { id: 'Beauty', name: 'Beauty & Personal Care' },
    { id: 'Toys', name: 'Toys & Games' },
    { id: 'Books', name: 'Books' },
    { id: 'Automotive', name: 'Automotive' },
    { id: 'Groceries', name: 'Groceries' },
    { id: 'Health', name: 'Health & Wellness' },
    { id: 'Office', name: 'Office Supplies' },
    { id: 'Garden', name: 'Garden & Outdoors' },
    { id: 'Pets', name: 'Pet Supplies' },
    { id: 'Baby', name: 'Baby & Kids' },
    { id: 'Music', name: 'Music & Instruments' },
    { id: 'Art', name: 'Art & Craft' },
    { id: 'Jewelry', name: 'Jewelry' },
    { id: 'Shoes', name: 'Shoes' },
    { id: 'Bags', name: 'Bags & Luggage' },
    { id: 'Watches', name: 'Watches' },
    { id: 'Phones', name: 'Phones & Tablets' },
    { id: 'Cameras', name: 'Cameras & Photography' },
    { id: 'Gaming', name: 'Gaming' },
    { id: 'Stationery', name: 'Stationery' },
    { id: 'Food', name: 'Food & Beverages' },
    { id: 'Tools', name: 'Tools & Hardware' },
    { id: 'Travel', name: 'Travel' },
    { id: 'Fitness', name: 'Fitness & Exercise' }
  ];

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await axios.get('/products');
      setProducts(response.data || []);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 5) {
      error('Maximum 5 images allowed');
      return;
    }

    setImageFiles(files);
    
    // Create preview URLs
    const previews = files.map(file => URL.createObjectURL(file));
    setImagePreviews(previews);
  };

  const removeImage = (index) => {
    const newFiles = imageFiles.filter((_, i) => i !== index);
    const newPreviews = imagePreviews.filter((_, i) => i !== index);
    
    setImageFiles(newFiles);
    setImagePreviews(newPreviews);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate that at least one image is selected
    if (imageFiles.length === 0 && imagePreviews.length === 0) {
      error('Please upload at least one image for the product');
      return;
    }
    
    try {
      const submitData = new FormData();
      submitData.append('title', formData.title);
      submitData.append('description', formData.description);
      submitData.append('price', formData.price);
      submitData.append('category', formData.category);
      submitData.append('stock', formData.stock);
      
      // Append all image files
      imageFiles.forEach((file, index) => {
        submitData.append('images', file);
      });

      if (editingProduct) {
        await axios.put(`/products/${editingProduct._id}`, submitData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
      } else {
        await axios.post('/products', submitData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
      }
      fetchProducts();
      resetForm();
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to save product';
      error(errorMessage);
    }
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setFormData({
      title: product.title,
      description: product.description,
      price: product.price.toString(),
      category: product.category,
      stock: product.stock.toString()
    });
    setImagePreviews(product.images || []);
    setImageFiles([]);
    setShowForm(true);
  };

  const handleDelete = async (productId) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await axios.delete(`/products/${productId}`);
        fetchProducts();
      } catch (error) {
        console.error('Error deleting product:', error);
        error('Failed to delete product');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      price: '',
      category: '',
      stock: ''
    });
    setImageFiles([]);
    setImagePreviews([]);
    setEditingProduct(null);
    setShowForm(false);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto mt-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-heading font-bold text-secondary">Manage Products</h1>
        {isManagerOrAdmin && (
          <button
            onClick={() => setShowForm(true)}
            className="btn-primary flex items-center gap-2"
          >
            <PlusIcon className="h-5 w-5" />
            <span>Add Product</span>
          </button>
        )}
      </div>

      {/* Add/Edit Form */}
      {showForm && isManagerOrAdmin && (
        <div className="card mb-6">
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={e => setFormData(f => ({ ...f, title: e.target.value }))}
              placeholder="Product Title"
              className="input-field"
              required
            />
            <input
              type="number"
              name="price"
              value={formData.price}
              onChange={e => setFormData(f => ({ ...f, price: e.target.value }))}
              placeholder="Price"
              className="input-field"
              required
            />
            <select
              name="category"
              value={formData.category}
              onChange={e => setFormData(f => ({ ...f, category: e.target.value }))}
              className="input-field"
              required
            >
              <option value="">Select Category</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
            <input
              type="number"
              name="stock"
              value={formData.stock}
              onChange={e => setFormData(f => ({ ...f, stock: e.target.value }))}
              placeholder="Stock"
              className="input-field"
              required
            />
            <div className="flex flex-col gap-1 md:col-span-2">
              <label className="font-medium">Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={e => setFormData(f => ({ ...f, description: e.target.value }))}
                placeholder="Product Description"
                className="input-field"
                required
              />
            </div>
            <div className="flex flex-col gap-1 md:col-span-2">
              <label className="font-medium">Images</label>
              <input type="file" accept="image/*" multiple onChange={handleImageChange} className="file-upload-area" />
              {imagePreviews.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 mt-2">
                  {imagePreviews.map((preview, idx) => (
                    <div key={idx} className="relative">
                      <img src={preview} alt={`Preview ${idx + 1}`} className="image-preview w-full h-32" />
                      <button type="button" onClick={() => removeImage(idx)} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"><XMarkIcon className="h-4 w-4" /></button>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="flex gap-2 md:col-span-2 mt-2">
              <button type="submit" className="btn-primary">{editingProduct ? 'Update Product' : 'Add Product'}</button>
              <button type="button" className="btn-secondary" onClick={resetForm}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      {/* Product List */}
      <div className="grid gap-4">
        {products.map(product => (
          <div key={product._id} className="card flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex items-center gap-4 flex-1">
              {product.images && product.images[0] && (
                <img src={product.images[0]} alt={product.title} className="image-preview" />
              )}
              <div>
                <h2 className="text-lg font-heading font-bold text-secondary mb-1">{product.title}</h2>
                <div className="text-gray-500 text-sm mb-1">{product.category}</div>
                <div className="text-primary font-semibold text-xl mb-1">Ksh {product.price}</div>
                <div className="text-xs text-gray-400">Stock: {product.stock}</div>
                <div className="text-gray-700 text-sm mt-2 line-clamp-2">{product.description}</div>
              </div>
            </div>
            <div className="flex flex-col gap-2 md:ml-4">
              <button className="btn-secondary" onClick={() => handleEdit(product)}><PencilIcon className="h-4 w-4 inline mr-1" />Edit</button>
              <button className="btn-danger" onClick={() => handleDelete(product._id)}><TrashIcon className="h-4 w-4 inline mr-1" />Delete</button>
            </div>
          </div>
        ))}
        {products.length === 0 && <div className="text-gray-400 text-center">No products found.</div>}
      </div>
    </div>
  );
};

export default AdminProducts; 