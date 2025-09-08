"use client";

import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, LoginSchemaType } from "@/schemas/loginSchema";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User, Shield } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

export default function Component() {
  const router = useRouter();
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"admin" | "editor">("admin");

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<LoginSchemaType>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      loginType: "admin",
    },
  });


  const handleTabChange = (value: string) => {
    const loginType = value as "admin" | "editor";
    setActiveTab(loginType);
    setValue("loginType", loginType);
  };

  const onSubmit = async (data: LoginSchemaType) => {
    try {
      setLoading(true);
      
      // Determine API endpoint based on login type
      const apiEndpoint = data.loginType === "admin" 
        ? `${process.env.NEXT_PUBLIC_API_URL}/api/v1/auth/login/`
        : `${process.env.NEXT_PUBLIC_API_URL}/api/v1/editors/login/`;

      const response = await axios.post(apiEndpoint, {
        email: data.email,
        password: data.password,
      });

      console.log("login response:", response.data);
      const token = response.data.token;
      const userType = data.loginType;
      
      toast.success(`${userType === "admin" ? "Admin" : "Editor"} login successful`);

      // Store user data using auth hook
      login({
        token,
        userType,
        email: data.email,
      });
      
      setLoading(false);
      
      // Redirect based on user type
      if (userType === "admin") {
        setTimeout(() => {
          router.replace("/dashboard");
        }, 2000);
        
      } else {
        setTimeout(() => {
          router.replace("/dashboard");
        }, 2000);
      }
    } catch (error: any) {
      setLoading(false);
      console.log("Login failed:", error.response?.data.message);
      toast.error(error.response?.data.message || "Login failed");
    }
  };

  return (
    <div className="w-full min-h-screen lg:grid lg:grid-cols-2">
      <div className="relative w-full h-screen">
        <Image
          src="https://images.unsplash.com/photo-1675872217301-ecaf886173d2?q=80&w=736"
          alt="Sleek abstract background"
          fill
          className="object-cover dark:brightness-[0.2] dark:grayscale"
          priority
        />
      </div>

      <div className="flex items-center justify-center py-12">
        <div className="mx-auto grid w-[400px] gap-6">
          <div className="grid gap-2 text-center">
            <h1 className="text-3xl font-bold">Login</h1>
            <p className="text-muted-foreground">
              Choose your login type and enter your credentials
            </p>
          </div>

          <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="admin" className="flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Admin
              </TabsTrigger>
              <TabsTrigger value="editor" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Editor
              </TabsTrigger>
            </TabsList>

            <TabsContent value="admin" className="mt-6">
              <div className="grid gap-2 text-center mb-4">
                <h2 className="text-xl font-semibold">Admin Access</h2>
                <p className="text-sm text-muted-foreground">
                  Full dashboard access and management capabilities
                </p>
              </div>
              
              <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4">
                <input type="hidden" {...register("loginType")} value="admin" />
                
                {/* Email */}
                <div className="grid gap-2">
                  <Label htmlFor="admin-email">Email</Label>
                  <Input
                    id="admin-email"
                    type="email"
                    placeholder="admin@example.com"
                    {...register("email")}
                  />
                  {errors.email && (
                    <p className="text-red-500 text-sm">{errors.email.message}</p>
                  )}
                </div>

                {/* Password */}
                <div className="grid gap-2">
                  <Label htmlFor="admin-password">Password</Label>
                  <Input 
                    id="admin-password" 
                    type="password" 
                    placeholder="Enter your password"
                    {...register("password")} 
                  />
                  {errors.password && (
                    <p className="text-red-500 text-sm">
                      {errors.password.message}
                    </p>
                  )}
                </div>

                {/* Submit */}
                <Button
                  disabled={loading}
                  variant="blue"
                  type="submit"
                  className="w-full"
                >
                  {loading ? "Logging in..." : "Login"}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="editor" className="mt-6">
              <div className="grid gap-2 text-center mb-4">
                <h2 className="text-xl font-semibold">Editor Access</h2>
                <p className="text-sm text-muted-foreground">
                  Content creation and editing capabilities
                </p>
              </div>
              
              <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4">
                <input type="hidden" {...register("loginType")} value="editor" />
                
                {/* Email */}
                <div className="grid gap-2">
                  <Label htmlFor="editor-email">Email</Label>
                  <Input
                    id="editor-email"
                    type="email"
                    placeholder="editor@example.com"
                    {...register("email")}
                  />
                  {errors.email && (
                    <p className="text-red-500 text-sm">{errors.email.message}</p>
                  )}
                </div>

                {/* Password */}
                <div className="grid gap-2">
                  <Label htmlFor="editor-password">Password</Label>
                  <Input 
                    id="editor-password" 
                    type="password" 
                    placeholder="Enter your password"
                    {...register("password")} 
                  />
                  {errors.password && (
                    <p className="text-red-500 text-sm">
                      {errors.password.message}
                    </p>
                  )}
                </div>

                {/* Submit */}
                <Button
                  disabled={loading}
                  variant="blue"
                  type="submit"
                  className="w-full"
                >
                  {loading ? "Logging in..." : "Login"}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}