import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { trpc } from '@/utils/trpc';
import { ProductList } from '@/components/ProductList';
import type { User, Product } from '../../server/src/schema';

function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [currentView, setCurrentView] = useState<'login' | 'admin-products'>('login');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load user authentication status
  const loadAuth = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const result = await trpc.authenticate.query({ token: 'admin-token' });
      setCurrentUser(result.user);
      
      // If user is admin, automatically navigate to products page
      if (result.user?.role === 'admin') {
        setCurrentView('admin-products');
      }
    } catch (error) {
      console.error('Authentication failed:', error);
      setError('Authentication failed. Please try again.');
      setCurrentUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Load products for admin users
  const loadProducts = useCallback(async () => {
    if (!currentUser || currentUser.role !== 'admin') return;
    
    try {
      setIsLoading(true);
      setError(null);
      const result = await trpc.getProducts.query();
      setProducts(result);
    } catch (error) {
      console.error('Failed to load products:', error);
      setError('Failed to load products. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [currentUser]);

  useEffect(() => {
    loadAuth();
  }, [loadAuth]);

  useEffect(() => {
    if (currentView === 'admin-products' && currentUser?.role === 'admin') {
      loadProducts();
    }
  }, [currentView, loadProducts, currentUser]);

  const handleLoginAsAdmin = async () => {
    await loadAuth();
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setProducts([]);
    setCurrentView('login');
    setError(null);
  };

  const navigateToProducts = () => {
    if (currentUser?.role === 'admin') {
      setCurrentView('admin-products');
    }
  };

  // Login view
  if (currentView === 'login') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-blue-800">🏥 Clinic Admin</CardTitle>
            <p className="text-gray-600">Product Management System</p>
          </CardHeader>
          <CardContent className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            <div className="text-center space-y-4">
              <p className="text-sm text-gray-600">
                Access the admin panel to manage clinic products and inventory.
              </p>
              
              <Button 
                onClick={handleLoginAsAdmin}
                disabled={isLoading}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                {isLoading ? 'Authenticating...' : 'Login as Admin'}
              </Button>

              {currentUser && currentUser.role !== 'admin' && (
                <Alert>
                  <AlertDescription>
                    Access denied. Admin role required to manage products.
                  </AlertDescription>
                </Alert>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Admin products view
  if (currentView === 'admin-products') {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center space-x-4">
                <h1 className="text-2xl font-bold text-blue-800">🏥 Clinic Admin</h1>
                <div className="hidden sm:block w-px h-6 bg-gray-300"></div>
                <span className="text-gray-600 font-medium">Product Management</span>
              </div>
              
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-600">
                  Welcome, <span className="font-medium">{currentUser?.username}</span>
                </span>
                <Button 
                  onClick={handleLogout}
                  variant="outline" 
                  size="sm"
                >
                  Logout
                </Button>
              </div>
            </div>
          </div>
        </header>

        {/* Main content */}
        <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Medical Products Inventory</h2>
            <p className="text-gray-600 mt-1">
              View and manage clinic products, equipment, and supplies
            </p>
          </div>

          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <div className="text-center">
                <div className="animate-pulse space-y-4">
                  <div className="h-4 bg-gray-200 rounded w-32 mx-auto"></div>
                  <div className="h-3 bg-gray-200 rounded w-24 mx-auto"></div>
                </div>
                <p className="text-gray-500 mt-4">Loading products...</p>
              </div>
            </div>
          ) : (
            <ProductList products={products} />
          )}
        </main>
      </div>
    );
  }

  return null;
}

export default App;