import { getProducts } from "../lib/products";

import ProductFeed from "../components/Product_Feed"; 
import { currentUser } from "@clerk/nextjs/server";

export default async function Home() {
  // 1. Fetch Products from DB (Server Side = Fast)
  const products = await getProducts();
  
  // 2. Fetch User from Clerk
  const user = await currentUser();

  // 3. Serialize User (Convert to simple object)
  const serializedUser = user ? {
    id: user.id,
    imageUrl: user.imageUrl,
    primaryEmailAddress: {
      emailAddress: user.emailAddresses[0]?.emailAddress
    }
  } : null;

  // 4. Render the Client Component with data
  return (
    <ProductFeed 
      initialProducts={products} 
      user={serializedUser} 
    />
  );
}