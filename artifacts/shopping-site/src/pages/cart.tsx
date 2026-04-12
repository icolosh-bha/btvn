import { useState } from "react";
import { Layout } from "@/components/layout";
import { useGetCart, getGetCartQueryKey, useUpdateCartItem, useRemoveFromCart, useCheckout } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Minus, Plus, Trash2, ShoppingBag, CreditCard, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link } from "wouter";

const checkoutSchema = z.object({
  bankName: z.string().min(1, "Bank name is required"),
  accountNumber: z.string().min(8, "Account number must be at least 8 digits"),
  accountHolder: z.string().min(1, "Account holder name is required"),
});

export default function Cart() {
  const { data: cart, isLoading } = useGetCart();
  const updateCart = useUpdateCartItem();
  const removeCart = useRemoveFromCart();
  const checkout = useCheckout();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const form = useForm<z.infer<typeof checkoutSchema>>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: { bankName: "", accountNumber: "", accountHolder: "" },
  });

  const handleQuantity = (productId: number, current: number, delta: number) => {
    const newQuantity = current + delta;
    if (newQuantity < 1) {
      handleRemove(productId);
      return;
    }
    updateCart.mutate(
      { productId, data: { quantity: newQuantity } },
      { onSuccess: () => queryClient.invalidateQueries({ queryKey: getGetCartQueryKey() }) }
    );
  };

  const handleRemove = (productId: number) => {
    removeCart.mutate(
      { productId },
      { 
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getGetCartQueryKey() });
          toast({ description: "Item removed from cart" });
        }
      }
    );
  };

  const onCheckout = (data: z.infer<typeof checkoutSchema>) => {
    checkout.mutate(
      { data },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getGetCartQueryKey() });
          setIsCheckoutOpen(false);
          setShowSuccess(true);
          form.reset();
        },
        onError: () => {
          toast({ title: "Checkout failed", variant: "destructive" });
        }
      }
    );
  };

  if (isLoading) {
    return <Layout><div className="animate-pulse space-y-4"><div className="h-40 bg-muted rounded-xl"/><div className="h-40 bg-muted rounded-xl"/></div></Layout>;
  }

  if (showSuccess) {
    return (
      <Layout>
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="max-w-md mx-auto text-center py-20"
        >
          <div className="w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-12 h-12" />
          </div>
          <h2 className="text-3xl font-bold mb-4">Payment Successful!</h2>
          <p className="text-muted-foreground mb-8">Your order has been placed and is being processed. Thank you for shopping with ShopNow.</p>
          <Link href="/shop">
            <Button className="w-full h-12 text-lg rounded-xl">Continue Shopping</Button>
          </Link>
        </motion.div>
      </Layout>
    );
  }

  const isEmpty = !cart?.items.length;

  return (
    <Layout>
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Your Cart</h1>
        
        {isEmpty ? (
          <div className="text-center py-20 bg-card rounded-2xl border border-dashed">
            <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
              <ShoppingBag className="w-10 h-10 text-muted-foreground" />
            </div>
            <h3 className="text-2xl font-semibold mb-2">Your cart is empty</h3>
            <p className="text-muted-foreground mb-8">Looks like you haven't added anything yet.</p>
            <Link href="/shop">
              <Button size="lg" className="rounded-xl px-8">Start Shopping</Button>
            </Link>
          </div>
        ) : (
          <div className="grid md:grid-cols-3 gap-8">
            <div className="md:col-span-2 space-y-4">
              <AnimatePresence>
                {cart.items.map((item) => (
                  <motion.div
                    key={item.productId}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="flex gap-4 bg-card p-4 rounded-2xl border border-border items-center"
                  >
                    <div className="w-24 h-24 bg-muted rounded-xl overflow-hidden shrink-0">
                      <img src={item.product.imageUrl} alt={item.product.name} className="w-full h-full object-cover" />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-lg truncate">{item.product.name}</h4>
                      <p className="text-primary font-bold">${item.product.price.toFixed(2)}</p>
                    </div>

                    <div className="flex items-center gap-3 bg-muted/50 p-1 rounded-lg">
                      <Button variant="ghost" size="icon" className="h-8 w-8 rounded-md" onClick={() => handleQuantity(item.productId, item.quantity, -1)} disabled={updateCart.isPending}>
                        <Minus className="w-4 h-4" />
                      </Button>
                      <span className="w-4 text-center font-medium">{item.quantity}</span>
                      <Button variant="ghost" size="icon" className="h-8 w-8 rounded-md" onClick={() => handleQuantity(item.productId, item.quantity, 1)} disabled={updateCart.isPending}>
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>

                    <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 h-10 w-10 rounded-xl" onClick={() => handleRemove(item.productId)} disabled={removeCart.isPending}>
                      <Trash2 className="w-5 h-5" />
                    </Button>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            <div className="md:col-span-1">
              <div className="bg-card p-6 rounded-2xl border border-border sticky top-24">
                <h3 className="text-xl font-bold mb-6">Order Summary</h3>
                <div className="space-y-4 mb-6">
                  <div className="flex justify-between text-muted-foreground">
                    <span>Subtotal</span>
                    <span>${cart.total.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>Shipping</span>
                    <span>Free</span>
                  </div>
                  <div className="h-px bg-border my-4" />
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total</span>
                    <span className="text-primary">${cart.total.toFixed(2)}</span>
                  </div>
                </div>
                
                <Button 
                  size="lg" 
                  className="w-full h-14 text-lg rounded-xl" 
                  onClick={() => setIsCheckoutOpen(true)}
                >
                  Proceed to Checkout
                </Button>
              </div>
            </div>
          </div>
        )}

        <Dialog open={isCheckoutOpen} onOpenChange={setIsCheckoutOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <CreditCard className="w-5 h-5" />
                Payment Details
              </DialogTitle>
              <DialogDescription>
                Enter your banking details to complete the purchase of ${cart?.total.toFixed(2)}.
              </DialogDescription>
            </DialogHeader>
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onCheckout)} className="space-y-4 mt-4">
                <FormField
                  control={form.control}
                  name="bankName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Bank Name</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. Chase Bank" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="accountNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Account Number</FormLabel>
                      <FormControl>
                        <Input placeholder="1234567890" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="accountHolder"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Account Holder Name</FormLabel>
                      <FormControl>
                        <Input placeholder="John Doe" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full h-12 mt-6 text-lg" disabled={checkout.isPending}>
                  {checkout.isPending ? "Processing..." : `Pay $${cart?.total.toFixed(2)}`}
                </Button>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
}
