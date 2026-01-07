import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useVendorContext } from "@/hooks/useVendorContext";
import VendorStoreHeader from "@/components/vendor/VendorStoreHeader";
import { useVendorCategories } from "@/hooks/useVendors";
import Layout from "@/components/Layout";

const signupSchema = z
    .object({
        name: z.string().min(2, { message: "Name must be at least 2 characters" }),
        email: z.string().email({ message: "Please enter a valid email address" }),
        password: z.string().min(8, { message: "Password must be at least 8 characters" }),
        confirmPassword: z.string().min(8, { message: "Confirm Password must be at least 8 characters" }),
    })
    .refine((data) => data.password === data.confirmPassword, {
        message: "Passwords do not match",
        path: ["confirmPassword"],
    });

type SignupFormValues = z.infer<typeof signupSchema>;

/**
 * VendorSignup - Signup page for vendor store context
 * Uses vendor branding and redirects back to vendor store after signup
 */
const VendorSignup = () => {
    const { signup, user, loading: authLoading } = useAuth();
    const navigate = useNavigate();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [signupSuccess, setSignupSuccess] = useState(false);

    // Vendor context
    const { vendor, vendorSlug, vendorId } = useVendorContext();
    const { mainCategories, subcategories } = useVendorCategories(vendorId);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [selectedSubcategory, setSelectedSubcategory] = useState<string | null>(null);

    // Redirect if already logged in
    React.useEffect(() => {
        if (user && !authLoading) {
            const redirectTarget = sessionStorage.getItem('redirectAfterLogin');
            if (redirectTarget) {
                sessionStorage.removeItem('redirectAfterLogin');
                navigate(redirectTarget);
            } else {
                navigate(`/store/${vendorSlug}`);
            }
        }
    }, [user, authLoading, navigate, vendorSlug]);

    const form = useForm<SignupFormValues>({
        resolver: zodResolver(signupSchema),
        defaultValues: {
            name: "",
            email: "",
            password: "",
            confirmPassword: "",
        },
    });

    const onSubmit = async (data: SignupFormValues) => {
        if (isSubmitting) return;

        setIsSubmitting(true);
        try {
            const success = await signup(data.email, data.password, data.name);
            if (success) {
                setSignupSuccess(true);
                setTimeout(() => {
                    navigate(`/store/${vendorSlug}/login`);
                }, 3000);
            }
        } catch (error) {
            console.error('Signup submission error:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (authLoading) {
        return (
            <Layout hideGlobalHeader={true} hideFooter={true}>
                {vendorId && (
                    <VendorStoreHeader
                        vendorId={vendorId}
                        mainCategories={mainCategories}
                        subcategories={subcategories}
                        searchQuery={searchQuery}
                        onSearchChange={setSearchQuery}
                        selectedCategory={selectedCategory}
                        onCategorySelect={setSelectedCategory}
                        selectedSubcategory={selectedSubcategory}
                        onSubcategorySelect={setSelectedSubcategory}
                    />
                )}
                <div className="flex justify-center items-center min-h-[80vh]">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                </div>
            </Layout>
        );
    }

    if (signupSuccess) {
        return (
            <Layout hideGlobalHeader={true} hideFooter={true}>
                {vendorId && (
                    <VendorStoreHeader
                        vendorId={vendorId}
                        mainCategories={mainCategories}
                        subcategories={subcategories}
                        searchQuery={searchQuery}
                        onSearchChange={setSearchQuery}
                        selectedCategory={selectedCategory}
                        onCategorySelect={setSelectedCategory}
                        selectedSubcategory={selectedSubcategory}
                        onSubcategorySelect={setSelectedSubcategory}
                    />
                )}
                <div className="flex justify-center items-center min-h-[80vh] px-4">
                    <Card className="w-full max-w-md shadow-lg">
                        <CardHeader className="bg-primary text-primary-foreground rounded-t-md">
                            <CardTitle className="text-center text-2xl">تم إنشاء الحساب!</CardTitle>
                        </CardHeader>
                        <CardContent className="pt-6 text-center">
                            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                            <p className="text-muted-foreground mb-4">
                                سيتم تحويلك لصفحة تسجيل الدخول...
                            </p>
                            <Button onClick={() => navigate(`/store/${vendorSlug}/login`)} className="w-full">
                                تسجيل الدخول الآن
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </Layout>
        );
    }

    return (
        <Layout hideGlobalHeader={true} hideFooter={true}>
            {/* Vendor Header */}
            {vendorId && (
                <VendorStoreHeader
                    vendorId={vendorId}
                    mainCategories={mainCategories}
                    subcategories={subcategories}
                    searchQuery={searchQuery}
                    onSearchChange={setSearchQuery}
                    selectedCategory={selectedCategory}
                    onCategorySelect={setSelectedCategory}
                    selectedSubcategory={selectedSubcategory}
                    onSubcategorySelect={setSelectedSubcategory}
                />
            )}

            <div className="flex justify-center items-center min-h-[80vh] w-full px-4 py-6">
                <Card className="w-full max-w-md shadow-lg">
                    <CardHeader className="bg-primary text-primary-foreground rounded-t-md">
                        <CardTitle className="text-center text-2xl">إنشاء حساب</CardTitle>
                        <CardDescription className="text-center text-primary-foreground/80">
                            {vendor?.name ? `انضم إلى ${vendor.name}` : 'أدخل بياناتك لإنشاء حساب'}
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-6">
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                                <FormField
                                    control={form.control}
                                    name="name"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>الاسم</FormLabel>
                                            <FormControl>
                                                <Input placeholder="اسمك الكامل" {...field} disabled={isSubmitting} />
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
                                            <FormLabel>البريد الإلكتروني</FormLabel>
                                            <FormControl>
                                                <Input type="email" placeholder="you@example.com" {...field} disabled={isSubmitting} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="password"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>كلمة المرور</FormLabel>
                                            <FormControl>
                                                <Input type="password" placeholder="••••••••" {...field} disabled={isSubmitting} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="confirmPassword"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>تأكيد كلمة المرور</FormLabel>
                                            <FormControl>
                                                <Input type="password" placeholder="••••••••" {...field} disabled={isSubmitting} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <Button type="submit" className="w-full" disabled={isSubmitting}>
                                    {isSubmitting ? "جاري إنشاء الحساب..." : "إنشاء حساب"}
                                </Button>
                            </form>
                        </Form>
                    </CardContent>
                    <CardFooter className="flex flex-col space-y-2 py-4">
                        <div className="text-center w-full">
                            <span className="text-sm text-muted-foreground">لديك حساب بالفعل؟ </span>
                            <Link to={`/store/${vendorSlug}/login`} className="text-primary hover:underline font-medium">
                                تسجيل الدخول
                            </Link>
                        </div>
                        <div className="text-center w-full">
                            <Link to={`/store/${vendorSlug}`} className="text-sm text-muted-foreground hover:underline">
                                العودة للمتجر
                            </Link>
                        </div>
                    </CardFooter>
                </Card>
            </div>
        </Layout>
    );
};

export default VendorSignup;
