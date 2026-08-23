import { ProductCard } from "@/components/marketplace/ProductCard";
import type { ProductItem } from "@/types/marketplace";

export function TrendingProducts({ products }: { products: ProductItem[] }) {
  return <>{products.map((product) => <ProductCard key={product.productId ?? product.name} product={product} />)}</>;
}
