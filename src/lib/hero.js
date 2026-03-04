import db from "./db";
import { unstable_cache } from "next/cache";

// Fetch Hero Slides with ISR (Revalidate every hour)
export const getHeroSlides = unstable_cache(
    async () => {
        try {
            const [rows] = await db.execute("SELECT * FROM hero_slides ORDER BY created_at DESC");
            return rows;
        } catch (error) {
            console.error("Error fetching hero slides:", error);
            return [];
        }
    },
    ["hero-slides"], // Cache Key
    { revalidate: 3600 } // Revalidate every 1 hour (ISR)
);
