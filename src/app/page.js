import { getProducts } from "@/lib/products";
import { getHeroSlides } from "@/lib/hero";
import ProductFeed from "@/components/ProductFeed";
import HeroCarousel from "@/components/HeroCarousel";
import { getSession } from "@/lib/auth";


export default async function Home() {
  // 1. Fetch Products
  const products = await getProducts();

  // 1b. Fetch Hero Slides (ISR)
  const heroSlides = await getHeroSlides();

  // 1c. Derive Categories on Server
  const categories = [...new Set(products.map(p => p.category))];

  // 2. Fetch User (From our Custom Auth)
  const session = await getSession();

  // 3. Serialize User
  const user = session ? {
    id: session.userId,
    email: session.email,
    name: session.name || "User",
    role: session.role
  } : null;

  return (
    <ProductFeed
      initialProducts={products}
      user={user}
      heroSlides={heroSlides}
      serverCategories={categories} // Pass Server-derived Categories
    />
  );
}