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
    price: 0,
    stock: 0,
    category_id: ''
  });


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
      return res.data;
    },
    enabled: !!id,                  
  });

  const addMutation = useMutation({
    mutationFn: async (newProduct) => {
      await api.post('/products/', newProduct);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["products"]); 
      navigate('/dashboard/admin');
    },
    onError: (err) => {
      alert(err.response?.data?.detail || 'Error adding product.');
    }
  });


  const updateMutation = useMutation({
    mutationFn: async (updatedProduct) => {
      await api.put(`/products/${id}`, updatedProduct);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["products"]); 
      queryClient.invalidateQueries(["product", id]);
      navigate('/dashboard/admin');
    },
    onError: (err) => {
      alert(err.response?.data?.detail || 'Error updating product.');
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (id) {
      updateMutation.mutate(form); 
    } else {
      addMutation.mutate(form);  
    }
  };


  const isSaving = addMutation.isPending || updateMutation.isPending;

  if (id && productLoading) return (
    <div className="flex items-center justify-center h-40">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" />
    </div>
  );

  return (
    <div className="bg-white p-6 rounded-xl border border-gray-200 max-w-lg shadow-sm">
      <h2 className="text-lg font-bold text-gray-800 mb-6">
        {id ? 'Edit Product' : 'Add New Product'}
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4">

        {/* Name */}
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Product Name</label>
          <input
            type="text"
            value={form.name}
            onChange={e => setForm({ ...form, name: e.target.value })}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-400 outline-none"
            required
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Description</label>
          <textarea
            value={form.description}
            onChange={e => setForm({ ...form, description: e.target.value })}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-400 outline-none resize-none"
            rows="3"
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          {/* Price */}
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Price ($)</label>
            <input
              type="number"
              step="0.01"
              value={form.price}
              onChange={e => setForm({ ...form, price: parseFloat(e.target.value) })}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-400 outline-none"
              required
            />
          </div>

          {/* Stock */}
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Stock Quantity</label>
            <input
              type="number"
              value={form.stock}
              onChange={e => setForm({ ...form, stock: parseInt(e.target.value) })}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-400 outline-none"
              required
            />
          </div>
        </div>

        {/* Category */}
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Category</label>
          <select
            value={form.category_id}
            onChange={e => setForm({ ...form, category_id: parseInt(e.target.value) })}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-blue-400 outline-none"
            required
          >
            <option value="">Select a category</option>
            {categories.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>

        {/* Buttons */}
        <div className="flex justify-end gap-3 pt-4">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="text-sm border border-gray-200 px-4 py-2 rounded-lg hover:bg-gray-50 transition"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSaving}
            className="bg-blue-600 text-white text-sm px-4 py-2 rounded-lg hover:bg-blue-700 transition font-medium disabled:opacity-50"
          >
            {isSaving ? 'Saving...' : (id ? 'Update Product' : 'Add Product')}
          </button>
        </div>

      </form>
    </div>
  );
};

export default ProductForm;