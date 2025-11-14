import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { formatCurrency } from '@/lib/utils'
import type { Product } from '@/types'

type ProductCardProps = {
  product: Product
  onAddToCart?: (product: Product) => void
}

export function ProductCard({ product, onAddToCart }: ProductCardProps) {
  const { name, description, price, stock, image } = product

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      {/* Product Image */}
      <div className="aspect-square overflow-hidden bg-muted">
        {image ? (
          <img
            src={image}
            alt={name}
            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted-foreground">
            No Image
          </div>
        )}
      </div>

      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-lg line-clamp-1">{name}</CardTitle>
          {stock < 10 && stock > 0 && (
            <Badge variant="destructive" className="shrink-0">
              Low Stock
            </Badge>
          )}
          {stock === 0 && (
            <Badge variant="outline" className="shrink-0">
              Out of Stock
            </Badge>
          )}
        </div>
        <CardDescription className="line-clamp-2">{description}</CardDescription>
      </CardHeader>

      <CardContent>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold text-primary">
            {formatCurrency(price)}
          </span>
          <span className="text-sm text-muted-foreground">
            {stock > 0 ? `${stock} in stock` : 'Out of stock'}
          </span>
        </div>
      </CardContent>

      <CardFooter>
        <Button
          className="w-full"
          disabled={stock === 0}
          onClick={() => onAddToCart?.(product)}
        >
          {stock === 0 ? 'Out of Stock' : 'Add to Cart'}
        </Button>
      </CardFooter>
    </Card>
  )
}
