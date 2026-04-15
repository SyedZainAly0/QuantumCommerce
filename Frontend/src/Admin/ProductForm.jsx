import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

const ProductForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [form, setForm] = useState({
    name: '',
    description: '',
    price: '',
    stock: '',
    category_id: ''
  });

  const [imageFile, setImageFile] = useState(null);          // new image file
  const [imagePreview, setImagePreview] = useState(null);    // preview URL
  const [errors, setErrors] = useState({});

  const validateField = (name, value) => {
    let error = '';
    if (name === 'name' && (!value || value.trim().length < 3))
      error = 'Name must be at least 3 characters';
    if (name === 'description' && (!value || value.trim().length < 20))
      error = 'Description must be at least 20 characters';
    if (name === 'price' && (!value || parseFloat(value) <= 0))
      error = 'Price must be greater than 0';
    if (name === 'stock' && (!value || parseInt(value) <= 0))
      error = 'Stock must be greater than 0';
    if (name === 'category_id' && !value)
      error = 'Please select a category';
    return error;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    setErrors(prev => ({ ...prev, [name]: validateField(name, value) }));
  };

  // Handle image file selection
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file)); // show local preview instantly
  };

  const { data: categories = [] } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const res = await api.get('/products/categories');
      return res.data;
    },
  });

  const { isLoading: productLoading } = useQuery({
    queryKey: ["product", id],
    queryFn: async () => {
      const res = await api.get(`/products/${id}`);
      setForm(res.data);
      // Show existing image as preview when editing
      if (res.data.image) {
        setImagePreview(`http://localhost:8000${res.data.image}`);
      }
      return res.data;
    },
    enabled: !!id,
  });

  // Build FormData for both add and update
  const buildFormData = () => {
    const formData = new FormData();
    formData.append('name', form.name);
    formData.append('description', form.description);
    formData.append('price', parseFloat(form.price));
    formData.append('stock', parseInt(form.stock));
    if (form.category_id) formData.append('category_id', form.category_id);
    if (imageFile) formData.append('image', imageFile); // only append if selected
    return formData;
  };

  const addMutation = useMutation({
    mutationFn: async () => {
      await api.post('/products/', buildFormData(), {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["products"]);
      navigate('/dashboard/admin');
    }
  });

  const updateMutation = useMutation({
    mutationFn: async () => {
      await api.put(`/products/${id}`, buildFormData(), {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["products"]);
      navigate('/dashboard/admin');
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    id ? updateMutation.mutate() : addMutation.mutate();
  };

  const isSaving = addMutation.isPending || updateMutation.isPending;
  const hasErrors = Object.values(errors).some(e => e);

  if (id && productLoading) {
    return (
      <div className="flex justify-center items-center h-40">
        <div className="h-10 w-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-xl bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
        <h2 className="text-2xl font-semibold text-gray-800 mb-6">
          {id ? 'Edit Product' : 'Add New Product'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-5">

          {/* Name */}
          <div>
            <label className="text-sm font-medium text-gray-600">Product Name</label>
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Enter product name"
              className={`mt-1 w-full px-4 py-2 border rounded-lg text-sm outline-none transition
                ${errors.name ? 'border-red-400 focus:ring-red-200' : 'border-gray-200 focus:ring-2 focus:ring-blue-400'}`}
            />
            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
          </div>

          {/* Description */}
          <div>
            <label className="text-sm font-medium text-gray-600">Description</label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="Enter description"
              rows="3"
              className={`mt-1 w-full px-4 py-2 border rounded-lg text-sm outline-none transition resize-none
                ${errors.description ? 'border-red-400 focus:ring-red-200' : 'border-gray-200 focus:ring-2 focus:ring-blue-400'}`}
            />
            {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description}</p>}
          </div>

          {/* Price & Stock */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-600">Price ($)</label>
              <input
                type="number"
                name="price"
                min="1"
                value={form.price}
                onChange={handleChange}
                className={`mt-1 w-full px-4 py-2 border rounded-lg text-sm outline-none transition
                  ${errors.price ? 'border-red-400 focus:ring-red-200' : 'border-gray-200 focus:ring-2 focus:ring-blue-400'}`}
              />
              {errors.price && <p className="text-red-500 text-xs mt-1">{errors.price}</p>}
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">Stock</label>
              <input
                type="number"
                name="stock"
                min="1"
                value={form.stock}
                onChange={handleChange}
                className={`mt-1 w-full px-4 py-2 border rounded-lg text-sm outline-none transition
                  ${errors.stock ? 'border-red-400 focus:ring-red-200' : 'border-gray-200 focus:ring-2 focus:ring-blue-400'}`}
              />
              {errors.stock && <p className="text-red-500 text-xs mt-1">{errors.stock}</p>}
            </div>
          </div>

          {/* Category */}
          <div>
            <label className="text-sm font-medium text-gray-600">Category</label>
            <select
              name="category_id"
              value={form.category_id}
              onChange={handleChange}
              className={`mt-1 w-full px-4 py-2 border rounded-lg text-sm outline-none transition bg-white
                ${errors.category_id ? 'border-red-400 focus:ring-red-200' : 'border-gray-200 focus:ring-2 focus:ring-blue-400'}`}
            >
              <option value="">Select category</option>
              {categories.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
            {errors.category_id && <p className="text-red-500 text-xs mt-1">{errors.category_id}</p>}
          </div>

          {/* Image Upload */}
          <div>
            <label className="text-sm font-medium text-gray-600">Product Image</label>

            {/* Preview */}
            {imagePreview && (
              <div className="mt-2 mb-2">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="h-32 w-32 object-cover rounded-lg border border-gray-200"
                />
              </div>
            )}

            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="mt-1 w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4
                file:rounded-lg file:border-0 file:text-sm file:font-medium
                file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 transition"
            />
            {id && !imageFile && (
              <p className="text-xs text-gray-400 mt-1">Leave empty to keep existing image</p>
            )}
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="px-4 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-100 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving || hasErrors}
              className="px-5 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
            >
              {isSaving ? 'Saving...' : 'Submit'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};

export default ProductForm;