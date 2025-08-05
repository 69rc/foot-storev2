import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest } from "@/lib/queryClient";
import { formatPrice } from "@/lib/currency";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Heart, ShoppingCart } from "lucide-react";
import type { Product } from "@shared/schema";

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isLiked, setIsLiked] = useState(false);

  const addToCartMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", "/api/cart/items", {
        productId: product.id,
        quantity: 1,
      });
    },
    onSuccess: () => {
      toast({
        title: "Added to cart",
        description: `${product.name} has been added to your cart.`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to add product to cart. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    addToCartMutation.mutate();
  };

  const handleWishlist = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsLiked(!isLiked);
    toast({
      title: isLiked ? "Removed from wishlist" : "Added to wishlist",
      description: `${product.name} has been ${isLiked ? "removed from" : "added to"} your wishlist.`,
    });
  };

  const handleCardClick = () => {
    setLocation(`/products/${product.id}`);
  };

  // Determine if product has a sale/discount
  const originalPrice = parseFloat(product.price);
  const isOnSale = product.category === "formal"; // Simple logic for demo - formal shoes on sale
  const salePrice = isOnSale ? originalPrice * 0.75 : originalPrice;

  return (
    <Card 
      className="product-card-hover overflow-hidden group cursor-pointer bg-white shadow-sm hover:shadow-md"
      onClick={handleCardClick}
    >
      <div className="relative overflow-hidden">
        <div className="image-zoom">
          <img 
            src={product.imageUrl} 
            alt={product.name}
            className="w-full h-64 object-cover transition-transform duration-300"
          />
        </div>
        
        {/* Badges */}
        <div className="absolute top-4 left-4">
          {product.stock === 0 ? (
            <Badge variant="destructive">Out of Stock</Badge>
          ) : product.stock < 5 ? (
            <Badge className="bg-orange-500 text-white">Low Stock</Badge>
          ) : isOnSale ? (
            <Badge className="bg-green-500 text-white">Sale</Badge>
          ) : product.createdAt && new Date(product.createdAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) ? (
            <Badge className="bg-blue-500 text-white">New</Badge>
          ) : null}
        </div>
        
        {/* Wishlist Button */}
        <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button 
            variant="secondary"
            size="sm"
            className="bg-white/90 backdrop-blur-sm shadow-md hover:bg-white p-2 h-auto"
            onClick={handleWishlist}
          >
            <Heart 
              className={`w-4 h-4 ${isLiked ? 'fill-red-500 text-red-500' : 'text-gray-600'}`} 
            />
          </Button>
        </div>
      </div>
      
      <CardContent className="p-6">
        <div className="space-y-3">
          <div>
            <h3 className="font-semibold text-lg text-gray-900 line-clamp-1">
              {product.name}
            </h3>
            <p className="text-gray-600 text-sm mt-1 line-clamp-2">
              {product.description}
            </p>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              {isOnSale ? (
                <>
                  <span className="text-xl font-bold text-gray-900">
                    {formatPrice(salePrice)}
                  </span>
                  <span className="text-sm text-gray-500 line-through">
                    {formatPrice(originalPrice)}
                  </span>
                </>
              ) : (
                <span className="text-xl font-bold text-gray-900">
                  {formatPrice(product.price)}
                </span>
              )}
            </div>
            
            <Button 
              size="sm"
              className="bg-accent hover:bg-accent/90 text-white"
              onClick={handleAddToCart}
              disabled={addToCartMutation.isPending || product.stock === 0}
            >
              {addToCartMutation.isPending ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <ShoppingCart className="w-4 h-4 mr-2" />
                  Add to Cart
                </>
              )}
            </Button>
          </div>
          
          {/* Category and Stock Info */}
          <div className="flex items-center justify-between text-xs text-gray-500">
            <Badge variant="outline" className="capitalize">
              {product.category}
            </Badge>
            <span>{product.stock} in stock</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
