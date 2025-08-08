import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { Product } from '../../../server/src/schema';

interface ProductListProps {
  products: Product[];
}

export function ProductList({ products }: ProductListProps) {
  if (products.length === 0) {
    return (
      <Card className="p-8 text-center">
        <div className="text-gray-500">
          <div className="text-4xl mb-4">📦</div>
          <h3 className="text-lg font-medium mb-2">No Products Found</h3>
          <p className="text-sm">There are currently no products in the inventory.</p>
        </div>
      </Card>
    );
  }

  const getCategoryColor = (category: string) => {
    switch (category.toLowerCase()) {
      case 'medical equipment':
        return 'bg-blue-100 text-blue-800';
      case 'consumables':
        return 'bg-green-100 text-green-800';
      case 'pharmaceuticals':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStockStatus = (stock: number) => {
    if (stock === 0) {
      return { text: 'Out of Stock', color: 'bg-red-100 text-red-800' };
    } else if (stock <= 20) {
      return { text: 'Low Stock', color: 'bg-yellow-100 text-yellow-800' };
    } else {
      return { text: 'In Stock', color: 'bg-green-100 text-green-800' };
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {products.map((product: Product) => {
          const stockStatus = getStockStatus(product.stock);
          const profit = product.selling_price - product.purchase_price;
          const profitMargin = ((profit / product.purchase_price) * 100).toFixed(1);

          return (
            <Card key={product.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="space-y-4">
                  {/* Header */}
                  <div>
                    <h3 className="font-semibold text-lg text-gray-900 leading-tight">
                      {product.name}
                    </h3>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge className={getCategoryColor(product.category)}>
                        {product.category}
                      </Badge>
                      <Badge className={stockStatus.color}>
                        {stockStatus.text}
                      </Badge>
                    </div>
                  </div>

                  {/* Pricing Information */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500 font-medium">Purchase Price</p>
                      <p className="text-lg font-semibold text-gray-900">
                        ${product.purchase_price.toFixed(2)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 font-medium">Selling Price</p>
                      <p className="text-lg font-semibold text-green-600">
                        ${product.selling_price.toFixed(2)}
                      </p>
                    </div>
                  </div>

                  {/* Stock and Profit */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500 font-medium">Stock Quantity</p>
                      <p className="text-xl font-bold text-gray-900">
                        {product.stock}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 font-medium">Profit Margin</p>
                      <p className={`text-lg font-semibold ${profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        +{profitMargin}%
                      </p>
                    </div>
                  </div>

                  {/* Additional Info */}
                  <div className="pt-2 border-t border-gray-100">
                    <p className="text-xs text-gray-400">
                      Added: {product.created_at.toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Summary Stats */}
      <Card className="mt-6">
        <CardContent className="p-6">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">📊 Inventory Summary</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">{products.length}</p>
              <p className="text-sm text-gray-500 font-medium">Total Products</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">
                {products.reduce((sum: number, p: Product) => sum + p.stock, 0)}
              </p>
              <p className="text-sm text-gray-500 font-medium">Total Stock</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-purple-600">
                ${products.reduce((sum: number, p: Product) => sum + (p.purchase_price * p.stock), 0).toFixed(0)}
              </p>
              <p className="text-sm text-gray-500 font-medium">Inventory Value</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-red-600">
                {products.filter((p: Product) => p.stock <= 20).length}
              </p>
              <p className="text-sm text-gray-500 font-medium">Low Stock Items</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}