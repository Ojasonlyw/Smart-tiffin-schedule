// ============ src/pages/MealPlannerPage.jsx ============
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { FiPlus, FiTrash2, FiSave, FiCalendar } from 'react-icons/fi';
import { fetchMealPlans, createMealPlan, updateMealPlan } from '../redux/slices/mealPlanSlice';
import { fetchProviders } from '../redux/slices/providerSlice';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Modal from '../components/common/Modal';
import { DAYS_OF_WEEK } from '../utils/constants';
import { toast } from 'react-toastify';

const MealPlannerPage = () => {
  const dispatch = useDispatch();
  const { mealPlans } = useSelector((state) => state.mealPlan);
  const { providers } = useSelector((state) => state.provider);

  const [currentWeek, setCurrentWeek] = useState(getWeekDates());
  const [weekPlan, setWeekPlan] = useState(initializeWeekPlan());
  const [showMealModal, setShowMealModal] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [planName, setPlanName] = useState('');

  useEffect(() => {
    dispatch(fetchMealPlans());
    dispatch(fetchProviders({ limit: 50 }));
  }, [dispatch]);

  function getWeekDates() {
    const today = new Date();
    const dayOfWeek = today.getDay();
    const monday = new Date(today);
    monday.setDate(today.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
    
    return Array.from({ length: 7 }, (_, i) => {
      const date = new Date(monday);
      date.setDate(monday.getDate() + i);
      return date;
    });
  }

  function initializeWeekPlan() {
    return DAYS_OF_WEEK.map((day, index) => ({
      day,
      date: currentWeek[index],
      breakfast: null,
      lunch: null,
      dinner: null,
    }));
  }

  const handleAddMeal = (dayIndex, mealType) => {
    setSelectedSlot({ dayIndex, mealType });
    setShowMealModal(true);
  };

  const handleSelectMeal = (provider, mealName) => {
    const { dayIndex, mealType } = selectedSlot;
    const updatedPlan = [...weekPlan];
    updatedPlan[dayIndex][mealType] = {
      name: mealName,
      provider: provider._id,
      providerName: provider.businessName,
    };
    setWeekPlan(updatedPlan);
    setShowMealModal(false);
    toast.success('Meal added to plan');
  };

  const handleRemoveMeal = (dayIndex, mealType) => {
    const updatedPlan = [...weekPlan];
    updatedPlan[dayIndex][mealType] = null;
    setWeekPlan(updatedPlan);
    toast.success('Meal removed');
  };

  const handleSavePlan = async () => {
    if (!planName.trim()) {
      toast.error('Please enter a plan name');
      return;
    }

    const planData = {
      planName,
      weekStartDate: currentWeek[0],
      meals: weekPlan,
    };

    try {
      await dispatch(createMealPlan(planData));
      toast.success('Meal plan saved successfully!');
      setPlanName('');
      setWeekPlan(initializeWeekPlan());
    } catch (error) {
      toast.error('Failed to save meal plan');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Weekly Meal Planner</h1>
        <p className="text-lg text-gray-600">Plan your meals for the week ahead</p>
      </div>

      {/* Plan Name Input */}
      <Card className="mb-6">
        <div className="flex items-center space-x-4">
          <input
            type="text"
            value={planName}
            onChange={(e) => setPlanName(e.target.value)}
            placeholder="Enter plan name (e.g., Week of Dec 10)"
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
          <Button onClick={handleSavePlan}>
            <FiSave className="mr-2" />
            Save Plan
          </Button>
        </div>
      </Card>

      {/* Weekly Calendar */}
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Day
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Breakfast
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Lunch
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Dinner
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {weekPlan.map((day, dayIndex) => (
                <tr key={dayIndex} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{day.day}</div>
                      <div className="text-sm text-gray-500">
                        {day.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </div>
                    </div>
                  </td>
                  {['breakfast', 'lunch', 'dinner'].map((mealType) => (
                    <td key={mealType} className="px-6 py-4">
                      {day[mealType] ? (
                        <div className="flex items-center justify-between bg-primary-50 rounded-lg p-3">
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {day[mealType].name}
                            </p>
                            <p className="text-xs text-gray-500">
                              {day[mealType].providerName}
                            </p>
                          </div>
                          <button
                            onClick={() => handleRemoveMeal(dayIndex, mealType)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <FiTrash2 className="h-4 w-4" />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleAddMeal(dayIndex, mealType)}
                          className="w-full px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-400 hover:border-primary-500 hover:text-primary-500 transition-colors"
                        >
                          <FiPlus className="mx-auto h-5 w-5" />
                        </button>
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Previous Plans */}
      <div className="mt-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Previous Plans</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {mealPlans.map((plan) => (
            <Card key={plan._id} hover>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">{plan.planName}</h3>
                <FiCalendar className="h-5 w-5 text-gray-400" />
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Meals:</span>
                  <span className="font-medium">{plan.totalMealsPlanned}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Completed:</span>
                  <span className="font-medium">{plan.totalMealsCompleted}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Week Start:</span>
                  <span className="font-medium">
                    {new Date(plan.weekStartDate).toLocaleDateString()}
                  </span>
                </div>
              </div>
              <Button fullWidth variant="outline" className="mt-4">
                View Details
              </Button>
            </Card>
          ))}
        </div>
      </div>

      {/* Add Meal Modal */}
      <MealSelectionModal
        isOpen={showMealModal}
        onClose={() => setShowMealModal(false)}
        providers={providers}
        onSelectMeal={handleSelectMeal}
      />
    </div>
  );
};

// Meal Selection Modal
const MealSelectionModal = ({ isOpen, onClose, providers, onSelectMeal }) => {
  const [selectedProvider, setSelectedProvider] = useState(null);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Select Meal" size="lg">
      <div className="space-y-4">
        {/* Provider Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Choose Provider
          </label>
          <select
            value={selectedProvider?._id || ''}
            onChange={(e) => {
              const provider = providers.find((p) => p._id === e.target.value);
              setSelectedProvider(provider);
            }}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="">Select a provider</option>
            {providers.map((provider) => (
              <option key={provider._id} value={provider._id}>
                {provider.businessName}
              </option>
            ))}
          </select>
        </div>

        {/* Meal Selection */}
        {selectedProvider && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Meal
            </label>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {selectedProvider.menu.breakfast?.map((meal, index) => (
                <button
                  key={index}
                  onClick={() => onSelectMeal(selectedProvider, meal.name)}
                  className="w-full p-3 text-left border border-gray-200 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-colors"
                >
                  <div className="flex justify-between items-center">
                    <span className="font-medium">{meal.name}</span>
                    <span className="text-primary-600">₹{meal.price}</span>
                  </div>
                  {meal.description && (
                    <p className="text-sm text-gray-500 mt-1">{meal.description}</p>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default MealPlannerPage;

