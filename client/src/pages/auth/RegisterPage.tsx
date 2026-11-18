
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import { Headphones } from "lucide-react";

import { useAuth } from "../../context/AuthContext";
import FormField from "../../components/common/FormField";

import {
  registerSchema,
  type RegisterFormData,
} from "../../utils/auth.schema";

const RegisterPage = () => {
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();

  const [serverError, setServerError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormData) => {
    setServerError("");

    try {
      await registerUser({
        name: data.name,
        email: data.email,
        password: data.password,
      });

      navigate("/login", {
        replace: true,
        state: {
          message: "Registration successful! Please sign in.",
        },
      });
    } catch (error) {
      if (axios.isAxiosError(error)) {
        setServerError(
          error.response?.data?.message ||
            "Unable to create your account."
        );
      } else {
        setServerError("Something went wrong.");
      }
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50">

      {/* Branding */}
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
            Better support starts here.
          </h1>

          <p className="mt-5 text-slate-400">
            Create your account and experience a
            simpler way to manage support requests.
          </p>
        </div>

        <p className="text-sm text-slate-500">
          © 2026 SupportDesk. All rights reserved.
        </p>
      </div>

      {/* Registration form */}
      <div className="flex flex-1 items-center justify-center p-6">
        <div className="w-full max-w-md">

          <div className="mb-8 lg:hidden">
            <h1 className="text-2xl font-bold text-slate-900">
              SupportDesk
            </h1>
          </div>

          <h2 className="text-3xl font-bold text-slate-900">
            Create an account
          </h2>

          <p className="mt-2 text-sm text-slate-500">
            Get started with SupportDesk today.
          </p>

          <form
            onSubmit={handleSubmit(onSubmit)}
            className="mt-8 space-y-5"
          >
            <FormField
              id="name"
              label="Full name"
              type="text"
              placeholder="John Doe"
              autoComplete="name"
              {...register("name")}
              error={errors.name?.message}
            />

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
              placeholder="Minimum 8 characters"
              autoComplete="new-password"
              {...register("password")}
              error={errors.password?.message}
            />

            <FormField
              id="confirmPassword"
              label="Confirm password"
              type="password"
              placeholder="Re-enter your password"
              autoComplete="new-password"
              {...register("confirmPassword")}
              error={errors.confirmPassword?.message}
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
              {isSubmitting
                ? "Creating account..."
                : "Create account"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-500">
            Already have an account?{" "}
            <Link
              to="/login"
              className="font-semibold text-blue-600 hover:text-blue-700"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
