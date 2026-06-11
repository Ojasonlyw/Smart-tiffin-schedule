// ============ src/pages/Profile.jsx ============
import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { FiUser, FiMail, FiPhone, FiMapPin, FiEdit2 } from 'react-icons/fi';
import { userApi } from '../api/userApi';
import { setUser } from '../redux/slices/authSlice';
import Card from '../components/common/Card';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import Alert from '../components/common/Alert';
import { toast } from 'react-toastify';

const Profile = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    address: {
      street: user?.address?.street || '',
      city: user?.address?.city || '',
      state: user?.address?.state || '',
      pincode: user?.address?.pincode || '',
    },
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith('address.')) {
      const addressField = name.split('.')[1];
      setFormData({
        ...formData,
        address: { ...formData.address, [addressField]: value },
      });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await userApi.updateProfile(formData);
      dispatch(setUser(response.data.user));
      setIsEditing(false);
      toast.success('Profile updated successfully');
    } catch (error) {
      toast.error('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">My Profile</h1>
        <p className="text-lg text-gray-600">Manage your account information</p>
      </div>

      <Card>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold text-gray-900">
            Personal Information
          </h2>
          {!isEditing && (
            <Button
              variant="outline"
              onClick={() => setIsEditing(true)}
            >
              <FiEdit2 className="mr-2" />
              Edit Profile
            </Button>
          )}
        </div>

        {isEditing ? (
          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              <Input
                label="Full Name"
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                icon={FiUser}
                required
              />

              <Input
                label="Phone Number"
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                icon={FiPhone}
              />

              <Input
                label="Street Address"
                type="text"
                name="address.street"
                value={formData.address.street}
                onChange={handleChange}
                icon={FiMapPin}
              />

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Input
                  label="City"
                  type="text"
                  name="address.city"
                  value={formData.address.city}
                  onChange={handleChange}
                />

                <Input
                  label="State"
                  type="text"
                  name="address.state"
                  value={formData.address.state}
                  onChange={handleChange}
                />

                <Input
                  label="Pincode"
                  type="text"
                  name="address.pincode"
                  value={formData.address.pincode}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="flex space-x-4 mt-6">
              <Button type="submit" loading={loading}>
                Save Changes
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsEditing(false)}
              >
                Cancel
              </Button>
            </div>
          </form>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center">
              <FiUser className="h-5 w-5 text-gray-400 mr-3" />
              <div>
                <p className="text-sm text-gray-500">Name</p>
                <p className="text-base font-medium text-gray-900">{user?.name}</p>
              </div>
            </div>

            <div className="flex items-center">
              <FiMail className="h-5 w-5 text-gray-400 mr-3" />
              <div>
                <p className="text-sm text-gray-500">Email</p>
                <p className="text-base font-medium text-gray-900">{user?.email}</p>
              </div>
            </div>

            <div className="flex items-center">
              <FiPhone className="h-5 w-5 text-gray-400 mr-3" />
              <div>
                <p className="text-sm text-gray-500">Phone</p>
                <p className="text-base font-medium text-gray-900">
                  {user?.phone || 'Not provided'}
                </p>
              </div>
            </div>

            <div className="flex items-center">
              <FiMapPin className="h-5 w-5 text-gray-400 mr-3" />
              <div>
                <p className="text-sm text-gray-500">Address</p>
                <p className="text-base font-medium text-gray-900">
                  {user?.address?.street
                    ? `${user.address.street}, ${user.address.city}, ${user.address.state} - ${user.address.pincode}`
                    : 'Not provided'}
                </p>
              </div>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};

export default Profile;