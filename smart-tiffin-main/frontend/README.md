# Smart Tiffin Scheduler - Frontend

A modern, responsive React frontend for the Smart Tiffin Scheduler platform with Redux state management and Tailwind CSS styling.

## 🎨 Features

- **Modern UI/UX**: Clean, intuitive interface built with Tailwind CSS
- **State Management**: Redux Toolkit for predictable state management
- **Real-time Chat**: Socket.io integration for instant messaging
- **Responsive Design**: Mobile-first approach, works on all devices
- **Component-Based**: Reusable, modular components
- **Type-Safe**: PropTypes validation
- **Performance**: Optimized rendering and lazy loading
- **Toast Notifications**: User-friendly feedback system
- **Form Validation**: Formik + Yup for robust form handling
- **Protected Routes**: Role-based access control

## 📦 Tech Stack

- **React 18** - UI library
- **Redux Toolkit** - State management
- **React Router v6** - Navigation
- **Tailwind CSS** - Styling
- **Axios** - HTTP client
- **Socket.io Client** - Real-time communication
- **React Icons** - Icon library
- **React Toastify** - Notifications
- **Formik + Yup** - Form handling & validation

## 🚀 Getting Started

### Prerequisites

- Node.js >= 16.0.0
- npm >= 8.0.0
- Backend server running

### Installation

1. **Clone and navigate to frontend directory**
```bash
cd smart-tiffin-frontend
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

Update the `.env` file with your configuration:
```env
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_SOCKET_URL=http://localhost:5000
REACT_APP_GOOGLE_MAPS_KEY=your_google_maps_api_key
REACT_APP_RAZORPAY_KEY=your_razorpay_key_id
```

4. **Start the development server**
```bash
npm start
```

The app will open at `http://localhost:3000`

## 📁 Project Structure

```
src/
├── api/                    # API calls and axios configuration
├── components/
│   ├── common/            # Reusable UI components
│   ├── layout/            # Layout components (Navbar, Footer)
│   ├── auth/              # Authentication components
│   ├── provider/          # Provider-related components
│   ├── mealPlan/          # Meal planning components
│   ├── subscription/      # Subscription components
│   ├── review/            # Review components
│   ├── chat/              # Chat components
│   └── admin/             # Admin components
├── pages/                 # Page components
├── redux/                 # Redux store and slices
├── services/              # Service layers (socket, storage)
├── utils/                 # Utility functions
├── styles/                # Global styles
├── App.jsx               # Main app component
└── index.jsx             # Entry point
```

## 🎯 Key Components

### Common Components

- **Button** - Customizable button with variants and sizes
- **Input** - Form input with validation support
- **Card** - Container component with hover effects
- **Modal** - Accessible modal dialog
- **Loader** - Loading spinner with size variants
- **Alert** - Notification alerts (success, error, warning, info)
- **Badge** - Status badges
- **Pagination** - Paginated list navigation

### Layout Components

- **Navbar** - Main navigation with user menu
- **Footer** - Site footer with links
- **MainLayout** - Wraps pages with consistent layout
- **ProtectedRoute** - Route guard with role-based access

### Feature Components

- **ProviderCard** - Provider listing card
- **ProviderList** - Grid of provider cards
- **MealPlanner** - Weekly meal planning interface
- **SubscriptionCard** - Subscription details card
- **ReviewCard** - Review display with ratings
- **ChatWindow** - Real-time chat interface

## 🔌 API Integration

All API calls are centralized in the `src/api/` directory:

```javascript
// Example: Fetch providers
import { providerApi } from './api/providerApi';

const providers = await providerApi.getProviders({ city: 'Pune' });
```

### Available APIs

- **authApi** - Authentication (login, register, logout)
- **userApi** - User profile and favorites
- **providerApi** - Provider CRUD operations
- **mealPlanApi** - Meal planning
- **subscriptionApi** - Subscription management
- **reviewApi** - Reviews and ratings
- **chatApi** - Messaging
- **paymentApi** - Payment processing

## 🔄 Redux State Management

### Store Structure

```javascript
{
  auth: { user, token, isAuthenticated, loading, error },
  provider: { providers, currentProvider, pagination, loading },
  mealPlan: { mealPlans, currentMealPlan, loading },
  subscription: { subscriptions, currentSubscription, loading },
  chat: { conversations, messages, unreadCount },
  ui: { sidebarOpen, modalOpen, notifications }
}
```

### Usage Example

```javascript
import { useDispatch, useSelector } from 'react-redux';
import { fetchProviders } from './redux/slices/providerSlice';

function MyComponent() {
  const dispatch = useDispatch();
  const { providers, loading } = useSelector((state) => state.provider);

  useEffect(() => {
    dispatch(fetchProviders({ city: 'Pune' }));
  }, []);

  return <div>{/* Your component */}</div>;
}
```

## 🎨 Styling Guide

### Tailwind CSS

The project uses Tailwind CSS with a custom configuration:

```javascript
// Primary color palette
primary: {
  50-900: // Red shades
}

// Secondary color palette
secondary: {
  50-900: // Green shades
}
```

### Custom Classes

```css
/* Animations */
.animate-fade-in
.animate-slide-up
.animate-slide-down

/* Custom scrollbar styling included */
```

### Component Styling Pattern

```javascript
// Use consistent class patterns
<button className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors">
  Click Me
</button>
```

## 🔐 Authentication Flow

1. User submits login/register form
2. Redux action dispatches API call
3. Token stored in localStorage
4. Socket.io connection established
5. User redirected to dashboard
6. Protected routes check authentication

```javascript
// Protected route usage
<Route
  path="/profile"
  element={
    <ProtectedRoute>
      <Profile />
    </ProtectedRoute>
  }
/>

// Role-based protection
<ProtectedRoute roles={['admin']}>
  <AdminDashboard />
</ProtectedRoute>
```

## 💬 Real-time Features

### Socket.io Integration

```javascript
import socketService from './services/socketService';

// Connect (automatically done on login)
socketService.connect(token);

// Listen for events
socketService.on('message:received', (data) => {
  console.log('New message:', data);
});

// Emit events
socketService.emit('message:send', {
  receiverId: 'user123',
  message: 'Hello!',
});

// Disconnect
socketService.disconnect();
```

### Chat Implementation

- Real-time message delivery
- Typing indicators
- Read receipts
- Conversation list with unread counts

## 🧪 Testing

```bash
# Run tests
npm test

# Run tests with coverage
npm test -- --coverage
```

## 🏗️ Building for Production

```bash
# Create optimized production build
npm run build

# Build output will be in the 'build' folder
```

### Build Optimizations

- Code splitting
- Tree shaking
- Minification
- Asset optimization
- Service worker for PWA (optional)

## 🚢 Deployment

### Deploy to Vercel

```bash
npm install -g vercel
vercel
```

### Deploy to Netlify

```bash
npm install -g netlify-cli
netlify deploy --prod
```

### Deploy to AWS S3

```bash
npm run build
aws s3 sync build/ s3://your-bucket-name
```

### Environment Variables

Set environment variables in your hosting platform:
- Vercel: Project Settings → Environment Variables
- Netlify: Site Settings → Build & Deploy → Environment
- AWS: Use AWS Systems Manager Parameter Store

## 📱 Progressive Web App (PWA)

The app is PWA-ready. To enable:

1. Update `public/manifest.json`
2. Uncomment service worker in `src/index.js`
3. Configure workbox in `src/service-worker.js`

## 🎯 Best Practices Followed

### Code Organization

- **Component-based architecture** - Reusable, modular components
- **Container/Presentational pattern** - Separation of concerns
- **Custom hooks** - Reusable logic (useAuth, useSocket)
- **Constants** - Centralized configuration

### Performance

- **Lazy loading** - Route-based code splitting
- **Memoization** - React.memo for expensive components
- **Debouncing** - Search inputs and API calls
- **Image optimization** - Lazy loading images

### Accessibility

- **Semantic HTML** - Proper heading hierarchy
- **ARIA labels** - Screen reader support
- **Keyboard navigation** - Tab order and shortcuts
- **Focus management** - Modal and dropdown focus

### Security

- **XSS protection** - Input sanitization
- **CSRF tokens** - API request headers
- **Secure storage** - Token management
- **Route guards** - Protected routes

## 🐛 Common Issues & Solutions

### Issue: CORS errors
**Solution**: Ensure backend CORS is configured for frontend URL

### Issue: Socket connection fails
**Solution**: Check SOCKET_URL in .env and backend socket config

### Issue: Build fails
**Solution**: Clear node_modules and reinstall
```bash
rm -rf node_modules
npm install
```

### Issue: Styles not applying
**Solution**: Rebuild Tailwind cache
```bash
npm run build:css
```

## 📚 Additional Resources

- [React Documentation](https://react.dev)
- [Redux Toolkit](https://redux-toolkit.js.org)
- [Tailwind CSS](https://tailwindcss.com)
- [React Router](https://reactrouter.com)
- [Socket.io Client](https://socket.io/docs/v4/client-api/)

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

## 📝 Code Style

- Use ESLint and Prettier
- Follow Airbnb React style guide
- Write meaningful commit messages
- Add comments for complex logic

## 🔄 Available Scripts

```bash
npm start          # Start development server
npm run build      # Build for production
npm test           # Run tests
npm run eject      # Eject from Create React App
```

## 📞 Support

For support:
- Email: support@smarttiffin.com
- GitHub Issues: [Create an issue](https://github.com/your-repo/issues)
- Documentation: [Wiki](https://github.com/your-repo/wiki)

## 📄 License

MIT License - see LICENSE file for details

## 🙏 Acknowledgments

- Create React App for boilerplate
- Tailwind Labs for Tailwind CSS
- Redux team for state management
- Socket.io team for real-time capabilities
- All open-source contributors

---

**Built with ❤️ for Smart Tiffin Scheduler**