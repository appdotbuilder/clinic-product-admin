import { type Product } from '../schema';

export async function getProducts(): Promise<Product[]> {
    // This is a placeholder declaration! Real code should be implemented here.
    // The goal of this handler is fetching all products from the database for admin display.
    // This will return dummy data for now as requested.
    
    const dummyProducts: Product[] = [
        {
            id: 1,
            name: 'Digital Thermometer',
            category: 'Medical Equipment',
            purchase_price: 25.00,
            selling_price: 35.00,
            stock: 50,
            created_at: new Date('2024-01-15T10:00:00Z')
        },
        {
            id: 2,
            name: 'Blood Pressure Monitor',
            category: 'Medical Equipment',
            purchase_price: 80.00,
            selling_price: 120.00,
            stock: 25,
            created_at: new Date('2024-01-16T11:30:00Z')
        },
        {
            id: 3,
            name: 'Surgical Gloves (Box of 100)',
            category: 'Consumables',
            purchase_price: 15.00,
            selling_price: 22.00,
            stock: 200,
            created_at: new Date('2024-01-17T09:15:00Z')
        },
        {
            id: 4,
            name: 'Bandages',
            category: 'Consumables',
            purchase_price: 5.00,
            selling_price: 8.50,
            stock: 150,
            created_at: new Date('2024-01-18T14:20:00Z')
        },
        {
            id: 5,
            name: 'Stethoscope',
            category: 'Medical Equipment',
            purchase_price: 45.00,
            selling_price: 75.00,
            stock: 15,
            created_at: new Date('2024-01-19T16:45:00Z')
        },
        {
            id: 6,
            name: 'Antiseptic Solution (500ml)',
            category: 'Pharmaceuticals',
            purchase_price: 8.00,
            selling_price: 12.00,
            stock: 80,
            created_at: new Date('2024-01-20T08:30:00Z')
        },
        {
            id: 7,
            name: 'Syringes (Pack of 50)',
            category: 'Consumables',
            purchase_price: 12.00,
            selling_price: 18.00,
            stock: 120,
            created_at: new Date('2024-01-21T12:10:00Z')
        },
        {
            id: 8,
            name: 'Examination Table Paper',
            category: 'Consumables',
            purchase_price: 20.00,
            selling_price: 30.00,
            stock: 75,
            created_at: new Date('2024-01-22T15:25:00Z')
        }
    ];
    
    return Promise.resolve(dummyProducts);
}