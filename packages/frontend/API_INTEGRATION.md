# KRUSANT API Integration Guide

## Architecture Overview

The application now has a complete API integration setup with:
- ✅ Native fetch-based API client with cookie support
- ✅ React Query for data fetching and caching
- ✅ Authentication context for managing user state
- ✅ TypeScript types for type-safe API calls

## File Structure

```
src/
├── api/
│   ├── client.ts              # Core API client with fetch
│   └── endpoints/
│       ├── auth.ts            # Authentication endpoints
│       └── user.ts            # User management endpoints
├── context/
│   └── AuthContext.tsx        # Auth state management
├── hooks/
│   └── useAuth.ts             # Auth hook for components
└── types/
    └── api.ts                 # API type definitions
```

## Usage Examples

### 1. Using Authentication in Components

```tsx
import { useAuth } from './hooks/useAuth';

function ProfileComponent() {
  const { user, isAuthenticated, login, logout } = useAuth();

  const handleLogin = async () => {
    try {
      await login({ email: 'user@example.com', password: 'password' });
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  if (!isAuthenticated) {
    return <button onClick={handleLogin}>Login</button>;
  }

  return (
    <div>
      <p>Welcome, {user?.name}!</p>
      <button onClick={logout}>Logout</button>
    </div>
  );
}
```

### 2. Making API Calls with React Query

```tsx
import { useQuery, useMutation } from '@tanstack/react-query';
import { userApi } from './api/endpoints/user';

function UserProfile() {
  // Fetch data
  const { data: user, isLoading } = useQuery({
    queryKey: ['user', userId],
    queryFn: () => userApi.getUserById(userId),
  });

  // Mutate data
  const updateMutation = useMutation({
    mutationFn: userApi.updateProfile,
    onSuccess: () => {
      // Refetch or update cache
    },
  });

  const handleUpdate = () => {
    updateMutation.mutate({ name: 'New Name' });
  };

  if (isLoading) return <div>Loading...</div>;
  return <div>{user?.name}</div>;
}
```

### 3. Direct API Calls (without React Query)

```tsx
import { authApi } from './api/endpoints/auth';
import { ApiClientError } from './api/client';

async function someFunction() {
  try {
    const user = await authApi.getCurrentUser();
    console.log('Current user:', user);
  } catch (error) {
    if (error instanceof ApiClientError) {
      console.error('API Error:', error.message, error.statusCode);
    }
  }
}
```

## Configuration

### Environment Variables

Update `.env` with your backend API URL:

```env
REACT_APP_API_BASE_URL=http://localhost:3000/api
```

### Backend Requirements

Your backend must:

1. **Enable CORS with credentials:**
   ```js
   // Express example
   app.use(cors({
     origin: 'http://localhost:3001',
     credentials: true
   }));
   ```

2. **Set httpOnly cookies:**
   ```js
   res.cookie('session', token, {
     httpOnly: true,
     secure: process.env.NODE_ENV === 'production',
     sameSite: 'lax',
     maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
   });
   ```

3. **Match API endpoints:**
   - POST `/api/auth/login`
   - POST `/api/auth/register`
   - POST `/api/auth/logout`
   - GET `/api/auth/me`
   - POST `/api/auth/refresh`
   - GET `/api/users/:id`
   - PATCH `/api/users/me`
   - DELETE `/api/users/me`

## Features

### API Client (`src/api/client.ts`)
- ✅ Automatic cookie handling with `credentials: 'include'`
- ✅ JSON request/response handling
- ✅ Centralized error handling
- ✅ TypeScript support
- ✅ RESTful methods (GET, POST, PUT, PATCH, DELETE)

### Auth Context (`src/context/AuthContext.tsx`)
- ✅ Automatic user authentication check on mount
- ✅ Login/Register/Logout methods
- ✅ User state management
- ✅ Integration with React Query
- ✅ Error handling

### Type Safety (`src/types/api.ts`)
- ✅ Request/Response type definitions
- ✅ User model types
- ✅ Authentication types
- ✅ API error types

## Next Steps

1. **Create Login/Register Components:**
   - Build forms that use `useAuth()` hook
   - Add form validation
   - Handle error states

2. **Add Protected Routes:**
   ```tsx
   function ProtectedRoute({ children }) {
     const { isAuthenticated, isLoading } = useAuth();
     if (isLoading) return <div>Loading...</div>;
     if (!isAuthenticated) return <Navigate to="/login" />;
     return children;
   }
   ```

3. **Implement Token Refresh:**
   - Add interceptor in API client for 401 responses
   - Call `authApi.refreshSession()` automatically

4. **Add More API Endpoints:**
   - Create new files in `src/api/endpoints/`
   - Follow the same pattern as `auth.ts` and `user.ts`

## Testing

To test the integration:

1. Start your backend server (must support the endpoints above)
2. Update `.env` with correct API URL
3. Run the frontend: `npm start`
4. Use browser DevTools → Network tab to verify:
   - Cookies are being sent/received
   - API calls include `credentials: include`
   - Responses are properly handled
