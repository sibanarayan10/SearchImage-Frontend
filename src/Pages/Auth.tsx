import React from "react";
import { Link } from "react-router-dom";
import Form from "../Components/Form";
import ThemeToggle from "../Components/ThemeToggle";
import {
  Album,
  ArrowLeft,
  Sparkles,
  Camera,
  ShieldCheck,
  CheckCircle2,
} from "lucide-react";

type AuthMode = "signup" | "signin";

interface AuthProps {
  mode: AuthMode;
}

const Auth: React.FC<AuthProps> = ({ mode }) => {
  return (
    <div className="min-h-screen w-full flex bg-zinc-50 dark:bg-[#0c0c0c] text-zinc-900 dark:text-zinc-100 transition-colors duration-300">
      {/* Left Showcase Panel (Desktop) */}
      <div className="hidden lg:flex lg:w-1/2 xl:w-7/12 relative flex-col justify-between p-12 overflow-hidden bg-zinc-900">
        {/* Background photo with subtle zoom and dark overlay */}
        <div
          className="absolute inset-0 bg-cover bg-center transition-transform duration-1000 scale-105"
          style={{
            backgroundImage: "url(/bg.avif)",
            filter: "brightness(0.55)",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/60" />

        {/* Top Logo */}
        <div className="relative z-10">
          <Link
            to="/"
            className="inline-flex items-center gap-2.5 text-white font-semibold text-xl tracking-tight hover:opacity-80 transition"
          >
            <div className="p-2 rounded-xl bg-emerald-500/20 backdrop-blur-md border border-emerald-400/30 text-emerald-400">
              <Album size={22} />
            </div>
            <span>ImageGallery</span>
          </Link>
        </div>

        {/* Middle Feature Highlights */}
        <div className="relative z-10 max-w-lg space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-emerald-300 text-xs font-medium">
            <Sparkles size={13} />
            <span>Community-Driven Visual Platform</span>
          </div>

          <h2 className="text-3xl xl:text-4xl font-bold text-white leading-tight">
            Capture, create, and share your visual perspective with the world.
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <div className="p-3.5 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 space-y-1">
              <div className="flex items-center gap-2 text-emerald-400 text-sm font-semibold">
                <Camera size={16} />
                <span>Curated Stock</span>
              </div>
              <p className="text-xs text-white/70 leading-relaxed">
                Free high-resolution photos for creators, designers, and developers.
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 space-y-1">
              <div className="flex items-center gap-2 text-emerald-400 text-sm font-semibold">
                <Sparkles size={16} />
                <span>AI Photo Insights</span>
              </div>
              <p className="text-xs text-white/70 leading-relaxed">
                Real-time visual analysis of lighting, framing, and color theory.
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Photographer Badge */}
        <div className="relative z-10 flex items-center justify-between p-4 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-400 font-bold text-sm">
              IG
            </div>
            <div>
              <p className="text-white text-sm font-medium">
                Every photograph tells a story
              </p>
              <p className="text-white/50 text-xs">
                Free forever • No credit card required
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1 text-emerald-400 text-xs font-medium">
            <CheckCircle2 size={15} />
            <span>Verified</span>
          </div>
        </div>
      </div>

      {/* Right Form Panel */}
      <div className="w-full lg:w-1/2 xl:w-5/12 flex flex-col justify-between p-6 sm:p-10 md:p-14 overflow-y-auto">
        {/* Top bar with Back button and ThemeToggle */}
        <div className="flex items-center justify-between w-full pb-6">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-medium text-black/60 dark:text-white/60 hover:text-black dark:hover:text-white transition"
          >
            <ArrowLeft size={16} />
            <span>Back to gallery</span>
          </Link>
          <ThemeToggle />
        </div>

        {/* Form Container */}
        <div className="w-full max-w-md mx-auto my-auto py-6">
          <div className="text-center mb-8">
            <div className="inline-flex p-3 rounded-2xl bg-emerald-500/10 text-emerald-500 dark:text-emerald-400 mb-3 border border-emerald-500/20">
              <Album size={28} />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900 dark:text-white">
              {mode === "signup" ? "Create your account" : "Welcome back"}
            </h1>
            <p className="text-xs sm:text-sm text-black/50 dark:text-white/50 mt-1.5">
              {mode === "signup"
                ? "Join the community to like, save, and upload photographs"
                : "Enter your credentials to access your account"}
            </p>
          </div>

          <Form mode={mode} />
        </div>

        {/* Footer */}
        <div className="text-center pt-6 text-[11px] text-black/40 dark:text-white/40">
          By signing in, you agree to our Terms of Service & Privacy Policy.
        </div>
      </div>
    </div>
  );
};

export default Auth;
