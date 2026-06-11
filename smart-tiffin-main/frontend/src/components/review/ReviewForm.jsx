// ============ src/components/review/ReviewForm.jsx ============
import React, { useState } from 'react';
import { FiStar } from 'react-icons/fi';
import { reviewApi } from '../../api/reviewApi';
import Button from '../common/Button';
import Modal from '../common/Modal';
import { toast } from 'react-toastify';

const ReviewForm = ({ isOpen, onClose, providerId, onReviewAdded }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    rating: 0,
    comment: '',
    aspects: {
      taste: 0,
      hygiene: 0,
      delivery: 0,
      value: 0,
    },
  });

  const [hoveredRating, setHoveredRating] = useState(0);
  const [hoveredAspect, setHoveredAspect] = useState({ type: null, value: 0 });

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.rating === 0) {
      toast.error('Please select a rating');
      return;
    }

    setLoading(true);
    try {
      await reviewApi.createReview({
        provider: providerId,
        ...formData,
      });
      toast.success('Review submitted successfully!');
      onReviewAdded();
      onClose();
      setFormData({
        rating: 0,
        comment: '',
        aspects: { taste: 0, hygiene: 0, delivery: 0, value: 0 },
      });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to submit review');
    } finally {
      setLoading(false);
    }
  };

  const StarRating = ({ value, onChange, onHover, hoveredValue }) => (
    <div className="flex items-center space-x-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onChange(star)}
          onMouseEnter={() => onHover(star)}
          onMouseLeave={() => onHover(0)}
          className="focus:outline-none"
        >
          <FiStar
            className={`h-8 w-8 ${
              star <= (hoveredValue || value)
                ? 'text-yellow-500 fill-current'
                : 'text-gray-300'
            }`}
          />
        </button>
      ))}
    </div>
  );

  const AspectRating = ({ label, aspectKey }) => (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() =>
              setFormData({
                ...formData,
                aspects: { ...formData.aspects, [aspectKey]: star },
              })
            }
            onMouseEnter={() => setHoveredAspect({ type: aspectKey, value: star })}
            onMouseLeave={() => setHoveredAspect({ type: null, value: 0 })}
            className="focus:outline-none"
          >
            <FiStar
              className={`h-6 w-6 ${
                star <=
                (hoveredAspect.type === aspectKey
                  ? hoveredAspect.value
                  : formData.aspects[aspectKey])
                  ? 'text-yellow-500 fill-current'
                  : 'text-gray-300'
              }`}
            />
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Write a Review">
      <form onSubmit={handleSubmit}>
        {/* Overall Rating */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Overall Rating <span className="text-red-500">*</span>
          </label>
          <StarRating
            value={formData.rating}
            onChange={(rating) => setFormData({ ...formData, rating })}
            onHover={setHoveredRating}
            hoveredValue={hoveredRating}
          />
        </div>

        {/* Comment */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Your Review
          </label>
          <textarea
            value={formData.comment}
            onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
            placeholder="Share your experience with this provider..."
            rows="4"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>

        {/* Aspect Ratings */}
        <div className="mb-6">
          <h3 className="text-sm font-medium text-gray-700 mb-3">Rate Specific Aspects</h3>
          <div className="space-y-2">
            <AspectRating label="Taste" aspectKey="taste" />
            <AspectRating label="Hygiene" aspectKey="hygiene" />
            <AspectRating label="Delivery" aspectKey="delivery" />
            <AspectRating label="Value for Money" aspectKey="value" />
          </div>
        </div>

        {/* Submit Buttons */}
        <div className="flex space-x-3">
          <Button type="button" variant="outline" fullWidth onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" fullWidth loading={loading}>
            Submit Review
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default ReviewForm;

