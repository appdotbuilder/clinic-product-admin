import { z } from 'zod';

// Product schema with proper numeric handling
export const productSchema = z.object({
  id: z.number(),
  name: z.string(),
  category: z.string(),
  purchase_price: z.number(), // Stored as numeric in DB, but we use number in TS
  selling_price: z.number(), // Stored as numeric in DB, but we use number in TS
  stock: z.number().int(), // Ensures integer values only
  created_at: z.coerce.date() // Automatically converts string timestamps to Date objects
});

export type Product = z.infer<typeof productSchema>;

// User schema for authentication and authorization
export const userSchema = z.object({
  id: z.number(),
  username: z.string(),
  email: z.string().email(),
  role: z.enum(['admin', 'user']),
  created_at: z.coerce.date()
});

export type User = z.infer<typeof userSchema>;

// Input schema for creating products (for future use)
export const createProductInputSchema = z.object({
  name: z.string(),
  category: z.string(),
  purchase_price: z.number().positive(), // Validate that price is positive
  selling_price: z.number().positive(), // Validate that price is positive
  stock: z.number().int().nonnegative() // Validate that stock is non-negative integer
});

export type CreateProductInput = z.infer<typeof createProductInputSchema>;

// Input schema for updating products (for future use)
export const updateProductInputSchema = z.object({
  id: z.number(),
  name: z.string().optional(),
  category: z.string().optional(),
  purchase_price: z.number().positive().optional(),
  selling_price: z.number().positive().optional(),
  stock: z.number().int().nonnegative().optional()
});

export type UpdateProductInput = z.infer<typeof updateProductInputSchema>;

// Authentication context schema
export const authContextSchema = z.object({
  user: userSchema.nullable()
});

export type AuthContext = z.infer<typeof authContextSchema>;