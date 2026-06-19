# Backend-Frontend API Connection Guide

## ✅ Successfully Connected Components

### 1. **Environment Configuration**
- **Created**: `.env` file with backend URL
- **Backend URL**: `http://localhost:8000`
- **Configured**: Frontend to use environment variable for API base URL

### 2. **API Service Layer**
- **Updated**: `src/services/api.js` 
  - Added authentication token management
  - Automatic token injection in headers
  - Proper error handling with detailed error messages
  - Form data support for login endpoint
  - CORS credentials support

### 3. **Authentication Service**
- **Created**: `src/services/authService.js`
  - `login()` - Authenticates user and stores token
  - `register()` - Registers new user
  - `getCurrentUser()` - Fetches current user profile
  - `logout()` - Clears authentication
  - `isAuthenticated()` - Checks authentication status
  - `getToken()` - Retrieves stored token

### 4. **Chit Service**
- **Updated**: `src/services/chitService.js`
  - `getAllChits()` - Fetches all chit funds
  - `createChit()` - Creates new chit (admin only)
  - `addMemberToChit()` - Adds member to chit (admin only)
  - `getChitDetails()` - Gets specific chit details

### 5. **Payment Service**
- **Created**: `src/services/paymentService.js`
  - `getAllPayments()` - Fetches all payments
  - `createPayment()` - Creates new payment
  - `getPaymentById()` - Gets specific payment
  - `getUserPaymentHistory()` - Gets user's payment history

### 6. **Authentication Context**
- **Updated**: `src/contexts/AuthContext.jsx`
  - Replaced localStorage-based auth with real backend API
  - Added loading state for async operations
  - Automatic token validation on app load
  - Proper error handling for auth failures
  - Maintained translation functionality

### 7. **Login Page**
- **Updated**: `src/pages/LoginPage.jsx`
  - Enhanced error handling to show API error messages
  - Proper async/await for backend calls
  - Loading state management
  - Automatic navigation after successful login

### 8. **Signup Page**
- **Updated**: `src/pages/SignupPage.jsx`
  - Enhanced error handling to show API error messages
  - Proper async/await for backend calls
  - Fixed syntax errors
  - Password validation maintained

### 9. **Dashboard Page**
- **Updated**: `src/pages/DashboardPage.jsx`
  - Replaced mock data with real API calls
  - Added loading state with spinner
  - Added error state with error messages
  - Automatic data fetching on component mount
  - Proper error handling for API failures

## 🔄 API Endpoints Mapping

### Authentication
- `POST /auth/login` - User login (form data)
- `POST /users/register` - User registration (JSON)

### Users
- `GET /users/me` - Get current user profile
- `GET /users/` - Get all users (admin only)

### Chits
- `GET /chits/` - Get all chits
- `POST /chits/create` - Create chit (admin only)
- `POST /chits/add-member` - Add member to chit (admin only)

### Payments
- `GET /payments/` - Get all payments
- `POST /payments/create` - Create payment
- `GET /payments/{id}` - Get specific payment
- `GET /payments/user/{user_id}` - Get user payment history

## 🔐 Authentication Flow

1. **Login Flow**:
   - User enters credentials → `LoginPage`
   - Call `login(email, password)` → `authService`
   - POST to `/auth/login` with form data
   - Receive JWT token → Store in localStorage
   - Fetch current user data → Update AuthContext
   - Navigate to dashboard

2. **Signup Flow**:
   - User fills form → `SignupPage`
   - Call `register(userData)` → `authService`
   - POST to `/users/register` with JSON
   - Auto-login after registration
   - Navigate to dashboard

3. **Protected API Calls**:
   - All API calls automatically include `Authorization: Bearer {token}` header
   - Token retrieved from localStorage
   - Backend validates token for protected endpoints

## 🛠️ Error Handling

### API Errors
- 401 Unauthorized → Invalid credentials or token
- 403 Forbidden → Insufficient permissions
- 404 Not Found → Resource doesn't exist
- 422 Validation Error → Invalid input data
- 500 Server Error → Backend error

### Frontend Error Display
- Login/Signup pages show error messages in red boxes
- Dashboard shows error messages with retry option
- Console logs detailed error information for debugging

## 🚀 How to Run

### Prerequisites
1. Backend server running on `http://localhost:8000`
2. Frontend server running on `http://localhost:5173` (Vite default)

### Start Backend
```bash
cd "smart-chits-app Backend"
python -m uvicorn main:app --reload
```

### Start Frontend
```bash
cd "smart-chits-app UI/smart-chits-frontend"
npm run dev
```

## 📝 Testing the Connection

1. **Test Backend Health**:
   - Visit `http://localhost:8000/`
   - Should see: `{"message": "Smart Chits Backend Running 🚀"}`

2. **Test Registration**:
   - Go to `http://localhost:5173/signup`
   - Fill registration form
   - Submit and check for successful redirect

3. **Test Login**:
   - Go to `http://localhost:5173/login`
   - Enter registered credentials
   - Submit and check for successful redirect to dashboard

4. **Test Dashboard**:
   - After login, check if chits load from backend
   - Check for loading spinner during data fetch
   - Verify chit data displays correctly

## 🔍 Troubleshooting

### Connection Issues
- **CORS errors**: Check backend CORS configuration in `main.py`
- **404 errors**: Verify backend is running on correct port
- **Network errors**: Check if backend server is started

### Authentication Issues
- **Login fails**: Check credentials and backend user data
- **Token errors**: Clear localStorage and try login again
- **401 errors**: Token may be expired, try re-login

### Data Loading Issues
- **Empty dashboard**: Check backend has chit data
- **Loading spinner stuck**: Check browser console for API errors
- **Error messages**: Check backend logs for detailed errors

## 📊 Current Status

✅ **Completed**:
- Environment configuration
- API service layer with authentication
- Auth service with all endpoints
- Chit service integration
- Payment service integration
- AuthContext updated for real backend
- Login/Signup pages updated
- Dashboard page with real data fetching
- Error handling throughout
- Loading states

🔄 **Ready for Testing**:
- User registration flow
- User login flow
- Dashboard data display
- Authentication token management

## 🎯 Next Steps

1. Start backend server
2. Start frontend server
3. Test registration flow
4. Test login flow
5. Verify dashboard loads real data
6. Test error scenarios
7. Add additional API integrations as needed

## 📞 Support

If you encounter any issues:
1. Check browser console for errors
2. Check backend terminal for error logs
3. Verify backend server is running
4. Verify environment variables are correct
5. Check network tab in browser DevTools for API calls
