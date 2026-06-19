# Smart Chits Management System

A React-based web application for managing chit funds with user authentication, chit tracking, and payment history.

## Features

- **User Authentication**: Login and Signup functionality
- **User Types**: Support for both Individual and Organization users
- **Dashboard**: View all users and their associated chits
- **Chit Details**: Detailed view of each chit with progress tracking
- **Payment History**: Complete payment tracking with status indicators

## Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

3. Open your browser and navigate to `http://localhost:3000`

## Usage

### Home Page
- Click **Login** to authenticate existing users
- Click **Signup** to register new users

### Signup
- Choose between **Individual** or **Organization** user type
- Fill in the required details
- Submit to create your account

### Dashboard
- View all registered users
- Click **View Chits** to see a user's chit subscriptions
- Click **Details** to view specific chit information
- Click **Payments** to view payment history

### Chit Details
- View comprehensive chit information
- See progress percentage
- Track amount paid and remaining
- Navigate to payment history

### Payment History
- View all installment payments
- Track paid, pending, and late payments
- See total amount paid and pending

## Project Structure

```
smart-chits-frontend/
├── src/
│   ├── components/
│   │   ├── Login.jsx          # User login component
│   │   ├── Signup.jsx        # User registration with individual/org options
│   │   ├── Dashboard.jsx     # Main dashboard with users and chits list
│   │   ├── ChitDetails.jsx   # Detailed chit information view
│   │   └── PaymentHistory.jsx # Payment tracking and history
│   ├── App.jsx               # Main application component with routing
│   ├── main.jsx              # Application entry point
│   └── index.css             # Global styles
├── index.html                # HTML template
├── package.json              # Dependencies and scripts
└── vite.config.js            # Vite configuration
```

## Technologies Used

- React 18
- Vite (Build tool)
- CSS3 (Styling)

## Future Enhancements

- Backend API integration
- Real database connectivity
- Advanced payment processing
- User profile management
- Admin panel
- Reports and analytics
