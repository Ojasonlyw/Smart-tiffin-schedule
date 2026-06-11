// ============ src/pages/ProviderDetailsPage.jsx ============
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  FiMapPin,
  FiStar,
  FiDollarSign,
  FiHeart,
  FiMessageSquare,
  FiShare2,
} from "react-icons/fi";
import { fetchProvider } from "../redux/slices/providerSlice";
import { reviewApi } from "../api/reviewApi";
import { userApi } from "../api/userApi";
import Card from "../components/common/Card";
import Button from "../components/common/Button";
import Badge from "../components/common/Badge";
import Loader from "../components/common/Loader";
import Modal from "../components/common/Modal";
import ReviewForm from "../components/review/ReviewForm";
import { formatCurrency } from "../utils/formatters";
import { DAYS_OF_WEEK } from "../utils/constants";
import { toast } from "react-toastify";
import QuickChatButton from "../components/chat/QuickChatButton";
import { FiClock, FiNavigation } from "react-icons/fi";
import locationService from "../services/locationService";
import DistanceBadge from "../components/common/DistanceBadge";

const ProviderDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { currentProvider: provider, loading } = useSelector(
    (state) => state.provider
  );
  const { isAuthenticated, user } = useSelector((state) => state.auth);

  const [reviews, setReviews] = useState([]);
  const [activeTab, setActiveTab] = useState("menu");
  const [showSubscribeModal, setShowSubscribeModal] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    dispatch(fetchProvider(id));
    loadReviews();
  }, [id, dispatch]);

  const loadReviews = async () => {
    try {
      const response = await reviewApi.getProviderReviews(id);
      setReviews(response.data.reviews);
    } catch (error) {
      console.error("Failed to load reviews");
    }
  };

  const handleFavoriteToggle = async () => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    try {
      await userApi.toggleFavorite(id);
      setIsFavorite(!isFavorite);
      toast.success(
        isFavorite ? "Removed from favorites" : "Added to favorites"
      );
    } catch (error) {
      toast.error("Failed to update favorites");
    }
  };

  const handleChatClick = () => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    navigate("/chat", { state: { providerId: id } });
  };

  const handleSubscribe = () => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    setShowSubscribeModal(true);
  };

  if (loading) return <Loader fullScreen />;
  if (!provider)
    return <div className="text-center py-12">Provider not found</div>;

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Hero Section */}
      <div className="relative h-96 bg-gradient-to-r from-primary-600 to-secondary-600">
        <img
          src={provider.coverImage || "https://via.placeholder.com/1200x400"}
          alt={provider.businessName}
          className="w-full h-full object-cover opacity-30"
        />
        <div className="absolute inset-0 flex items-end">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8 w-full">
            <div className="bg-white rounded-lg shadow-xl p-6 -mb-16">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                <div className="flex-1">
                  <h1 className="text-4xl font-bold text-gray-900 mb-2">
                    {provider.businessName}
                  </h1>
                  <div className="flex items-center text-gray-600 mb-3">
                    <FiMapPin className="h-5 w-5 mr-2" />
                    <span>
                      {provider.address.street}, {provider.address.city},{" "}
                      {provider.address.state}
                    </span>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center">
                      <FiStar className="h-5 w-5 text-yellow-500 mr-1" />
                      <span className="font-semibold text-gray-900">
                        {provider.ratings.average.toFixed(1)}
                      </span>
                      <span className="text-gray-500 ml-1">
                        ({provider.ratings.count} reviews)
                      </span>
                    </div>
                    <div className="text-gray-600">
                      {provider.totalSubscribers} subscribers
                    </div>
                  </div>
                </div>

                <div className="flex space-x-3 mt-4 md:mt-0 items-center">
                  <Button variant="outline" onClick={handleFavoriteToggle}>
                    <FiHeart
                      className={`mr-2 ${
                        isFavorite ? "fill-current text-red-500" : ""
                      }`}
                    />
                    Favorite
                  </Button>

                  <QuickChatButton
                    providerId={provider._id}
                    providerName={provider.businessName}
                  />

                  <Button onClick={handleSubscribe}>Subscribe Now</Button>
                </div>
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-2 mt-4">
                {provider.cuisines.map((cuisine, index) => (
                  <Badge key={index} variant="primary">
                    {cuisine}
                  </Badge>
                ))}
                {provider.specialties.map((specialty, index) => (
                  <Badge key={index} variant="success">
                    {specialty}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        {/* Tabs */}
        <div className="border-b border-gray-200 mb-8">
          <div className="flex space-x-8">
            {["menu", "weekly", "pricing", "reviews", "about"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`pb-4 px-2 font-medium capitalize transition-colors ${
                  activeTab === tab
                    ? "border-b-2 border-primary-600 text-primary-600"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === "menu" && <MenuTab provider={provider} />}
        {activeTab === "weekly" && <WeeklyMenuTab provider={provider} />}
        {activeTab === "pricing" && <PricingTab provider={provider} />}
        {activeTab === "reviews" && (
          <ReviewsTab
            reviews={reviews}
            providerId={id}
            onReviewAdded={loadReviews}
          />
        )}
        {activeTab === "about" && <AboutTab provider={provider} />}
      </div>

      {/* Subscribe Modal */}
      <SubscribeModal
        isOpen={showSubscribeModal}
        onClose={() => setShowSubscribeModal(false)}
        provider={provider}
      />
    </div>
  );
};

// Menu Tab Component
const MenuTab = ({ provider }) => (
  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
    {["breakfast", "lunch", "dinner"].map((mealType) => (
      <Card key={mealType}>
        <h3 className="text-2xl font-semibold text-gray-900 mb-4 capitalize flex items-center">
          <FiClock className="mr-2 text-primary-600" />
          {mealType}
        </h3>
        <div className="space-y-3">
          {provider.menu[mealType]?.length > 0 ? (
            provider.menu[mealType].map((item, index) => (
              <div
                key={index}
                className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0"
              >
                <div>
                  <p className="font-medium text-gray-900">{item.name}</p>
                  {item.description && (
                    <p className="text-sm text-gray-500">{item.description}</p>
                  )}
                </div>
                <span className="text-primary-600 font-semibold">
                  {formatCurrency(item.price)}
                </span>
              </div>
            ))
          ) : (
            <p className="text-gray-500">No items available</p>
          )}
        </div>
      </Card>
    ))}
  </div>
);

// Weekly Menu Tab
const WeeklyMenuTab = ({ provider }) => (
  <Card>
    <h3 className="text-2xl font-semibold text-gray-900 mb-6">
      This Week's Menu
    </h3>
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead>
          <tr>
            <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase">
              Day
            </th>
            <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase">
              Breakfast
            </th>
            <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase">
              Lunch
            </th>
            <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase">
              Dinner
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {provider.weeklyMenu?.length > 0 ? (
            provider.weeklyMenu.map((dayMenu, index) => (
              <tr key={index}>
                <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">
                  {dayMenu.day}
                </td>
                <td className="px-6 py-4 text-gray-600">
                  {dayMenu.meals.breakfast}
                </td>
                <td className="px-6 py-4 text-gray-600">
                  {dayMenu.meals.lunch}
                </td>
                <td className="px-6 py-4 text-gray-600">
                  {dayMenu.meals.dinner}
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="4" className="px-6 py-4 text-center text-gray-500">
                Weekly menu not available
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  </Card>
);

// Pricing Tab
const PricingTab = ({ provider }) => (
  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
    {["daily", "weekly", "monthly"].map((planType) => (
      <Card
        key={planType}
        className="border-2 border-gray-200 hover:border-primary-600 transition-colors"
      >
        <h3 className="text-2xl font-bold text-gray-900 mb-2 capitalize">
          {planType} Plan
        </h3>
        <div className="space-y-4 mb-6">
          {["breakfast", "lunch", "dinner", "fullDay"].map((mealType) => (
            <div key={mealType} className="flex justify-between items-center">
              <span className="text-gray-600 capitalize">
                {mealType === "fullDay" ? "Full Day" : mealType}
              </span>
              <span className="text-xl font-bold text-primary-600">
                {provider.pricing[planType]?.[mealType]
                  ? formatCurrency(provider.pricing[planType][mealType])
                  : "N/A"}
              </span>
            </div>
          ))}
        </div>
        <Button fullWidth>Choose Plan</Button>
      </Card>
    ))}
  </div>
);

// Reviews Tab
const ReviewsTab = ({ reviews, providerId, onReviewAdded }) => {
  const { isAuthenticated } = useSelector((state) => state.auth);
  const [showReviewForm, setShowReviewForm] = useState(false);

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-2xl font-semibold text-gray-900">
          Customer Reviews
        </h3>
        {isAuthenticated && (
          <Button onClick={() => setShowReviewForm(true)}>
            Write a Review
          </Button>
        )}
      </div>

      <div className="space-y-4">
        {reviews.length > 0 ? (
          reviews.map((review) => (
            <Card key={review._id}>
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <div className="h-12 w-12 rounded-full bg-primary-100 flex items-center justify-center">
                    <span className="text-primary-600 font-semibold">
                      {review.user.name.charAt(0)}
                    </span>
                  </div>
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold text-gray-900">
                      {review.user.name}
                    </h4>
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <FiStar
                          key={i}
                          className={`h-4 w-4 ${
                            i < review.rating
                              ? "text-yellow-500 fill-current"
                              : "text-gray-300"
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                  <p className="text-gray-600 mt-2">{review.comment}</p>
                  {review.isVerifiedPurchase && (
                    <Badge variant="success" size="sm" className="mt-2">
                      Verified Purchase
                    </Badge>
                  )}
                </div>
              </div>
            </Card>
          ))
        ) : (
          <p className="text-center text-gray-500 py-8">
            No reviews yet. Be the first to review!
          </p>
        )}
      </div>
    </div>
  );
};

// ============ Enhanced About Tab with Location Info ============
const AboutTab = ({ provider }) => {
  const [mapUrl, setMapUrl] = useState('');

  useEffect(() => {
    if (provider.address?.coordinates?.lat && provider.address?.coordinates?.lng) {
      const { lat, lng } = provider.address.coordinates;
      const apiKey = process.env.REACT_APP_GOOGLE_MAPS_KEY;
      if (apiKey) {
        setMapUrl(
          `https://maps.googleapis.com/maps/api/staticmap?center=${lat},${lng}&zoom=15&size=600x300&markers=color:red%7C${lat},${lng}&key=${apiKey}`
        );
      }
    }
  }, [provider]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2">
        <Card>
          <h3 className="text-2xl font-semibold text-gray-900 mb-4">About Us</h3>
          <p className="text-gray-600 leading-relaxed">
            {provider.description || "No description available."}
          </p>

          <div className="mt-6">
            <h4 className="font-semibold text-gray-900 mb-3">Timings</h4>
            <div className="space-y-2">
              {["breakfast", "lunch", "dinner"].map((meal) => (
                <div key={meal} className="flex justify-between items-center">
                  <span className="text-gray-600 capitalize">{meal}</span>
                  <span className="text-gray-900">
                    {provider.timings?.[meal]?.from} -{" "}
                    {provider.timings?.[meal]?.to}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Location Map */}
          {mapUrl && (
            <div className="mt-6">
              <h4 className="font-semibold text-gray-900 mb-3">Location Map</h4>
              <div className="rounded-lg overflow-hidden border border-gray-200">
                <img src={mapUrl} alt="Provider Location" className="w-full" />
              </div>
            </div>
          )}
        </Card>
      </div>

      <div>
        {/* Contact Information */}
        <Card className="mb-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">
            Contact Information
          </h3>
          <div className="space-y-3">
            <div>
              <p className="text-sm text-gray-500">Phone</p>
              <a href={`tel:${provider.phone}`} className="text-gray-900 hover:text-primary-600">
                {provider.phone}
              </a>
            </div>
            <div>
              <p className="text-sm text-gray-500">Email</p>
              <a href={`mailto:${provider.email}`} className="text-gray-900 hover:text-primary-600">
                {provider.email}
              </a>
            </div>
            <div>
              <p className="text-sm text-gray-500">Address</p>
              <p className="text-gray-900">
                {provider.address.street}
                <br />
                {provider.address.city}, {provider.address.state}
                <br />
                {provider.address.pincode}
              </p>
            </div>
          </div>

          {/* Distance Information */}
          {provider.address?.coordinates?.lat && provider.address?.coordinates?.lng && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <DistanceBadge
                providerLat={provider.address.coordinates.lat}
                providerLng={provider.address.coordinates.lng}
                showTravelTime={true}
                size="md"
                className="w-full justify-center"
              />
            </div>
          )}

          {/* Map Buttons */}
          <div className="mt-4 space-y-2">
            {provider.address?.coordinates?.lat && provider.address?.coordinates?.lng && (
              <>
                <Button 
                  fullWidth 
                  variant="outline"
                  onClick={() => {
                    const { lat, lng } = provider.address.coordinates;
                    window.open(`https://www.google.com/maps/search/?api=1&query=${lat},${lng}`, '_blank');
                  }}
                >
                  <FiMapPin className="mr-2" />
                  Open in Google Maps
                </Button>
                
                <Button 
                  fullWidth 
                  variant="outline"
                  onClick={() => {
                    const { lat, lng } = provider.address.coordinates;
                    window.open(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`, '_blank');
                  }}
                >
                  <FiNavigation className="mr-2" />
                  Get Directions
                </Button>
              </>
            )}
          </div>
        </Card>

        {/* Delivery Area Info */}
        <Card>
          <h3 className="text-xl font-semibold text-gray-900 mb-4">
            Delivery Information
          </h3>
          <div className="space-y-3">
            <div className="flex items-start space-x-2">
              <FiMapPin className="h-5 w-5 text-primary-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-gray-900">Service Area</p>
                <p className="text-sm text-gray-600">
                  Delivering within {provider.address.city} and nearby areas
                </p>
              </div>
            </div>
            
            <div className="flex items-start space-x-2">
              <FiClock className="h-5 w-5 text-primary-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-gray-900">Delivery Times</p>
                <p className="text-sm text-gray-600">
                  Check timings above for each meal
                </p>
              </div>
            </div>

            {locationService.hasUserLocation() && (
              <div className="mt-4 p-3 bg-green-50 rounded-lg border border-green-200">
                <p className="text-sm text-green-800">
                  ✓ This provider delivers to your location
                </p>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};


// Subscribe Modal Component
const SubscribeModal = ({ isOpen, onClose, provider }) => {
  const navigate = useNavigate();
  const [selectedPlan, setSelectedPlan] = useState("weekly");
  const [selectedMeal, setSelectedMeal] = useState("fullDay");

  const handleSubscribe = () => {
    navigate("/subscriptions/new", {
      state: {
        provider: provider._id,
        planType: selectedPlan,
        mealType: selectedMeal,
      },
    });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Choose Your Plan">
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Plan Type
          </label>
          <div className="grid grid-cols-3 gap-3">
            {["daily", "weekly", "monthly"].map((plan) => (
              <button
                key={plan}
                onClick={() => setSelectedPlan(plan)}
                className={`px-4 py-3 rounded-lg border-2 font-medium capitalize transition-colors ${
                  selectedPlan === plan
                    ? "border-primary-600 bg-primary-50 text-primary-600"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                {plan}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Meal Type
          </label>
          <div className="grid grid-cols-2 gap-3">
            {["breakfast", "lunch", "dinner", "fullDay"].map((meal) => (
              <button
                key={meal}
                onClick={() => setSelectedMeal(meal)}
                className={`px-4 py-3 rounded-lg border-2 font-medium capitalize transition-colors ${
                  selectedMeal === meal
                    ? "border-primary-600 bg-primary-50 text-primary-600"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                {meal === "fullDay" ? "Full Day" : meal}
              </button>
            ))}
          </div>
        </div>

        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-gray-600">Total Amount</span>
            <span className="text-2xl font-bold text-primary-600">
              {formatCurrency(
                provider.pricing[selectedPlan]?.[selectedMeal] || 0
              )}
            </span>
          </div>
          <p className="text-sm text-gray-500">per {selectedPlan}</p>
        </div>

        <div className="flex space-x-3">
          <Button fullWidth variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button fullWidth onClick={handleSubscribe}>
            Continue
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default ProviderDetailsPage;
