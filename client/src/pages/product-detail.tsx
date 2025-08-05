import { useState, useEffect } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Star, Heart, ShoppingCart, Minus, Plus } from "lucide-react";
import type { Product } from "@shared/schema";

export default function ProductDetail() {
  const { id } = useParams();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();
  const queryClient = useQueryClient();
  
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedColor, setSelectedColor] = useState("");
  const [quantity, setQuantity] = useState(1);

  // Redirect to home if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
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
  }, [isAuthenticated, isLoading, toast]);

  const { data: product, isLoading: productLoading, error } = useQuery<Product>({
    queryKey: ["/api/products", id],
    retry: false,
  });

  if (error && isUnauthorizedError(error as Error)) {
    toast({
      title: "Unauthorized", 
      description: "You are logged out. Logging in again...",
      variant: "destructive",
    });
    setTimeout(() => {
      window.location.href = "/api/login";
    }, 500);
    return null;
  }

  const addToCartMutation = useMutation({
    mutationFn: async (data: { productId: string; quantity: number; size?: string; color?: string }) => {
      await apiRequest("POST", "/api/cart/items", data);
    },
    onSuccess: () => {
      toast({
        title: "Added to cart",
        description: "Product has been added to your cart.",
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

  const handleAddToCart = () => {
    if (!product) return;

    addToCartMutation.mutate({
      productId: product.id,
      quantity,
      size: selectedSize || undefined,
      color: selectedColor || undefined,
    });
  };

  const availableSizes = ["7", "8", "9", "10", "11", "12"];
  const availableColors = [
    { name: "Black", value: "#000000" },
    { name: "White", value: "#FFFFFF" },
    { name: "Red", value: "#DC2626" },
    { name: "Blue", value: "#2563EB" },
  ];

  if (productLoading) {
    return (
      <div className="py-8 bg-gray-50 min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card>
            <CardContent className="p-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-pulse">
                <div className="space-y-4">
                  <div className="aspect-square bg-gray-200 rounded-xl"></div>
                  <div className="grid grid-cols-4 gap-4">
                    {[...Array(4)].map((_, i) => (
                      <div key={i} className="aspect-square bg-gray-200 rounded-lg"></div>
                    ))}
                  </div>
                </div>
                <div className="space-y-6">
                  <div className="h-8 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  <div className="h-6 bg-gray-200 rounded w-1/4"></div>
                  <div className="h-20 bg-gray-200 rounded"></div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="py-8 bg-gray-50 min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card>
            <CardContent className="p-12 text-center">
              <h1 className="text-2xl font-bold mb-4">Product Not Found</h1>
              <p className="text-gray-600 mb-6">The product you're looking for doesn't exist.</p>
              <Button onClick={() => setLocation('/products')}>
                Back to Products
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="py-8 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Card>
          <CardContent className="p-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Product Images */}
              <div className="space-y-4">
                <div className="aspect-square overflow-hidden rounded-xl">
                  <img 
                    src={product.imageUrl} 
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="grid grid-cols-4 gap-4">
                  {[...Array(4)].map((_, i) => (
                    <button
                      key={i}
                      className="aspect-square rounded-lg overflow-hidden border-2 border-transparent hover:border-accent transition-colors"
                    >
                      <img 
                        src={product.imageUrl} 
                        alt={`${product.name} view ${i + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              </div>

              {/* Product Info */}
              <div className="space-y-6">
                <div>
                  <h1 className="text-3xl font-bold mb-2">{product.name}</h1>
                  <div className="flex items-center space-x-4 mb-4">
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                      ))}
                      <span className="ml-2 text-gray-600">4.8 (124 reviews)</span>
                    </div>
                  </div>
                  <p className="text-4xl font-bold text-accent mb-4">${product.price}</p>
                  <p className="text-gray-600">{product.description}</p>
                </div>

                {/* Category */}
                <div>
                  <Badge variant="secondary" className="capitalize">
                    {product.category}
                  </Badge>
                </div>

                {/* Size Selection */}
                <div>
                  <h3 className="font-semibold mb-3">Size</h3>
                  <div className="grid grid-cols-4 gap-3">
                    {availableSizes.map((size) => (
                      <Button
                        key={size}
                        variant={selectedSize === size ? "default" : "outline"}
                        className="h-12"
                        onClick={() => setSelectedSize(size)}
                      >
                        {size}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Color Selection */}
                <div>
                  <h3 className="font-semibold mb-3">Color</h3>
                  <div className="flex space-x-3">
                    {availableColors.map((color) => (
                      <button
                        key={color.name}
                        className={`w-10 h-10 rounded-full border-2 transition-all ${
                          selectedColor === color.name 
                            ? 'border-accent ring-2 ring-accent ring-opacity-50' 
                            : 'border-gray-300 hover:border-accent'
                        }`}
                        style={{ backgroundColor: color.value }}
                        onClick={() => setSelectedColor(color.name)}
                        title={color.name}
                      />
                    ))}
                  </div>
                </div>

                {/* Quantity */}
                <div>
                  <h3 className="font-semibold mb-3">Quantity</h3>
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center border border-gray-300 rounded-lg">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        disabled={quantity <= 1}
                      >
                        <Minus className="w-4 h-4" />
                      </Button>
                      <span className="px-4 py-2 border-x border-gray-300">{quantity}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setQuantity(quantity + 1)}
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                    <span className="text-gray-600">
                      In stock ({product.stock} available)
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="space-y-4">
                  <Button 
                    size="lg" 
                    className="w-full bg-accent hover:bg-accent/90"
                    onClick={handleAddToCart}
                    disabled={addToCartMutation.isPending || product.stock === 0}
                  >
                    <ShoppingCart className="w-5 h-5 mr-2" />
                    {addToCartMutation.isPending ? "Adding..." : "Add to Cart"}
                  </Button>
                  <Button variant="outline" size="lg" className="w-full">
                    <Heart className="w-5 h-5 mr-2" />
                    Add to Wishlist
                  </Button>
                </div>

                {/* Product Details */}
                <div className="border-t border-gray-200 pt-6">
                  <div className="space-y-4">
                    <details className="group">
                      <summary className="flex justify-between items-center cursor-pointer font-semibold">
                        Product Details
                        <svg className="w-5 h-5 group-open:rotate-180 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </summary>
                      <div className="mt-4 text-gray-600 space-y-2">
                        <p>• Premium materials and construction</p>
                        <p>• Comfortable all-day wear</p>
                        <p>• Durable and long-lasting</p>
                        <p>• Available in multiple sizes and colors</p>
                      </div>
                    </details>
                    
                    <Separator />
                    
                    <details className="group">
                      <summary className="flex justify-between items-center cursor-pointer font-semibold">
                        Shipping & Returns
                        <svg className="w-5 h-5 group-open:rotate-180 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </summary>
                      <div className="mt-4 text-gray-600 space-y-2">
                        <p>• Free shipping on orders over $75</p>
                        <p>• 30-day return policy</p>
                        <p>• Express shipping available</p>
                        <p>• Easy returns and exchanges</p>
                      </div>
                    </details>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
