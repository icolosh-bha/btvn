import { Link, useLocation, Redirect } from "wouter";
import { useGetMe, useGetCart, useLogout } from "@workspace/api-client-react";
import { ShoppingBag, User as UserIcon, LogOut, PackageSearch } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";

export function Layout({ children }: { children: React.ReactNode }) {
  const [location, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const { data: user, isError, isPending } = useGetMe({ query: { retry: false } });
  const { data: cart } = useGetCart({ query: { enabled: !!user } });
  const logout = useLogout();

  const handleLogout = () => {
    logout.mutate(undefined, {
      onSuccess: () => {
        queryClient.clear();
        setLocation("/login");
      }
    });
  };

  if (isError) {
    return <Redirect to="/login" />;
  }

  if (!user) {
    return <div className="min-h-screen bg-background flex items-center justify-center">Loading...</div>;
  }

  const cartItemCount = cart?.items.reduce((sum, item) => sum + item.quantity, 0) || 0;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="sticky top-0 z-50 w-full border-b bg-card/80 backdrop-blur-md">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/shop" className="flex items-center gap-2 text-primary font-bold text-xl hover:opacity-80 transition-opacity">
            <PackageSearch className="w-6 h-6" />
            ShopNow
          </Link>
          
          <nav className="flex items-center gap-1 md:gap-4">
            <Link href="/shop" className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${location === '/shop' ? 'text-primary bg-primary/10' : 'text-muted-foreground hover:text-foreground hover:bg-muted'}`}>
              Shop
            </Link>
            <Link href="/cart" className={`relative flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${location === '/cart' ? 'text-primary bg-primary/10' : 'text-muted-foreground hover:text-foreground hover:bg-muted'}`}>
              <ShoppingBag className="w-4 h-4" />
              <span className="hidden md:inline">Cart</span>
              {cartItemCount > 0 && (
                <motion.span 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  key={cartItemCount}
                  className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground"
                >
                  {cartItemCount}
                </motion.span>
              )}
            </Link>
            <Link href="/account" className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${location === '/account' ? 'text-primary bg-primary/10' : 'text-muted-foreground hover:text-foreground hover:bg-muted'}`}>
              <UserIcon className="w-4 h-4" />
              <span className="hidden md:inline">Account</span>
            </Link>
            <Button variant="ghost" size="sm" onClick={handleLogout} className="text-muted-foreground hover:text-destructive">
              <LogOut className="w-4 h-4 md:mr-2" />
              <span className="hidden md:inline">Logout</span>
            </Button>
          </nav>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
        >
          {children}
        </motion.div>
      </main>
    </div>
  );
}
