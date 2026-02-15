import { z } from 'zod';

export const productSchema = z.object({
    name: z.string().min(1, "Name is required").max(255),
    price: z.coerce.number().min(0, "Price must be positive"),
    category: z.string().optional().default("Uncategorized"),
    description: z.string().optional(),
    stock: z.coerce.number().int().min(0).default(0),
    rating: z.coerce.number().min(0).max(5).default(0),
    images: z.array(z.string()).max(5, "Max 5 images allowed").optional().default([]),
});

export const chatSchema = z.object({
    message: z.string().min(1).max(500, "Message too long"),
    session_id: z.string().optional(),
});
