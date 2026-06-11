# Smart Tiffin Scheduler - Backend

A comprehensive MERN stack backend for a tiffin/meal subscription platform with real-time chat, AI recommendations, and payment integration.

## 🚀 Features


- **Authentication & Authorization**: JWT-based auth with role-based access control
- **User Management**: User, Provider, and Admin roles
- **Meal Planning**: Weekly meal scheduler with drag-and-drop support
- **Provider Management**: Tiffin service listings with menus and pricing
- **Subscription System**: Daily/Weekly/Monthly subscription plans
- **Payment Integration**: Razorpay payment gateway integration
- **Real-time Chat**: Socket.io powered messaging between users and providers
- **Reviews & Ratings**: User feedback system with helpful votes
- **Google Maps Integration**: Location-based provider discovery
- **AI Recommendations**: Personalized meal suggestions based on history
- **Inventory Management**: Smart inventory optimization for providers
- **Email Notifications**: Automated emails for subscriptions and reminders
- **Admin Dashboard**: Complete platform management

## 📋 Prerequisites

- Node.js >= 16.0.0
- MongoDB >= 5.0
- npm >= 8.0.0

## 🛠️ Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd smart-tiffin-backend
```

2. **Install dependencies**
```bash
npm install
```

3. **Environment Setup**
   
   Create a `.env` file in the root directory:
```bash
cp .env.example .env
```

4. **Configure environment variables**
   
   Edit `.env` with your credentials:
   - MongoDB connection string
   - JWT secret key
   - Payment gateway credentials (Razorpay/Stripe)
   - Google Maps API key
   - Email service credentials

5. **Start MongoDB**
```bash
# Local MongoDB
mongod

# Or use MongoDB Atlas (cloud)
```

6. **Run the server**
```bash
# Development mode
npm run dev

# Production mode
npm start
```

Server will run on `http://localhost:5000`

## 📁 Project Structure

```
backend/
├── src/
│   ├── config/          # Configuration files
│   ├── models/          # Mongoose schemas
│   ├── controllers/     # Request handlers
│   ├── routes/          # API routes
│   ├── middleware/      # Custom middleware
│   ├── services/        # Business logic services
│   ├── socket/          # Socket.io handlers
│   ├── utils/           # Utility functions
│   └── app.js           # Express app setup
├── .env                 # Environment variables
├── server.js            # Server entry point
└── package.json         # Dependencies
```

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/updatepassword` - Update password
- `POST /api/auth/logout` - Logout user

### Users
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update profile
- `GET /api/users/favorites` - Get favorite providers
- `PUT /api/users/favorites/:providerId` - Toggle favorite

### Providers
- `GET /api/providers` - Get all providers (with filters)
- `GET /api/providers/:id` - Get single provider
- `POST /api/providers` - Create provider listing
- `PUT /api/providers/:id` - Update provider
- `DELETE /api/providers/:id` - Delete provider
- `GET /api/providers/nearby` - Get nearby providers
- `PUT /api/providers/:id/menu` - Update menu
- `PUT /api/providers/:id/pricing` - Update pricing

### Meal Plans
- `GET /api/mealplans` - Get user meal plans
- `POST /api/mealplans` - Create meal plan
- `GET /api/mealplans/:id` - Get single meal plan
- `PUT /api/mealplans/:id` - Update meal plan
- `DELETE /api/mealplans/:id` - Delete meal plan
- `PUT /api/mealplans/:id/favorite` - Toggle favorite

### Subscriptions
- `GET /api/subscriptions` - Get user subscriptions
- `POST /api/subscriptions` - Create subscription
- `GET /api/subscriptions/:id` - Get single subscription
- `PUT /api/subscriptions/:id/cancel` - Cancel subscription
- `PUT /api/subscriptions/:id/pause` - Pause subscription
- `PUT /api/subscriptions/:id/resume` - Resume subscription
- `GET /api/subscriptions/provider/list` - Get provider subscriptions

### Reviews
- `GET /api/reviews/provider/:providerId` - Get provider reviews
- `POST /api/reviews` - Create review
- `PUT /api/reviews/:id` - Update review
- `DELETE /api/reviews/:id` - Delete review
- `PUT /api/reviews/:id/helpful` - Mark as helpful
- `PUT /api/reviews/:id/response` - Add provider response

### Payments
- `POST /api/payments/create-order` - Create payment order
- `POST /api/payments/verify` - Verify payment
- `GET /api/payments/history` - Get payment history

### Chat
- `GET /api/chat/conversations` - Get conversations
- `GET /api/chat/:conversationId` - Get messages
- `POST /api/chat/send` - Send message
- `DELETE /api/chat/:messageId` - Delete message
- `PUT /api/chat/:messageId/report` - Report message

### Admin
- `GET /api/admin/stats` - Dashboard statistics
- `GET /api/admin/users` - Get all users
- `GET /api/admin/providers/pending` - Get pending providers
- `PUT /api/admin/providers/:id/approve` - Approve provider
- `PUT /api/admin/providers/:id/reject` - Reject provider
- `PUT /api/admin/users/:id/toggle-status` - Toggle user status
- `GET /api/admin/reports/messages` - Get reported messages
- `GET /api/admin/reports/reviews` - Get reported reviews
- `DELETE /api/admin/reports/:type/:id` - Delete reported content
- `GET /api/admin/analytics/subscriptions` - Subscription analytics

## 🔐 Authentication

All protected routes require a JWT token in the Authorization header:
```
Authorization: Bearer <token>
```

## 🎭 User Roles

- **User**: Regular customers who plan meals and subscribe to providers
- **Provider**: Tiffin service owners who manage listings and subscriptions
- **Admin**: Platform administrators with full access

## 🔌 Socket.io Events

### Chat Events
- `join:conversation` - Join a conversation room
- `leave:conversation` - Leave a conversation room
- `message:send` - Send a message
- `message:received` - Receive a message
- `typing:start` - User started typing
- `typing:stop` - User stopped typing
- `messages:read` - Mark messages as read

### Notification Events
- `notification:send` - Send notification
- `notification:new` - Receive new notification
- `notification:read` - Mark notification as read
- `notifications:read:all` - Mark all as read
- `notifications:unread:count` - Get unread count

## 📧 Email Notifications

Automated emails are sent for:
- Subscription confirmation
- Meal reminders
- Subscription expiry alerts
- Provider approval/rejection
- Payment confirmations

## 🗺️ Google Maps Integration

Features:
- Geocoding addresses to coordinates
- Reverse geocoding
- Distance calculation
- Nearby provider search

## 🤖 AI Recommendations

The AI service provides:
- Personalized meal suggestions based on history
- Provider recommendations based on preferences
- Dietary preference filtering
- Location-based suggestions

## 📦 Inventory Management

For providers:
- Weekly ingredient calculations
- Waste reduction optimization
- Subscriber-based quantity estimation
- Historical data analysis

## 🛡️ Security Features

- Password hashing with bcrypt
- JWT token authentication
- CORS protection
- Helmet security headers
- Rate limiting on sensitive routes
- Input validation with express-validator
- XSS protection

## 🧪 Testing

```bash
npm test
```

## 📊 Database Models

- **User**: User accounts with preferences
- **TiffinProvider**: Provider listings with menus
- **MealPlan**: Weekly meal schedules
- **Subscription**: Subscription records
- **Review**: User reviews and ratings
- **ChatMessage**: Real-time messages
- **Notification**: User notifications

## 🚀 Deployment

### Environment Variables for Production
Ensure all environment variables are set correctly for production:
- Use MongoDB Atlas for database
- Use secure JWT_SECRET
- Configure production email service
- Set up production payment gateway
- Enable HTTPS

### Deployment Platforms
- **Heroku**: Use Heroku MongoDB addon
- **AWS**: Deploy on EC2 with MongoDB Atlas
- **DigitalOcean**: App Platform or Droplet
- **Vercel**: Serverless functions

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 📝 License

MIT License

## 👥 Support

For support, email support@smarttiffin.com or join our Slack channel.

## 🙏 Acknowledgments

- Express.js
- MongoDB
- Socket.io
- Razorpay
- Google Maps API
