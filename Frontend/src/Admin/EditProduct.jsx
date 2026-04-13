import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

const EditProduct = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: form, isLoading: productLoading } = useQuery({
    queryKey: ["product", id],   
    queryFn: async () => {
      const res = await api.get(`/products/${id}`);
      return res.data;
    },
  });

  const { data: categories = [] } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const res = await api.get('/products/categories');
      return res.data;
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (updatedForm) => {
      await api.put(`/products/${id}`, updatedForm);
    },
    onSuccess: () => {
     
      queryClient.invalidateQueries(["products"]);
      setTimeout(() => navigate('/dashboard/admin'), 1000);
    },
    onError: (err) => {
      console.error(err.response?.data?.detail || 'Error updating product');
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    updateMutation.mutate(form); 
  };

  const handleCancel = () => navigate('/dashboard/admin');


  if (productLoading) return (
    <div className="flex items-center justify-center h-screen">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" />
    </div>
  );

  return (
    <div className="p-6 max-w-lg mx-auto">
      <button
        onClick={handleCancel}
        className="mb-4 text-sm text-gray-500 hover:text-gray-700 transition"
      >
        ← Back
      </button>

      <h2 className="text-lg font-semibold mb-4 text-gray-800">Edit Product</h2>

   
      {updateMutation.isSuccess && (
        <div className="mb-4 text-sm bg-green-50 border border-green-200 text-green-700 px-4 py-2 rounded-lg">
          Product updated successfully.
        </div>
      )}

      {updateMutation.isError && (
        <div className="mb-4 text-sm bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded-lg">
          {updateMutation.error?.response?.data?.detail || 'Error updating product.'}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4 bg-white rounded-xl border border-gray-200 p-6">
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Product Name</label>
          <input
            type="text"
            value={form.name}
            onChange={e => queryClient.setQueryData(["product", id], { ...form, name: e.target.value })}
            placeholder="e.g. Wireless Mouse"
            required
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Description</label>
          <textarea
            value={form.description}
            onChange={e => queryClient.setQueryData(["product", id], { ...form, description: e.target.value })}
            placeholder="Short product description"
            rows={3}
            required
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Price ($)</label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={form.price}
              onChange={e => queryClient.setQueryData(["product", id], { ...form, price: parseFloat(e.target.value) })}
              required
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Stock Quantity</label>
            <input
              type="number"
              min="0"
              value={form.stock}
              onChange={e => queryClient.setQueryData(["product", id], { ...form, stock: parseInt(e.target.value) })}
              required
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Category</label>
          <select
            value={form.category_id}
            onChange={e => queryClient.setQueryData(["product", id], { ...form, category_id: parseInt(e.target.value) })}
            required
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            <option value="">Select a category</option>
            {categories.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={handleCancel}
            className="text-sm border border-gray-200 px-4 py-2 rounded-lg hover:bg-gray-50 transition"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={updateMutation.isPending}
            className="text-sm bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition font-medium disabled:opacity-50"
          >
            {updateMutation.isPending ? 'Saving...' : 'Update Product'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditProduct;