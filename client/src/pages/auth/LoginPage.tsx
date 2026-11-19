
import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import { Headphones } from "lucide-react";

import { useAuth } from "../../context/AuthContext";
import FormField from "../../components/common/FormField";
import { ShimmerLabel } from "../../components/common/LoadingShimmer";

import {
    loginSchema,
    type LoginFormData,
} from "../../utils/auth.schema";

import type { UserRole } from "../../types/auth.types";

const dashboardPaths: Record<UserRole, string> = {
    ADMIN: "/admin/dashboard",
    AGENT: "/agent/dashboard",
    CUSTOMER: "/customer/dashboard",
};

const LoginPage = () => {
    const { login, user } = useAuth();
    const navigate = useNavigate();

    const [serverError, setServerError] = useState("");
    const location = useLocation();
    const successMessage = location.state?.message as | string | undefined;
    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<LoginFormData>({
        resolver: zodResolver(loginSchema),
    });

    const onSubmit = async (data: LoginFormData) => {
        setServerError("");

        try {
            await login(data);

            // AuthContext updates user after successful login.
            // Read the authenticated user from the next render.
            navigate("/dashboard", { replace: true });
        } catch (error) {
            if (axios.isAxiosError(error)) {
                setServerError(
                    error.response?.data?.message ||
                    "Unable to login. Please try again."
                );
            } else {
                setServerError("Something went wrong.");
            }
        }
    };

    // Keep role-based navigation in one place.
    // The dashboard route resolves the current role.
    void dashboardPaths;
    void user;

    return (
        <div className="flex min-h-screen bg-slate-50">

            {/* Branding section */}
            <div className="hidden w-1/2 flex-col justify-between bg-slate-950 p-12 text-white lg:flex">
                <div className="flex items-center gap-3">
                    <div className="rounded-xl bg-blue-600 p-2">
                        <Headphones size={24} />
                    </div>

                    <span className="text-xl font-bold">
                        SupportDesk
                    </span>
                </div>

                <div className="max-w-lg">
                    <h1 className="text-4xl font-bold leading-tight">
                        Support that keeps your business moving.
                    </h1>

                    <p className="mt-5 text-slate-400">
                        Manage customer requests, collaborate with
                        your team and deliver exceptional support.
                    </p>
                </div>

                <p className="text-sm text-slate-500">
                    © 2026 SupportDesk. All rights reserved.
                </p>
            </div>

            {/* Login form */}
            <div className="flex flex-1 items-center justify-center p-6">
                <div className="w-full max-w-md">

                    <div className="mb-8 lg:hidden">
                        <h1 className="text-2xl font-bold text-slate-900">
                            SupportDesk
                        </h1>
                    </div>

                    <h2 className="text-3xl font-bold text-slate-900">
                        Welcome back
                    </h2>

                    <p className="mt-2 text-sm text-slate-500">
                        Sign in to access your account.
                    </p>

                    {successMessage && (
                        <div className="mt-5 rounded-lg bg-green-50 p-3 text-sm text-green-700">
                            {successMessage}
                        </div>
                    )}

                    <form
                        onSubmit={handleSubmit(onSubmit)}
                        className="mt-8 space-y-5"
                    >
                        <FormField
                            id="email"
                            label="Email address"
                            type="email"
                            placeholder="you@example.com"
                            autoComplete="email"
                            {...register("email")}
                            error={errors.email?.message}
                        />

                        <FormField
                            id="password"
                            label="Password"
                            type="password"
                            placeholder="Enter your password"
                            autoComplete="current-password"
                            {...register("password")}
                            error={errors.password?.message}
                        />

                        {serverError && (
                            <div
                                role="alert"
                                className="rounded-lg bg-red-50 p-3 text-sm text-red-600"
                            >
                                {serverError}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full rounded-lg bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {isSubmitting ? (
                                <ShimmerLabel label="Signing in" className="h-4 w-20" />
                            ) : (
                                "Sign in"
                            )}
                        </button>
                    </form>

                    <p className="mt-6 text-center text-sm text-slate-500">
                        Don't have an account?{" "}
                        <Link
                            to="/register"
                            className="font-semibold text-blue-600 hover:text-blue-700"
                        >
                            Create an account
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
