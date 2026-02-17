import { getProducts } from "@/lib/products";
import ProductFeed from "@/components/ProductFeed";
import HeroCarousel from "@/components/HeroCarousel";
import { getSession } from "@/lib/auth";
import TopRatedCarousel from "@/components/TopRatedCarousel";

export default async function Home() {
  // 1. Fetch Products
  const products = await getProducts();

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
      heroCarousel={<HeroCarousel />}
    />
  );
}