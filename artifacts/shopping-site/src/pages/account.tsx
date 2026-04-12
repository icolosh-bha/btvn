import { Layout } from "@/components/layout";
import { useGetAccount, getGetAccountQueryKey, useUpdateAccount } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { User as UserIcon } from "lucide-react";

const accountSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").optional().or(z.literal("")),
  email: z.string().email("Invalid email address").optional().or(z.literal("")),
  phone: z.string().optional().or(z.literal("")),
  age: z.coerce.number().min(1, "Age must be valid").optional().or(z.literal(0)),
});

type AccountForm = z.infer<typeof accountSchema>;

export default function Account() {
  const { data: account, isLoading } = useGetAccount();
  const updateAccount = useUpdateAccount();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const form = useForm<AccountForm>({
    resolver: zodResolver(accountSchema),
    defaultValues: { name: "", email: "", phone: "", age: 0 },
  });

  useEffect(() => {
    if (account) {
      form.reset({
        name: account.name || "",
        email: account.email || "",
        phone: account.phone || "",
        age: account.age || 0,
      });
    }
  }, [account, form]);

  const onSubmit = (data: AccountForm) => {
    const payload = {
      name: data.name || undefined,
      email: data.email || undefined,
      phone: data.phone || undefined,
      age: data.age || undefined,
    };
    
    updateAccount.mutate(
      { data: payload },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getGetAccountQueryKey() });
          toast({ title: "Account updated", description: "Your profile has been saved successfully." });
        },
        onError: () => {
          toast({ title: "Error", description: "Failed to update profile.", variant: "destructive" });
        }
      }
    );
  };

  if (isLoading) {
    return <Layout><div className="animate-pulse bg-card h-96 rounded-2xl max-w-2xl mx-auto border border-border" /></Layout>;
  }

  return (
    <Layout>
      <div className="max-w-2xl mx-auto space-y-8">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center">
            <UserIcon className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">My Account</h1>
            <p className="text-muted-foreground">Manage your personal information</p>
          </div>
        </div>

        <Card className="border-border shadow-sm">
          <CardHeader>
            <CardTitle>Profile Details</CardTitle>
            <CardDescription>Update your contact information</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-6 bg-muted/50 p-4 rounded-xl border border-border">
              <p className="text-sm font-medium text-muted-foreground mb-1">Username (Immutable)</p>
              <p className="font-semibold">{account?.username}</p>
            </div>
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                <div className="grid md:grid-cols-2 gap-5">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Jane Doe" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email Address</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="jane@example.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone Number</FormLabel>
                        <FormControl>
                          <Input placeholder="+1 (555) 000-0000" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="age"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Age</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="25" {...field} value={field.value || ""} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <div className="pt-4 flex justify-end">
                  <Button type="submit" size="lg" disabled={updateAccount.isPending} className="w-full md:w-auto px-8 rounded-xl">
                    {updateAccount.isPending ? "Saving..." : "Save Changes"}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
