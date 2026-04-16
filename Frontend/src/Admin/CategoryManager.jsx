import React, { useState,useEffect } from 'react';
import api from '../services/api';
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

const CategoryManager = () => {
  const [catForm, setCatForm] = useState({ name: '' });
  const [msg, setMsg] = useState('');
  const queryClient = useQueryClient();

  const { data: categories, isLoading } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const res = await api.get('/products/categories');
      return res.data;
    },
  });

  const addCategoryMutation = useMutation({
    mutationFn: async (newCategory) => {
      await api.post('/products/categories', newCategory);
    },
    onSuccess: (_, variables) => {
      setMsg(`Category "${variables.name}" created successfully.`);
      setCatForm({ name: '' });

      queryClient.invalidateQueries(["categories"]);
    },
    onError: (err) => {
      setMsg(err.response?.data?.detail || 'Error creating category.');
    }
  });


  const deleteCategoryMutation = useMutation({
    mutationFn: async ({ id }) => {
      await api.delete(`/products/categories/${id}`);
    },
    onSuccess: (_, variables) => {
      setMsg(`Category "${variables.name}" deleted.`);


      queryClient.invalidateQueries(["categories"]);
    },
    onError: (err) => {
      setMsg(err.response?.data?.detail || 'Error deleting category.');
    }
  });

  const handleAddCategory = (e) => {
    e.preventDefault();
    addCategoryMutation.mutate(catForm);
  };

  const handleDeleteCategory = (id, name) => {
    if (!window.confirm(`Delete category "${name}"?`)) return;
    deleteCategoryMutation.mutate({ id, name });
  };

  useEffect(() => {
    if (msg) {
      const timer = setTimeout(() => setMsg(''), 3000);
      return () => clearTimeout(timer);
    }
  }, [msg]);

  if (isLoading)
    return <div className="text-sm text-gray-400">Loading categories...</div>;

  return (
    <div className="space-y-6">
      {msg && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-2 rounded-lg text-sm flex justify-between items-center shadow-sm">
          <span>{msg}</span>
          <button onClick={() => setMsg('')} className="text-green-400 hover:text-green-600">✕</button>
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-200 p-5 max-w-lg">
        <h2 className="text-sm font-semibold text-gray-700 mb-4">Add new category</h2>
        <form onSubmit={handleAddCategory} className="flex gap-3">
          <input
            type="text"
            required
            placeholder="e.g. Accessories"
            value={catForm.name}
            onChange={e => setCatForm({ name: e.target.value })}
            className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm"
          />
          <button className="bg-blue-600 text-white text-sm px-4 py-2 rounded-lg">
            + Add category
          </button>
        </form>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden max-w-lg">
        <div className="px-5 py-4 border-b border-gray-100">
          <h2 className="text-sm font-semibold text-gray-700">All categories</h2>
        </div>

        {categories.length === 0 ? (
          <div className="px-5 py-12 text-center text-sm text-gray-400">
            No categories yet.
          </div>
        ) : (
          <table className="w-full text-sm">
            <tbody>
              {categories.map(c => (
                <tr key={c.id} className="border-t border-gray-100">
                  <td className="px-5 py-3 text-gray-400">#{c.id}</td>
                  <td className="px-5 py-3">{c.name}</td>
                  <td className="px-5 py-3 text-right">
                    <button
                      onClick={() => handleDeleteCategory(c.id, c.name)}
                      className="text-xs border border-red-100 text-red-600 px-3 py-1 rounded-lg"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default CategoryManager;