// ============ src/pages/MenuManagementPage.jsx ============
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiPlus, FiTrash2, FiSave } from 'react-icons/fi';
import { providerApi } from '../api/providerApi';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import { toast } from 'react-toastify';

const MenuManagementPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [menu, setMenu] = useState({
    breakfast: [],
    lunch: [],
    dinner: [],
  });

  useEffect(() => {
    loadMenu();
  }, [id]);

  const loadMenu = async () => {
    try {
      const response = await providerApi.getProvider(id);
      setMenu(response.data.provider.menu || { breakfast: [], lunch: [], dinner: [] });
    } catch (error) {
      toast.error('Failed to load menu');
    }
  };

  const addMenuItem = (mealType) => {
    setMenu({
      ...menu,
      [mealType]: [
        ...menu[mealType],
        { name: '', description: '', price: 0, isAvailable: true },
      ],
    });
  };

  const removeMenuItem = (mealType, index) => {
    const updatedMenu = { ...menu };
    updatedMenu[mealType].splice(index, 1);
    setMenu(updatedMenu);
  };

  const updateMenuItem = (mealType, index, field, value) => {
    const updatedMenu = { ...menu };
    updatedMenu[mealType][index][field] = value;
    setMenu(updatedMenu);
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      await providerApi.updateMenu(id, { menu });
      toast.success('Menu updated successfully!');
      navigate('/provider-dashboard');
    } catch (error) {
      toast.error('Failed to update menu');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Menu Management</h1>
          <p className="text-lg text-gray-600">Add and manage your menu items</p>
        </div>
        <div className="flex space-x-3">
          <Button variant="outline" onClick={() => navigate('/provider-dashboard')}>
            Cancel
          </Button>
          <Button onClick={handleSave} loading={loading}>
            <FiSave className="mr-2" />
            Save Menu
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {['breakfast', 'lunch', 'dinner'].map((mealType) => (
          <Card key={mealType}>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-semibold text-gray-900 capitalize">
                {mealType}
              </h2>
              <Button size="sm" onClick={() => addMenuItem(mealType)}>
                <FiPlus className="mr-1" />
                Add Item
              </Button>
            </div>

            <div className="space-y-4">
              {menu[mealType].length > 0 ? (
                menu[mealType].map((item, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4">
                    <Input
                      label="Item Name"
                      type="text"
                      value={item.name}
                      onChange={(e) =>
                        updateMenuItem(mealType, index, 'name', e.target.value)
                      }
                      placeholder="e.g., Poha"
                      required
                    />

                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Description
                      </label>
                      <textarea
                        value={item.description}
                        onChange={(e) =>
                          updateMenuItem(mealType, index, 'description', e.target.value)
                        }
                        placeholder="Brief description..."
                        rows="2"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex-1 mr-2">
                        <Input
                          label="Price (₹)"
                          type="number"
                          value={item.price}
                          onChange={(e) =>
                            updateMenuItem(mealType, index, 'price', parseFloat(e.target.value))
                          }
                          placeholder="50"
                          required
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => removeMenuItem(mealType, index)}
                        className="mt-6 p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <FiTrash2 className="h-5 w-5" />
                      </button>
                    </div>

                    <label className="flex items-center mt-2">
                      <input
                        type="checkbox"
                        checked={item.isAvailable}
                        onChange={(e) =>
                          updateMenuItem(mealType, index, 'isAvailable', e.target.checked)
                        }
                        className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                      />
                      <span className="ml-2 text-sm text-gray-700">Available</span>
                    </label>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <p>No items added yet</p>
                  <p className="text-sm mt-1">Click "Add Item" to get started</p>
                </div>
              )}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default MenuManagementPage;