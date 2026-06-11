const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

const calculateDistance = (lat1, lon1, lat2, lon2) => {
  // Haversine formula to calculate distance in kilometers
  const R = 6371; // Earth's radius in km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

const toRad = (value) => {
  return (value * Math.PI) / 180;
};

const formatDate = (date) => {
  return new Date(date).toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

const sanitizeUser = (user) => {
  const userObject = user.toObject();
  delete userObject.password;
  delete userObject.__v;
  return userObject;
};

module.exports = {
  generateOTP,
  calculateDistance,
  formatDate,
  sanitizeUser
};