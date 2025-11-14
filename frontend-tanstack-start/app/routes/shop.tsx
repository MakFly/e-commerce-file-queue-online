import { createFileRoute } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { useAuth } from '@/hooks/useAuth'
import { ProductCard } from '@/components/ProductCard'
import { toast } from 'sonner'
import type { Product } from '@/types'

export const Route = createFileRoute('/shop')({
  component: ShopPage,
})

function ShopPage() {
  const { token } = useAuth()

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['products'],
    queryFn: () => api.getProducts(token),
  })

  const handleAddToCart = (product: Product) => {
    // TODO: Implement cart functionality
    toast.success(`${product.name} added to cart!`)
    console.log('Add to cart:', product)
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-96 bg-muted animate-pulse rounded-lg" />
          ))}
        </div>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h2 className="text-2xl font-bold text-destructive mb-4">Error Loading Products</h2>
        <p className="text-muted-foreground">
          {error instanceof Error ? error.message : 'Failed to load products'}
        </p>
      </div>
    )
  }

  const products = data?.products || []

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Shop</h1>
        <p className="text-muted-foreground">
          Browse our collection of products
        </p>
      </div>

      {products.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-xl text-muted-foreground">No products available</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onAddToCart={handleAddToCart}
            />
          ))}
        </div>
      )}
    </div>
  )
}
