import { ProductCard } from "@/components/marketplace/ProductCard";
import type { ProductItem } from "@/types/marketplace";

interface CategoryProductsGridProps {
  products: ProductItem[];
}

export function CategoryProductsGrid({ products }: CategoryProductsGridProps) {
  if (!products.length) {
    return null;
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {products.map((product) => (
        <ProductCard key={product.productId ?? product._id ?? product.name} product={product} />
      ))}
    </div>
  );
}
