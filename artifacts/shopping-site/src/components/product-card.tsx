import { Product } from "@workspace/api-client-react/src/generated/api.schemas";
import { useAddToCart, getGetCartQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { StarRating } from "./star-rating";
import { motion } from "framer-motion";
import { ShoppingCart } from "lucide-react";
import { useState } from "react";

export function ProductCard({ product }: { product: Product }) {
  const addToCart = useAddToCart();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [isAdding, setIsAdding] = useState(false);

  const handleBuy = () => {
    setIsAdding(true);
    addToCart.mutate(
      { data: { productId: product.id, quantity: 1 } },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getGetCartQueryKey() });
          toast({
            title: "Added to cart",
            description: `${product.name} has been added to your cart.`,
          });
          setTimeout(() => setIsAdding(false), 500);
        },
        onError: () => {
          toast({
            title: "Failed to add",
            description: "Please try again.",
            variant: "destructive",
          });
          setIsAdding(false);
        }
      }
    );
  };

  return (
    <motion.div 
      whileHover={{ y: -4 }}
      className="group flex flex-col bg-card rounded-2xl overflow-hidden border border-border shadow-sm hover:shadow-md transition-all"
    >
      <div className="aspect-[4/3] bg-muted relative overflow-hidden">
        <img 
          src={product.imageUrl} 
          alt={product.name}
          className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        <div className="absolute top-3 right-3 bg-background/90 backdrop-blur-sm px-2 py-1 rounded-full text-xs font-semibold text-primary">
          {product.category}
        </div>
      </div>
      
      <div className="p-5 flex flex-col flex-1">
        <div className="flex justify-between items-start mb-2 gap-2">
          <h3 className="font-semibold text-lg leading-tight line-clamp-2 text-card-foreground">
            {product.name}
          </h3>
          <span className="font-bold text-lg text-primary whitespace-nowrap">
            ${product.price.toFixed(2)}
          </span>
        </div>
        
        <div className="mb-3">
          <StarRating rating={product.rating} />
        </div>
        
        <p className="text-sm text-muted-foreground line-clamp-2 mb-6 flex-1">
          {product.description}
        </p>
        
        <Button 
          onClick={handleBuy}
          disabled={addToCart.isPending || isAdding}
          className="w-full relative overflow-hidden rounded-xl"
        >
          <motion.div
            initial={false}
            animate={isAdding ? { y: -40, opacity: 0 } : { y: 0, opacity: 1 }}
            className="flex items-center gap-2"
          >
            <ShoppingCart className="w-4 h-4" />
            Add to Cart
          </motion.div>
          
          <motion.div
            initial={{ y: 40, opacity: 0 }}
            animate={isAdding ? { y: 0, opacity: 1 } : { y: 40, opacity: 0 }}
            className="absolute inset-0 flex items-center justify-center bg-primary text-primary-foreground"
          >
            Added!
          </motion.div>
        </Button>
      </div>
    </motion.div>
  );
}
