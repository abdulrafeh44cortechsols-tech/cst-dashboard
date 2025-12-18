"use client";

import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, LoginSchemaType } from "@/schemas/loginSchema";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User, Shield, Clock, AlertTriangle, Eye, EyeOff } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useAuthContext } from "@/components/auth-provider";
import { setAuthUser } from "@/lib/auth";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  authService,
  type LoginResponse,
  type OTPVerifyResponse,
} from "@/services/auth";

export default function Component() {
  // Password visibility state for admin and editor
  const [showAdminPassword, setShowAdminPassword] = useState(false);
  const [showEditorPassword, setShowEditorPassword] = useState(false);
  const router = useRouter();
  const { login } = useAuthContext();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"admin" | "editor">("admin");
  const [showOTPForm, setShowOTPForm] = useState(false);
  const [otpEmail, setOtpEmail] = useState("");
  const [otpExpiresIn, setOtpExpiresIn] = useState(0);
  const [otp, setOtp] = useState("");
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpLoginType, setOtpLoginType] = useState<"admin" | "editor">("admin");
  const [lockoutData, setLockoutData] = useState<{
    locked: boolean;
    duration: number;
    timeRemaining: number;
  }>({ locked: false, duration: 0, timeRemaining: 0 });
  const [remainingAttempts, setRemainingAttempts] = useState<number | null>(
    null
  );

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

  // Load lockout data from localStorage on component mount
  useEffect(() => {
    const { lockout, attempts } = loadLockoutDataForType(activeTab);
    setLockoutData(lockout);
    setRemainingAttempts(attempts);
  }, [activeTab]);

  // Handle lockout countdown and localStorage sync
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (lockoutData.locked && lockoutData.timeRemaining > 0) {
      interval = setInterval(() => {
        setLockoutData((prev) => {
          const newTimeRemaining = prev.timeRemaining - 1;

          if (newTimeRemaining <= 0) {
            // Clear lockout from localStorage when expired
            clearAuthStorage(activeTab);
            return { locked: false, duration: 0, timeRemaining: 0 };
          }

          // Update localStorage with new remaining time
          if (typeof window !== "undefined") {
            const lockoutInfo = {
              duration: prev.duration,
              timestamp: Date.now() - (prev.duration - newTimeRemaining) * 1000,
            };
            localStorage.setItem(
              `lockout_${activeTab}`,
              JSON.stringify(lockoutInfo)
            );
          }

          return { ...prev, timeRemaining: newTimeRemaining };
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [lockoutData.locked, lockoutData.timeRemaining, activeTab]);

  const handleTabChange = (value: string) => {
    const loginType = value as "admin" | "editor";
    setActiveTab(loginType);
    setValue("loginType", loginType);
    // Reset OTP form when switching tabs
    setShowOTPForm(false);
    setOtp("");
    setOtpEmail("");
    setOtpExpiresIn(0);
    setOtpLoginType(loginType);

    // Load lockout data for the new tab
    const { lockout, attempts } = loadLockoutDataForType(loginType);
    setLockoutData(lockout);
    setRemainingAttempts(attempts);
  };

  const onSubmit = async (data: LoginSchemaType) => {
    if (lockoutData.locked) {
      toast.error("Account is locked. Please wait before trying again.");
      return;
    }

    try {
      setLoading(true);

      let response;

      if (data.loginType === "admin") {
        response = await authService.adminLogin({
          email: data.email,
          password: data.password,
        });
      } else {
        response = await authService.editorLogin({
          email: data.email,
          password: data.password,
        });
      }

      console.log("login response:", response);

      if (response.success) {
        // Clear lockout and attempts data on successful login
        clearAuthStorage(data.loginType);

        // Both admin and editor now require OTP verification
        setShowOTPForm(true);
        setOtpEmail(response.email || data.email);
        setOtpExpiresIn(response.expires_in_minutes || 2);
        setOtpLoginType(data.loginType);
        setRemainingAttempts(null);
        setLockoutData({ locked: false, duration: 0, timeRemaining: 0 });
        toast.success(response.message);
      }
    } catch (error: any) {
      console.log("Login failed:", error);
      const errorData = error as LoginResponse;

      if (errorData) {
        if (errorData.locked) {
          // Account is locked - store in localStorage
          const lockoutDuration = errorData.lockout_duration || 60;
          storeLockoutData(data.loginType, lockoutDuration);

          setLockoutData({
            locked: true,
            duration: lockoutDuration,
            timeRemaining: lockoutDuration,
          });
          setRemainingAttempts(null);
          toast.error(errorData.message);
        } else if (errorData.remaining_attempts !== undefined) {
          // Invalid credentials with remaining attempts - store attempts
          storeAttempts(data.loginType, errorData.remaining_attempts);
          setRemainingAttempts(errorData.remaining_attempts);
          toast.error(errorData.message);
        } else {
          toast.error(errorData.message || "Login failed");
        }
      } else {
        toast.error("Login failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleOTPSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!otp || otp.length !== 6) {
      toast.error("Please enter a valid 6-digit OTP");
      return;
    }

    try {
      setOtpLoading(true);

      // Use appropriate OTP verification method based on login type
      const response =
        otpLoginType === "admin"
          ? await authService.verifyOTP({
              email: otpEmail,
              otp: otp.toUpperCase(), // Convert to uppercase as specified
            })
          : await authService.verifyEditorOTP({
              email: otpEmail,
              otp: otp.toUpperCase(), // Convert to uppercase as specified
            });

      console.log("OTP verification response:", response);

      if (response.success && response.token) {
        // OTP verified successfully
        toast.success(response.message);

        // Create auth user object
        const authUser = {
          token: response.token,
          userType: response.user?.is_admin
            ? "admin"
            : ("editor" as "admin" | "editor"),
          email: response.user?.email || otpEmail,
          userId: response.user?.id,
          username: response.user?.username,
          isAdmin: response.user?.is_admin,
        };

        // Store in localStorage
        setAuthUser(authUser);

        // Update context
        login(authUser);

        // Redirect to dashboard
        setTimeout(() => {
          router.replace("/dashboard");
        }, 1000);
      }
    } catch (error: any) {
      console.log("OTP verification failed:", error);
      const errorData = error as OTPVerifyResponse;
      toast.error(errorData?.message || "OTP verification failed");

      // If OTP is invalid/expired, allow user to retry or go back to login
      if (
        errorData?.message?.includes("expired") ||
        errorData?.message?.includes("does not exist")
      ) {
        setOtp("");
      }
    } finally {
      setOtpLoading(false);
    }
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  // Helper functions for localStorage management
  const clearAuthStorage = (loginType: string) => {
    if (typeof window !== "undefined") {
      localStorage.removeItem(`lockout_${loginType}`);
      localStorage.removeItem(`attempts_${loginType}`);
    }
  };

  const storeLockoutData = (loginType: string, duration: number) => {
    if (typeof window !== "undefined") {
      const lockoutInfo = {
        duration,
        timestamp: Date.now(),
      };
      localStorage.setItem(`lockout_${loginType}`, JSON.stringify(lockoutInfo));
      localStorage.removeItem(`attempts_${loginType}`);
    }
  };

  const storeAttempts = (loginType: string, attempts: number) => {
    if (typeof window !== "undefined") {
      localStorage.setItem(`attempts_${loginType}`, attempts.toString());
    }
  };

  const loadLockoutDataForType = (loginType: string) => {
    if (typeof window === "undefined")
      return {
        lockout: { locked: false, duration: 0, timeRemaining: 0 },
        attempts: null,
      };

    let lockoutState = { locked: false, duration: 0, timeRemaining: 0 };
    let attemptsState = null;

    // Load lockout data
    const storedLockout = localStorage.getItem(`lockout_${loginType}`);
    if (storedLockout) {
      try {
        const parsedData = JSON.parse(storedLockout);
        const now = Date.now();
        const timeElapsed = Math.floor((now - parsedData.timestamp) / 1000);
        const remainingTime = Math.max(0, parsedData.duration - timeElapsed);

        if (remainingTime > 0) {
          lockoutState = {
            locked: true,
            duration: parsedData.duration,
            timeRemaining: remainingTime,
          };
        } else {
          localStorage.removeItem(`lockout_${loginType}`);
        }
      } catch (error) {
        console.error("Error parsing lockout data:", error);
        localStorage.removeItem(`lockout_${loginType}`);
      }
    }

    // Load attempts data
    const storedAttempts = localStorage.getItem(`attempts_${loginType}`);
    if (storedAttempts) {
      attemptsState = parseInt(storedAttempts);
    }

    return { lockout: lockoutState, attempts: attemptsState };
  };

  const goBackToLogin = () => {
    setShowOTPForm(false);
    setOtp("");
    setOtpEmail("");
    setOtpExpiresIn(0);
    setOtpLoginType("admin");
  };

  if (showOTPForm) {
    return (
      <div className="w-full px-4 lg:px-0 bg-gray-50 min-h-screen flex justify-center items-center lg:flex-row lg:grid lg:grid-cols-2">

        <div className="hidden lg:block relative w-full h-screen">
          <Image
            src="https://images.unsplash.com/photo-1675872217301-ecaf886173d2?q=80&w=736"
            alt="Sleek abstract background"
            fill
            className="object-cover dark:brightness-[0.2] dark:grayscale"
            priority
          />
        </div>

        <div className="flex items-center px-6 bg-white rounded-lg shadow-md mx-auto justify-center py-12 ">
          <div className="mx-auto grid md:w-[400px] w-full gap-6">
            <div className="grid gap-2 text-center">
              <h1 className="text-3xl font-bold">Enter OTP</h1>
              <p className="text-muted-foreground">
                We've sent a 6-digit code to {otpEmail}
              </p>
              <p className="text-sm text-blue-600 font-medium">
                {otpLoginType === "admin" ? "Admin" : "Editor"} Login
                Verification
              </p>
              {otpExpiresIn > 0 && (
                <p className="text-sm text-orange-600">
                  OTP expires in {otpExpiresIn} minutes
                </p>
              )}
            </div>

            <form onSubmit={handleOTPSubmit} className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="otp">Enter OTP</Label>
                <Input
                  id="otp"
                  type="text"
                  placeholder="Enter 6-digit OTP"
                  value={otp}
                  onChange={(e) =>
                    setOtp(e.target.value.toUpperCase().slice(0, 6))
                  }
                  className="text-center text-lg font-mono tracking-widest"
                  maxLength={6}
                />
              </div>

              <Button
                disabled={otpLoading || otp.length !== 6}
                variant="blue"
                type="submit"
                className="w-full"
              >
                {otpLoading ? "Verifying..." : "Verify OTP"}
              </Button>

              <Button
                type="button"
                variant="outline"
                onClick={goBackToLogin}
                className="w-full"
              >
                Back to Login
              </Button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full px-4 lg:px-0 bg-gray-50 min-h-screen flex justify-center items-center lg:flex-row lg:grid lg:grid-cols-2">
      <div className="hidden lg:block relative w-full h-screen">
        <Image
          src="https://images.unsplash.com/photo-1675872217301-ecaf886173d2?q=80&w=736"
          alt="Sleek abstract background"
          fill
          className="object-cover dark:brightness-[0.2] dark:grayscale"
          priority
        />
      </div>

      <div className="flex items-center px-6 bg-white rounded-lg shadow-md mx-auto justify-center py-12 ">
        <div className="mx-auto grid md:w-[400px] w-full gap-6">
          <div className="grid gap-2 text-center">
            <h1 className="text-3xl font-bold">Login</h1>
            <p className="text-muted-foreground">
              Choose your login type and enter your credentials
            </p>
          </div>

          {/* Account Lockout Alert */}
          {lockoutData.locked && (
            <Alert className="border-red-200 bg-red-50">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800">
                Account locked. Try again in{" "}
                {formatTime(lockoutData.timeRemaining)}
              </AlertDescription>
            </Alert>
          )}

          {/* Remaining Attempts Alert */}
          {remainingAttempts !== null &&
            remainingAttempts > 0 &&
            !lockoutData.locked && (
              <Alert className="border-orange-200 bg-orange-50">
                <Clock className="h-4 w-4 text-orange-600" />
                <AlertDescription className="text-orange-800">
                  {remainingAttempts} attempt
                  {remainingAttempts !== 1 ? "s" : ""} remaining
                </AlertDescription>
              </Alert>
            )}

          <Tabs
            value={activeTab}
            onValueChange={handleTabChange}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger
                value="admin"
                className="flex cursor-pointer items-center gap-2 data-[state=active]:bg-teal-500 data-[state=active]:text-white"
              >
                <Shield className="h-4 w-4" />
                Admin
              </TabsTrigger>
              <TabsTrigger
                value="editor"
                className="flex items-center cursor-not-allowed gap-2 opacity-50"
                disabled
                aria-disabled="true"
                tabIndex={-1}
              >
                <User className="h-4 w-4" />
                Editor
              </TabsTrigger>
            </TabsList>

            <TabsContent value="admin" className="mt-6">
              <div className="grid gap-2 text-center mb-4">
                <h2 className="text-xl font-semibold">Admin Access</h2>
                <p className="text-sm text-muted-foreground">
                  Full dashboard access and management capabilities with OTP
                  verification
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
                    disabled={lockoutData.locked}
                  />
                  {errors.email && (
                    <p className="text-red-500 text-sm">
                      {errors.email.message}
                    </p>
                  )}
                </div>

                {/* Password */}
                <div className="grid gap-2">
                  <Label htmlFor="admin-password">Password</Label>
                  <div className="relative">
                    <Input
                      id="admin-password"
                      type={showAdminPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      {...register("password")}
                      disabled={lockoutData.locked}
                      className="pr-10"
                    />
                    <button
                      type="button"
                      tabIndex={-1}
                      className="absolute inset-y-0 right-2 flex items-center text-gray-400 hover:text-gray-700"
                      onClick={() => setShowAdminPassword((v) => !v)}
                      aria-label={showAdminPassword ? "Hide password" : "Show password"}
                    >
                      {showAdminPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="text-red-500 text-sm">
                      {errors.password.message}
                    </p>
                  )}
                </div>

                {/* Submit */}
                <Button
                  disabled={loading || lockoutData.locked}
                  variant="blue"
                  type="submit"
                  className="w-full"
                >
                  {loading
                    ? "Logging in..."
                    : lockoutData.locked
                    ? "Account Locked"
                    : "Login"}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="editor" className="mt-6">
              <div className="grid gap-2 text-center mb-4">
                <h2 className="text-xl font-semibold text-gray-400">Editor Access (Disabled)</h2>
                <p className="text-sm text-muted-foreground">
                  Editor login is currently disabled.
                </p>
              </div>
              {/* Editor login form is disabled */}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
