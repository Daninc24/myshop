import { useState, useEffect } from 'react';
import AdminLayout from '../components/admin/AdminLayout';
import { PencilIcon, TrashIcon, PlusIcon, PhotoIcon, XMarkIcon } from '@heroicons/react/24/outline';
import axios from 'axios';
import { useToast } from '../contexts/ToastContext';
import { useAuth } from '../contexts/AuthContext';
import { getOptimizedImageUrl } from '../utils/imageUtils';
import categories from '../utils/categories';

const AdminProducts = () => {
  const { isManagerOrAdmin } = useAuth();
  const { error, success } = useToast();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [imageFiles, setImageFiles] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [hasVariants, setHasVariants] = useState(false);
  // Structured state for options and variants (replaces raw JSON)
  const [options, setOptions] = useState([{ name: '', values: [] }]);
  const [variants, setVariants] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    compareAtPrice: '',
    category: '',
    subcategory: '',
    stock: '',
    status: 'draft',
    // Delivery information
    freeShipping: false,
    deliveryTime: 'next_day',
    expressDelivery: false,
    expressDeliveryFee: '',
    weight: '',
    weightUnit: 'g',
    length: '',
    width: '',
    height: '',
    dimensionUnit: 'cm',
    // Specifications
    brand: '',
    model: '',
    material: '',
    color: '',
    size: '',
    warranty: '',
    countryOfOrigin: '',
    // SEO and marketing
    seoTitle: '',
    seoDescription: '',
    seoKeywords: '',
    tags: '',
    isFeatured: false,
    isOnSale: false,
    salePercentage: ''
  });

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await axios.get('/products');
      const data = response.data;
      const list = Array.isArray(data) ? data : (Array.isArray(data?.products) ? data.products : []);
      setProducts(list);
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
      // If not using variants, send simple price/stock
      if (!hasVariants) {
        submitData.append('price', formData.price);
        submitData.append('stock', formData.stock);
        if (formData.compareAtPrice) submitData.append('compareAtPrice', formData.compareAtPrice);
      } else {
        // Using variants: validate and send options and variants as JSON
        const cleanOptions = options
          .filter(opt => opt.name && Array.isArray(opt.values) && opt.values.length)
          .map(opt => ({ name: opt.name.trim(), values: opt.values.map(v => v.trim()).filter(Boolean) }));
        if (cleanOptions.length === 0) {
          error('Please add at least one option with values (e.g., Size: S, M, L)');
          return;
        }
        if (!variants || variants.length === 0) {
          error('Please generate variants from options before saving');
          return;
        }
        const cleanVariants = variants.map(v => ({
          sku: (v.sku || '').trim(),
          price: Number(v.price) || 0,
          quantity: Number(v.quantity) || 0,
          options: Array.isArray(v.options) ? v.options.map(o => ({ name: o.name, value: o.value })) : []
        }));
        submitData.append('options', JSON.stringify(cleanOptions));
        submitData.append('variants', JSON.stringify(cleanVariants));
      }
      submitData.append('category', formData.category);
      if (formData.subcategory) {
        submitData.append('subcategory', formData.subcategory);
      }
      submitData.append('status', formData.status);
      
      // Delivery information
      submitData.append('freeShipping', formData.freeShipping);
      submitData.append('deliveryTime', formData.deliveryTime);
      submitData.append('expressDelivery', formData.expressDelivery);
      if (formData.expressDeliveryFee) {
        submitData.append('expressDeliveryFee', formData.expressDeliveryFee);
      }
      if (formData.weight) {
        submitData.append('weight', formData.weight);
        submitData.append('weightUnit', formData.weightUnit);
      }
      if (formData.length) {
        submitData.append('length', formData.length);
        submitData.append('width', formData.width);
        submitData.append('height', formData.height);
        submitData.append('dimensionUnit', formData.dimensionUnit);
      }
      
      // Specifications
      if (formData.brand) submitData.append('brand', formData.brand);
      if (formData.model) submitData.append('model', formData.model);
      if (formData.material) submitData.append('material', formData.material);
      if (formData.color) submitData.append('color', formData.color);
      if (formData.size) submitData.append('size', formData.size);
      if (formData.warranty) submitData.append('warranty', formData.warranty);
      if (formData.countryOfOrigin) submitData.append('countryOfOrigin', formData.countryOfOrigin);
      
      // SEO and marketing
      if (formData.seoTitle) submitData.append('seoTitle', formData.seoTitle);
      if (formData.seoDescription) submitData.append('seoDescription', formData.seoDescription);
      if (formData.seoKeywords) submitData.append('seoKeywords', formData.seoKeywords);
      if (formData.tags) submitData.append('tags', formData.tags);
      submitData.append('isFeatured', formData.isFeatured);
      submitData.append('isOnSale', formData.isOnSale);
      if (formData.salePercentage) submitData.append('salePercentage', formData.salePercentage);
      
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
        success('Product updated');
      } else {
        await axios.post('/products', submitData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
        success('Product created');
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
      price: (product.price ?? '').toString(),
      compareAtPrice: (product.compareAtPrice ?? '').toString(),
      category: product.category,
      subcategory: product.subcategory || '',
      stock: (product.stock ?? '').toString(),
      status: product.status || 'draft',
      // Delivery information
      freeShipping: product.delivery?.freeShipping || false,
      deliveryTime: product.delivery?.deliveryTime || 'next_day',
      expressDelivery: product.delivery?.expressDelivery || false,
      expressDeliveryFee: (product.delivery?.expressDeliveryFee ?? '').toString(),
      weight: (product.delivery?.weight?.value ?? '').toString(),
      weightUnit: product.delivery?.weight?.unit || 'g',
      length: (product.delivery?.dimensions?.length ?? '').toString(),
      width: (product.delivery?.dimensions?.width ?? '').toString(),
      height: (product.delivery?.dimensions?.height ?? '').toString(),
      dimensionUnit: product.delivery?.dimensions?.unit || 'cm',
      // Specifications
      brand: product.specifications?.brand || '',
      model: product.specifications?.model || '',
      material: product.specifications?.material || '',
      color: product.specifications?.color || '',
      size: product.specifications?.size || '',
      warranty: product.specifications?.warranty || '',
      countryOfOrigin: product.specifications?.countryOfOrigin || '',
      // SEO and marketing
      seoTitle: product.seo?.title || '',
      seoDescription: product.seo?.description || '',
      seoKeywords: product.seo?.keywords?.join(', ') || '',
      tags: product.tags?.join(', ') || '',
      isFeatured: product.isFeatured || false,
      isOnSale: product.isOnSale || false,
      salePercentage: (product.salePercentage ?? '').toString()
    });
    // Determine if product has variants
    const hasVar = Array.isArray(product.variants) && product.variants.length > 0;
    setHasVariants(hasVar);
    if (hasVar) {
      // Initialize structured options and variants
      setOptions((product.options || []).map(o => ({ name: o.name, values: Array.isArray(o.values) ? o.values : [] })));
      setVariants((product.variants || []).map(v => ({
        sku: v.sku || '',
        price: v.price ?? 0,
        quantity: v.quantity ?? 0,
        options: Array.isArray(v.options) ? v.options : []
      })));
    } else {
      setOptions([{ name: '', values: [] }]);
      setVariants([]);
    }
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
      compareAtPrice: '',
      category: '',
      subcategory: '',
      stock: '',
      status: 'draft',
      // Delivery information
      freeShipping: false,
      deliveryTime: 'next_day',
      expressDelivery: false,
      expressDeliveryFee: '',
      weight: '',
      weightUnit: 'g',
      length: '',
      width: '',
      height: '',
      dimensionUnit: 'cm',
      // Specifications
      brand: '',
      model: '',
      material: '',
      color: '',
      size: '',
      warranty: '',
      countryOfOrigin: '',
      // SEO and marketing
      seoTitle: '',
      seoDescription: '',
      seoKeywords: '',
      tags: '',
      isFeatured: false,
      isOnSale: false,
      salePercentage: ''
    });
    setImageFiles([]);
    setImagePreviews([]);
    setEditingProduct(null);
    setShowForm(false);
    setHasVariants(false);
    setOptions([{ name: '', values: [] }]);
    setVariants([]);
  };

  // Helpers for options/variants UI
  const updateOptionName = (idx, value) => {
    setOptions(prev => prev.map((o, i) => i === idx ? { ...o, name: value } : o));
  };
  const updateOptionValues = (idx, csv) => {
    const values = csv.split(',').map(v => v.trim()).filter(Boolean);
    setOptions(prev => prev.map((o, i) => i === idx ? { ...o, values } : o));
  };
  const addOption = () => setOptions(prev => [...prev, { name: '', values: [] }]);
  const removeOption = (idx) => setOptions(prev => prev.filter((_, i) => i !== idx));
  const cartesian = (arrays) => arrays.reduce((a, b) => a.flatMap(x => b.map(y => [...x, y])), [[]]);
  const generateSku = (base, optionPairs, idx) => {
    const slugBase = (base || 'SKU').toString().toUpperCase().replace(/[^A-Z0-9]+/g, '-').replace(/^-+|-+$/g, '');
    const optPart = optionPairs.map(p => p.value.toString().toUpperCase().replace(/[^A-Z0-9]+/g, '')).join('-');
    return `${slugBase}-${optPart || 'VAR'}-${String(idx + 1).padStart(3, '0')}`;
  };
  const generateVariants = () => {
    const cleanOptions = options.filter(o => o.name && o.values.length);
    if (cleanOptions.length === 0) {
      error('Add at least one option with values before generating variants');
      return;
    }
    const combos = cartesian(cleanOptions.map(o => o.values));
    const newVariants = combos.map((combo, idx) => {
      const optionPairs = combo.map((val, i) => ({ name: cleanOptions[i].name, value: val }));
      return {
        sku: generateSku(formData.title || formData.category, optionPairs, idx),
        price: Number(formData.price) || 0,
        quantity: 0,
        options: optionPairs
      };
    });
    setVariants(newVariants);
  };
  const updateVariantField = (vIdx, field, value) => {
    setVariants(prev => prev.map((v, i) => i === vIdx ? { ...v, [field]: field === 'price' || field === 'quantity' ? Number(value) : value } : v));
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <AdminLayout breadcrumb={["Products"]}>
    <div className="space-y-6 max-w-7xl mx-auto mt-2">
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
            {!hasVariants && (
              <>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={e => setFormData(f => ({ ...f, price: e.target.value }))}
                  placeholder="Price"
                  className="input-field"
                  required
                />
                <input
                  type="number"
                  name="compareAtPrice"
                  value={formData.compareAtPrice}
                  onChange={e => setFormData(f => ({ ...f, compareAtPrice: e.target.value }))}
                  placeholder="Compare-at Price (optional)"
                  className="input-field"
                />
              </>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1">
                <label className="font-medium">Category</label>
                <select
                  value={formData.category}
                  onChange={(e) => {
                    setFormData({...formData, category: e.target.value, subcategory: ''});
                  }}
                  className="input-field"
                >
                  <option value="">Select Category</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>
              
              {formData.category && categories.find(c => c.id === formData.category)?.subcategories?.length > 0 && (
              <div className="flex flex-col gap-1 w-full">
                <label className="font-medium">Subcategory</label>
                <select
                  value={formData.subcategory}
                  onChange={(e) => setFormData({...formData, subcategory: e.target.value})}
                  className="input-field"
                >
                  <option value="">Select Subcategory</option>
                  {categories
                    .find(c => c.id === formData.category)
                    ?.subcategories
                    ?.map(sub => (
                      <option key={sub.id} value={sub.id}>{sub.name}</option>
                    ))}
                </select>
              </div>
              )}
            </div>
            {!hasVariants && (
              <input
                type="number"
                name="stock"
                value={formData.stock}
                onChange={e => setFormData(f => ({ ...f, stock: e.target.value }))}
                placeholder="Stock"
                className="input-field"
                required
              />
            )}
            <div className="flex items-center gap-2 md:col-span-2">
              <input id="hasVariants" type="checkbox" checked={hasVariants} onChange={e => setHasVariants(e.target.checked)} />
              <label htmlFor="hasVariants" className="font-medium">This product has variants (e.g., Size, Color)</label>
            </div>
            {hasVariants && (
              <>
                {/* Options Builder */}
                <div className="md:col-span-2">
                  <div className="flex items-center justify-between mb-2">
                    <label className="font-medium">Options</label>
                    <button type="button" className="btn-secondary" onClick={addOption}>Add Option</button>
                  </div>
                  <div className="flex flex-col gap-3">
                    {options.map((opt, idx) => (
                      <div key={idx} className="grid grid-cols-1 md:grid-cols-3 gap-2 items-end">
                        <div className="flex flex-col">
                          <label className="text-sm text-gray-600">Option name</label>
                          <input
                            type="text"
                            value={opt.name}
                            onChange={(e) => updateOptionName(idx, e.target.value)}
                            placeholder="e.g., Size"
                            className="input-field"
                          />
                        </div>
                        <div className="md:col-span-2 flex flex-col">
                          <label className="text-sm text-gray-600">Values (comma-separated)</label>
                          <input
                            type="text"
                            value={opt.values.join(', ')}
                            onChange={(e) => updateOptionValues(idx, e.target.value)}
                            placeholder="e.g., S, M, L"
                            className="input-field"
                          />
                        </div>
                        {options.length > 1 && (
                          <button type="button" className="btn-danger md:col-span-3 w-max" onClick={() => removeOption(idx)}>Remove</button>
                        )}
                      </div>
                    ))}
                  </div>
                  <div className="mt-3">
                    <button type="button" className="btn-primary" onClick={generateVariants}>Generate Variants</button>
                  </div>
                </div>

                {/* Variants Table */}
                <div className="md:col-span-2">
                  <label className="font-medium mb-2 block">Variants</label>
                  {variants.length === 0 ? (
                    <div className="text-gray-500 text-sm">No variants generated yet. Click "Generate Variants".</div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="min-w-full text-sm">
                        <thead>
                          <tr className="text-left text-gray-600">
                            <th className="p-2">SKU</th>
                            <th className="p-2">Price</th>
                            <th className="p-2">Quantity</th>
                            <th className="p-2">Options</th>
                          </tr>
                        </thead>
                        <tbody>
                          {variants.map((v, i) => (
                            <tr key={i} className="border-t">
                              <td className="p-2">
                                <input
                                  type="text"
                                  value={v.sku}
                                  onChange={(e) => updateVariantField(i, 'sku', e.target.value)}
                                  className="input-field"
                                />
                              </td>
                              <td className="p-2">
                                <input
                                  type="number"
                                  min="0"
                                  step="0.01"
                                  value={v.price}
                                  onChange={(e) => updateVariantField(i, 'price', e.target.value)}
                                  className="input-field"
                                />
                              </td>
                              <td className="p-2">
                                <input
                                  type="number"
                                  min="0"
                                  step="1"
                                  value={v.quantity}
                                  onChange={(e) => updateVariantField(i, 'quantity', e.target.value)}
                                  className="input-field"
                                />
                              </td>
                              <td className="p-2 text-gray-700">
                                {Array.isArray(v.options) && v.options.map((o, j) => (
                                  <span key={j} className="inline-block bg-gray-100 rounded px-2 py-1 mr-1 mb-1">{o.name}: {o.value}</span>
                                ))}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </>
            )}
            <div className="flex flex-col gap-1">
              <label className="font-medium">Status</label>
              <select
                name="status"
                value={formData.status}
                onChange={e => setFormData(f => ({ ...f, status: e.target.value }))}
                className="input-field"
              >
                <option value="draft">Draft</option>
                <option value="active">Active</option>
                <option value="archived">Archived</option>
                <option value="out_of_stock">Out of stock</option>
              </select>
            </div>

            {/* Delivery Information */}
            <div className="md:col-span-2">
              <h3 className="text-lg font-semibold mb-3 text-gray-900">Delivery & Shipping</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="freeShipping"
                    checked={formData.freeShipping}
                    onChange={e => setFormData(f => ({ ...f, freeShipping: e.target.checked }))}
                  />
                  <label htmlFor="freeShipping" className="font-medium">Free Shipping</label>
                </div>
                
                <div className="flex flex-col gap-1">
                  <label className="font-medium">Delivery Time</label>
                  <select
                    value={formData.deliveryTime}
                    onChange={e => setFormData(f => ({ ...f, deliveryTime: e.target.value }))}
                    className="input-field"
                  >
                    <option value="same_day">Same Day</option>
                    <option value="next_day">Next Day (24 Hours)</option>
                    <option value="2_3_days">2-3 Days</option>
                    <option value="3_5_days">3-5 Days</option>
                    <option value="5_7_days">5-7 Days</option>
                  </select>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="expressDelivery"
                    checked={formData.expressDelivery}
                    onChange={e => setFormData(f => ({ ...f, expressDelivery: e.target.checked }))}
                  />
                  <label htmlFor="expressDelivery" className="font-medium">Express Delivery Available</label>
                </div>

                {formData.expressDelivery && (
                  <div className="flex flex-col gap-1">
                    <label className="font-medium">Express Delivery Fee</label>
                    <input
                      type="number"
                      value={formData.expressDeliveryFee}
                      onChange={e => setFormData(f => ({ ...f, expressDeliveryFee: e.target.value }))}
                      placeholder="Express delivery fee"
                      className="input-field"
                    />
                  </div>
                )}
              </div>

              {/* Weight and Dimensions */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                <div className="flex flex-col gap-1">
                  <label className="font-medium">Weight</label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      value={formData.weight}
                      onChange={e => setFormData(f => ({ ...f, weight: e.target.value }))}
                      placeholder="Weight"
                      className="input-field flex-1"
                    />
                    <select
                      value={formData.weightUnit}
                      onChange={e => setFormData(f => ({ ...f, weightUnit: e.target.value }))}
                      className="input-field w-20"
                    >
                      <option value="g">g</option>
                      <option value="kg">kg</option>
                      <option value="oz">oz</option>
                      <option value="lb">lb</option>
                    </select>
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="font-medium">Length</label>
                  <input
                    type="number"
                    value={formData.length}
                    onChange={e => setFormData(f => ({ ...f, length: e.target.value }))}
                    placeholder="Length"
                    className="input-field"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="font-medium">Width</label>
                  <input
                    type="number"
                    value={formData.width}
                    onChange={e => setFormData(f => ({ ...f, width: e.target.value }))}
                    placeholder="Width"
                    className="input-field"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="font-medium">Height</label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      value={formData.height}
                      onChange={e => setFormData(f => ({ ...f, height: e.target.value }))}
                      placeholder="Height"
                      className="input-field flex-1"
                    />
                    <select
                      value={formData.dimensionUnit}
                      onChange={e => setFormData(f => ({ ...f, dimensionUnit: e.target.value }))}
                      className="input-field w-20"
                    >
                      <option value="cm">cm</option>
                      <option value="mm">mm</option>
                      <option value="m">m</option>
                      <option value="in">in</option>
                      <option value="ft">ft</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Product Specifications */}
            <div className="md:col-span-2">
              <h3 className="text-lg font-semibold mb-3 text-gray-900">Product Specifications</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="text"
                  value={formData.brand}
                  onChange={e => setFormData(f => ({ ...f, brand: e.target.value }))}
                  placeholder="Brand"
                  className="input-field"
                />
                <input
                  type="text"
                  value={formData.model}
                  onChange={e => setFormData(f => ({ ...f, model: e.target.value }))}
                  placeholder="Model"
                  className="input-field"
                />
                <input
                  type="text"
                  value={formData.material}
                  onChange={e => setFormData(f => ({ ...f, material: e.target.value }))}
                  placeholder="Material"
                  className="input-field"
                />
                <input
                  type="text"
                  value={formData.color}
                  onChange={e => setFormData(f => ({ ...f, color: e.target.value }))}
                  placeholder="Color"
                  className="input-field"
                />
                <input
                  type="text"
                  value={formData.size}
                  onChange={e => setFormData(f => ({ ...f, size: e.target.value }))}
                  placeholder="Size"
                  className="input-field"
                />
                <input
                  type="text"
                  value={formData.warranty}
                  onChange={e => setFormData(f => ({ ...f, warranty: e.target.value }))}
                  placeholder="Warranty"
                  className="input-field"
                />
                <input
                  type="text"
                  value={formData.countryOfOrigin}
                  onChange={e => setFormData(f => ({ ...f, countryOfOrigin: e.target.value }))}
                  placeholder="Country of Origin"
                  className="input-field"
                />
              </div>
            </div>

            {/* SEO and Marketing */}
            <div className="md:col-span-2">
              <h3 className="text-lg font-semibold mb-3 text-gray-900">SEO & Marketing</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="text"
                  value={formData.seoTitle}
                  onChange={e => setFormData(f => ({ ...f, seoTitle: e.target.value }))}
                  placeholder="SEO Title"
                  className="input-field"
                />
                <input
                  type="text"
                  value={formData.seoKeywords}
                  onChange={e => setFormData(f => ({ ...f, seoKeywords: e.target.value }))}
                  placeholder="SEO Keywords (comma-separated)"
                  className="input-field"
                />
                <input
                  type="text"
                  value={formData.tags}
                  onChange={e => setFormData(f => ({ ...f, tags: e.target.value }))}
                  placeholder="Tags (comma-separated)"
                  className="input-field"
                />
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="isFeatured"
                      checked={formData.isFeatured}
                      onChange={e => setFormData(f => ({ ...f, isFeatured: e.target.checked }))}
                    />
                    <label htmlFor="isFeatured" className="font-medium">Featured Product</label>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="isOnSale"
                      checked={formData.isOnSale}
                      onChange={e => setFormData(f => ({ ...f, isOnSale: e.target.checked }))}
                    />
                    <label htmlFor="isOnSale" className="font-medium">On Sale</label>
                  </div>
                </div>
                {formData.isOnSale && (
                  <div className="flex flex-col gap-1">
                    <label className="font-medium">Sale Percentage</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={formData.salePercentage}
                      onChange={e => setFormData(f => ({ ...f, salePercentage: e.target.value }))}
                      placeholder="Sale percentage"
                      className="input-field"
                    />
                  </div>
                )}
              </div>
              <div className="mt-4">
                <label className="font-medium">SEO Description</label>
                <textarea
                  value={formData.seoDescription}
                  onChange={e => setFormData(f => ({ ...f, seoDescription: e.target.value }))}
                  placeholder="SEO Description"
                  className="input-field"
                  rows="3"
                />
              </div>
            </div>
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
                      <img src={getOptimizedImageUrl(preview)} alt={`Preview ${idx + 1}`} className="image-preview w-full h-32" />
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
                <img src={getOptimizedImageUrl(product.images[0])} alt={product.title} className="image-preview" />
              )}
              <div>
                <h2 className="text-lg font-heading font-bold text-secondary mb-1">{product.title}</h2>
                <div className="text-gray-500 text-sm mb-1">{product.category}</div>
                <div className="text-primary font-semibold text-xl mb-1">Ksh {product.price}</div>
                <div className="flex flex-wrap gap-2 text-xs text-gray-400 mb-1">
                  <span>Stock: {product.stock}</span>
                  <span>•</span>
                  <span>Status: {product.status}</span>
                  {product.delivery?.freeShipping && (
                    <>
                      <span>•</span>
                      <span className="text-green-600">Free Shipping</span>
                    </>
                  )}
                  {product.isFeatured && (
                    <>
                      <span>•</span>
                      <span className="text-blue-600">Featured</span>
                    </>
                  )}
                  {product.isOnSale && (
                    <>
                      <span>•</span>
                      <span className="text-red-600">On Sale</span>
                    </>
                  )}
                </div>
                <div className="text-gray-700 text-sm mt-2 line-clamp-2">{product.description}</div>
                {product.specifications?.brand && (
                  <div className="text-xs text-gray-500 mt-1">Brand: {product.specifications.brand}</div>
                )}
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
    </AdminLayout>
  );
};

export default AdminProducts;