import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { productsTable } from '../db/schema';
import { getProducts } from '../handlers/get_products';

describe('getProducts', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return empty array when no products exist', async () => {
    const result = await getProducts();

    expect(result).toEqual([]);
  });

  it('should return all products from database', async () => {
    // Create test products
    await db.insert(productsTable)
      .values([
        {
          name: 'Digital Thermometer',
          category: 'Medical Equipment',
          purchase_price: '25.00',
          selling_price: '35.00',
          stock: 50
        },
        {
          name: 'Blood Pressure Monitor',
          category: 'Medical Equipment',
          purchase_price: '80.50',
          selling_price: '120.75',
          stock: 25
        },
        {
          name: 'Surgical Gloves',
          category: 'Consumables',
          purchase_price: '15.25',
          selling_price: '22.99',
          stock: 200
        }
      ])
      .execute();

    const result = await getProducts();

    expect(result).toHaveLength(3);
    
    // Verify first product
    expect(result[0].name).toEqual('Digital Thermometer');
    expect(result[0].category).toEqual('Medical Equipment');
    expect(result[0].purchase_price).toEqual(25.00);
    expect(result[0].selling_price).toEqual(35.00);
    expect(result[0].stock).toEqual(50);
    expect(result[0].id).toBeDefined();
    expect(result[0].created_at).toBeInstanceOf(Date);

    // Verify numeric type conversion
    expect(typeof result[0].purchase_price).toEqual('number');
    expect(typeof result[0].selling_price).toEqual('number');
    expect(typeof result[0].stock).toEqual('number');
  });

  it('should handle decimal prices correctly', async () => {
    // Test with precise decimal values
    await db.insert(productsTable)
      .values({
        name: 'Test Product',
        category: 'Test Category',
        purchase_price: '99.99',
        selling_price: '149.95',
        stock: 10
      })
      .execute();

    const result = await getProducts();

    expect(result).toHaveLength(1);
    expect(result[0].purchase_price).toEqual(99.99);
    expect(result[0].selling_price).toEqual(149.95);
    expect(typeof result[0].purchase_price).toEqual('number');
    expect(typeof result[0].selling_price).toEqual('number');
  });

  it('should return products ordered by database default (creation order)', async () => {
    // Create products in specific order
    await db.insert(productsTable)
      .values({
        name: 'First Product',
        category: 'Category A',
        purchase_price: '10.00',
        selling_price: '15.00',
        stock: 100
      })
      .execute();

    // Small delay to ensure different timestamps
    await new Promise(resolve => setTimeout(resolve, 1));

    await db.insert(productsTable)
      .values({
        name: 'Second Product',
        category: 'Category B',
        purchase_price: '20.00',
        selling_price: '30.00',
        stock: 50
      })
      .execute();

    const result = await getProducts();

    expect(result).toHaveLength(2);
    expect(result[0].name).toEqual('First Product');
    expect(result[1].name).toEqual('Second Product');
    expect(result[0].created_at <= result[1].created_at).toBe(true);
  });

  it('should handle products with zero stock', async () => {
    await db.insert(productsTable)
      .values({
        name: 'Out of Stock Item',
        category: 'Medical Equipment',
        purchase_price: '50.00',
        selling_price: '75.00',
        stock: 0
      })
      .execute();

    const result = await getProducts();

    expect(result).toHaveLength(1);
    expect(result[0].stock).toEqual(0);
    expect(result[0].name).toEqual('Out of Stock Item');
  });

  it('should handle large dataset efficiently', async () => {
    // Create multiple products to test performance
    const products = Array.from({ length: 100 }, (_, i) => ({
      name: `Product ${i + 1}`,
      category: i % 2 === 0 ? 'Category A' : 'Category B',
      purchase_price: `${(i + 1) * 10}.00`,
      selling_price: `${(i + 1) * 15}.00`,
      stock: (i + 1) * 5
    }));

    await db.insert(productsTable)
      .values(products)
      .execute();

    const result = await getProducts();

    expect(result).toHaveLength(100);
    expect(result[0].name).toEqual('Product 1');
    expect(result[99].name).toEqual('Product 100');
    
    // Verify all prices are properly converted
    result.forEach(product => {
      expect(typeof product.purchase_price).toEqual('number');
      expect(typeof product.selling_price).toEqual('number');
      expect(product.purchase_price).toBeGreaterThan(0);
      expect(product.selling_price).toBeGreaterThan(0);
    });
  });
});