import { _images } from "@/assets/index";
import Button from "@/components/common/Button";
import { Input } from "@/components/index";
import { Formik } from "formik";
import { CircleArrowRight } from "lucide-react";
import React from "react";
import { Link } from "react-router-dom";
import * as Yup from "yup";
import { useLogin } from "../hooks/useLogin";

const Login = () => {
  const { login, isLoading } = useLogin();

  const loginSchema = Yup.object({
    email: Yup.string()
      .email("Should be valid email")
      .required("Email is Required"),
    password: Yup.string()
      .min(6, "Password should be 6 characters")
      .required("Password is Required"),
  });

  const loginData = {
    email: "",
    password: "",
    remember: false,
  };

  const handleLogin = async (values) => {
    await login({ email: values.email, password: values.password });
  };

  const heroImage = "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?q=80&w=2070&auto=format&fit=crop";

  return (
    <div className="min-h-screen flex flex-col tablet:flex-row overflow-hidden bg-white">
      {/* Left Column: Hero Image Section (Hidden on mobile phone) */}
      <div className="hidden tablet:flex w-1/2 relative">
        <div 
          className="absolute inset-0 bg-cover bg-center transition-transform duration-[10s] hover:scale-110"
          style={{ backgroundImage: `url(${heroImage})` }}
        />
        <div className="absolute inset-0 bg-linear-to-b from-black/60 via-black/20 to-fade/80" />
        
        <div className="relative z-10 w-full flex flex-col justify-between p-12 lg:p-16">
          <div className="flex items-center gap-2">
            <img src={_images.logo} alt="Logo" className="h-10 w-auto brightness-0 invert" />
            <span className="text-white text-xl font-bold uppercase tracking-tighter urbanist">
              OpsTrax
            </span>
          </div>

          <div className="max-w-md">
            <h1 className="text-white unna text-5xl lg:text-7xl font-bold leading-tight mb-6">
              Connected transport. Intelligent control.
            </h1>
            <p className="text-white/80 urbanist text-lg font-medium leading-relaxed">
              Enterprise transport management for fleets, dispatch, drivers, assets, maintenance, compliance, and AI-powered control.
            </p>
          </div>

          <div className="flex items-center gap-6 text-white/60 urbanist text-xs font-bold uppercase tracking-widest">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-status-success rounded-full" />
              Real-time Fleet Status
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-secondary rounded-full" />
              Cloud Sync Active
            </div>
          </div>
        </div>
      </div>

      {/* Right Column: Login Form Section */}
      <div className="flex-1 flex items-center justify-center p-6 tablet:p-12 lg:p-24 bg-white">
        <div className="w-full max-w-[440px] space-y-10">
          <div className="space-y-4">
            <div className="tablet:hidden flex justify-center mb-8">
              <img src={_images.logo} alt="Logo" className="h-12 w-auto" />
            </div>
            <h2 className="text-4xl unna font-extrabold text-grey tracking-tight">Login to OpsTrax Command Center</h2>
            <p className="text-gray-medium urbanist text-base font-semibold">
              Manage transport operations, drivers, vehicles, routes, compliance, and AI insights.
            </p>
          </div>

          <Formik
            initialValues={loginData}
            onSubmit={handleLogin}
            validationSchema={loginSchema}
          >
            {({ handleChange, handleSubmit, values, errors, touched }) => (
              <form className="space-y-6" onSubmit={handleSubmit}>
                <div className="space-y-4">
                  <Input
                    label={"Email Address"}
                    name={"email"}
                    placeholder={"name@company.com"}
                    type={"email"}
                    className="w-full rounded-xl! border-gray-light/30! focus:border-secondary! py-4! urbanist"
                    value={values.email}
                    onChange={handleChange}
                    error={errors.email}
                    touched={touched.email}
                  />
                  <div className="space-y-1">
                    <Input
                      label={"Password"}
                      name={"password"}
                      placeholder={"••••••••"}
                      type={"password"}
                      isPassword={true}
                      showPasswordToggle={true}
                      className="w-full rounded-xl! border-gray-light/30! focus:border-secondary! py-4! urbanist"
                      value={values.password}
                      onChange={handleChange}
                      error={errors.password}
                      touched={touched.password}
                    />
                    <div className="flex justify-end pr-1">
                      <Link 
                        to="/auth/forget-password" 
                        className="text-sm font-bold text-secondary hover:text-black transition-colors urbanist"
                      >
                        Forgot Password?
                      </Link>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 urbanist font-bold text-sm text-grey">
                  <input
                    type="checkbox"
                    id="remember"
                    name="remember"
                    checked={values.remember}
                    onChange={handleChange}
                    className="accent-secondary h-4 w-4 rounded border-gray-light/30 transition-all cursor-pointer"
                  />
                  <label htmlFor="remember" className="cursor-pointer">
                    Remember for 30 days
                  </label>
                </div>

                <div className="pt-2">
                  <Button
                    type="submit"
                    icon={!isLoading ? CircleArrowRight : null}
                    iconPosition="right"
                    disabled={isLoading}
                    variant="gradient"
                    fullWidth={true}
                    className="py-7! text-xl! font-bold! unna shadow-2xl shadow-secondary/20 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300"
                    loading={isLoading}
                  >
                    Sign In to OpsTrax
                  </Button>
                </div>

                <div className="text-center pt-8 border-t border-gray-light/10">
                  <p className="text-gray-medium urbanist text-sm font-semibold">
                    New to the platform?{" "}
                    <Link to="/auth/signup" className="text-secondary hover:underline transition-all font-extrabold ml-1">
                      Contact Administrator
                    </Link>
                  </p>
                </div>
              </form>
            )}
          </Formik>

          <div className="text-center pt-10">
            <p className="text-[10px] text-gray-medium uppercase tracking-[0.2em] font-bold">
              Secure Enterprise Portal &bull; Standard encryption active
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
