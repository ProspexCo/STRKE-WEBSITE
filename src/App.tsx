/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */


import { motion, AnimatePresence } from "motion/react";
import { useState, useEffect, type ReactNode } from "react";
import {
  Dumbbell,
  Flame,
  Scale,
  Package,
  CheckCircle2,
  ArrowRight,
  Award,
  Instagram,
  Twitter,
  Youtube,
  Music2,
  X,
  CheckCircle,
} from "lucide-react";

type Program = {
  id: string;
  title: string;
  price: number;
  icon?: ReactNode;
  description?: string;
  features?: string[];
  programLink: string;
  originalPrice?: number;
};

const API_URL = "https://strke-website-production-cea0.up.railway.app";

const programs: Program[] = [
  {
    id: "lean-bulking",
    title: "12-Week Lean Bulk Blueprint",
    price: 49.99,
    icon: <Dumbbell className="w-8 h-8 text-orange-500" />,
    description:
      "Build lean muscle, increase strength, and add size without unnecessary fat gain. This system includes everything you need to gain quality size while staying lean and in control.",
    features: [
      "Structured training programs",
      "High-protein meal plan",
      "Grocery lists",
      "Supplement guide",
      "Guided progression system",
    ],
    programLink: "https://canva.link/a5wkcu5shos2r16",
  },
  {
    id: "lean-cutting",
    title: "12-Week Lean Cut Blueprint",
    price: 49.99,
    icon: <Flame className="w-8 h-8 text-red-500" />,
    description:
      "Lose body fat while maintaining muscle, strength, and performance. Burn fat, stay strong, and get lean with a system that actually works.",
    features: [
      "Effective strength training",
      "LISS + HIIT cardio system",
      "High-protein nutrition plan",
      "Progression & adjustment system",
    ],
    programLink: "https://canva.link/687i5v30uu1zrgr",
  },
  {
    id: "weight-maintenance",
    title: "12-Week Maintenance Blueprint",
    price: 49.99,
    icon: <Scale className="w-8 h-8 text-blue-500" />,
    description:
      "Maintain your physique, stay lean, and continue improving without extreme dieting or overtraining. Designed for sustainability and long-term results.",
    features: [
      "Balanced training programs",
      "Sustainable nutrition plan",
      "Controlled cardio approach",
      "Long-term performance focus",
    ],
    programLink: "https://canva.link/7byvkad4ob1f53l",
  },
  {
    id: "max-bulking",
    title: "12-Week Extreme Mass Blueprint",
    price: 49.99,
    icon: <Dumbbell className="w-8 h-8 text-orange-800" />,
    description:
      "Gain size, build strength, and put on as much mass as possible. A proven 12-week system built for maximum muscle and weight gain.",
    features: [
      "Push Pull Legs (PPL) program",
      "Extreme mass nutrition plan",
      "Explosive performance training",
      "Muscle growth supplement guide",
      "Video guided demonstrations",
    ],
    programLink: "https://canva.link/pl6mtlr4t2n5yfz",
  },
  {
    id: "body-sculpt",
    title: "12-Week Body Sculpt Blueprint",
    price: 49.99,
    icon: <Flame className="w-8 h-8 text-pink-500" />,
    description:
      "Build glutes, define your core, and sculpt a strong, balanced physique. A complete 12-week system designed for shape, strength, and confidence.",
    features: [
      "Glute-focused training",
      "Core development system",
      "Structured cardio protocol",
      "Sculpt nutrition plan",
      "Video guided demonstrations",
    ],
    programLink: "https://canva.link/pxsa0bhq1opyb9c",
  },
];

const bundleProgram: Program = {
  id: "the-bundle",
  title: "The 4-Type Transformation Bundle",
  price: 99.99,
  originalPrice: 199.99,
  programLink: "https://canva.link/nm6lpkz0y2nsq65",
};

export default function App() {
  const [status, setStatus] = useState<"success" | "canceled" | null>(null);
  const [loading, setLoading] = useState<string | null>(null);
  const [purchaseError, setPurchaseError] = useState<string | null>(null);

  useEffect(() => {
    const query = new URLSearchParams(window.location.search);

    if (query.get("success")) {
      setStatus("success");
    }

    if (query.get("canceled")) {
      setStatus("canceled");
    }
  }, []);

  const handlePurchase = async (program: Program) => {
    try {
      setPurchaseError(null);
      setLoading(program.id);

      const response = await fetch(`${API_URL}/api/create-checkout-session`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          programId: program.id,
          programTitle: program.title,
          price: program.price,
          programLink: program.programLink,
        }),
      });

      const text = await response.text();
      let data: any = {};

      try {
        data = text ? JSON.parse(text) : {};
      } catch {
        throw new Error(`Server returned non-JSON response: ${text.slice(0, 120)}`);
      }

      if (!response.ok) {
        throw new Error(data.error || `Request failed with status ${response.status}`);
      }

      if (data.url) {
        window.location.href = data.url;
        return;
      }

      throw new Error("No checkout URL returned from server");
    } catch (err: any) {
      console.error("Purchase error:", err);
      setPurchaseError(err.message || "Something went wrong with the purchase.");
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#f5f5f4] text-[#0a0a0a] font-sans selection:bg-orange-200">
      <AnimatePresence>
        {status && (
          <motion.div
            initial={{ opacity: 0, y: -100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -100 }}
            className="fixed top-0 left-0 right-0 z-[100] flex justify-center p-4"
          >
            <div
              className={`flex items-center gap-4 rounded-full border px-8 py-4 shadow-2xl backdrop-blur-xl ${
                status === "success"
                  ? "border-green-400 bg-green-500/90 text-white"
                  : "border-red-400 bg-red-500/90 text-white"
              }`}
            >
              {status === "success" ? (
                <>
                  <CheckCircle className="h-6 w-6" />
                  <p className="text-sm font-bold uppercase tracking-widest">
                    Purchase Successful! Check your email.
                  </p>
                </>
              ) : (
                <>
                  <X className="h-6 w-6" />
                  <p className="text-sm font-bold uppercase tracking-widest">
                    Purchase Canceled.
                  </p>
                </>
              )}
              <button
                onClick={() => setStatus(null)}
                className="ml-4 opacity-60 hover:opacity-100"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <nav className="fixed top-0 z-50 w-full border-b border-black/5 bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <div className="text-xl font-bold tracking-tighter uppercase">Nick Eunson</div>
          <div className="hidden items-center gap-8 text-sm font-medium uppercase tracking-wider md:flex">
            <a href="#story" className="transition-colors hover:text-orange-600">
              My Story
            </a>
            <a href="#programs" className="transition-colors hover:text-orange-600">
              Programs
            </a>
            <a
              href="#bundle"
              className="font-bold text-orange-600 transition-colors hover:text-orange-600"
            >
              The Bundle
            </a>
          </div>
          <button className="rounded-full bg-black px-5 py-2 text-xs font-bold uppercase tracking-widest text-white transition-all hover:bg-orange-600">
            Get Started
          </button>
        </div>
      </nav>

      <section className="mx-auto grid min-h-[80vh] max-w-7xl gap-16 px-6 pt-32 pb-20 lg:grid-cols-2 items-center">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div className="mb-6 flex items-center gap-2">
            <span className="h-px w-8 bg-orange-500"></span>
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-orange-600">
              Transform Your Life
            </span>
          </div>
          <h1 className="mb-8 text-7xl leading-[0.88] font-semibold tracking-tighter md:text-8xl">
            MASTER YOUR <br /> <span className="italic text-orange-600">PHYSIQUE.</span>
          </h1>
          <p className="mb-10 max-w-md text-xl leading-relaxed text-gray-600">
            Science-backed training programs designed to take the guesswork out of
            your fitness journey. Whether you're bulking, cutting, or maintaining.
          </p>
          <div className="flex flex-wrap gap-4">
            <a
              href="#programs"
              className="group flex items-center gap-2 rounded-full bg-black px-8 py-4 font-bold uppercase tracking-widest text-white transition-all hover:bg-orange-600"
            >
              View Programs
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </a>
            <a
              href="#story"
              className="rounded-full border border-black/10 px-8 py-4 font-bold uppercase tracking-widest transition-all hover:bg-black hover:text-white"
            >
              My Story
            </a>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, delay: 0.2 }}
          className="relative aspect-square overflow-hidden rounded-3xl bg-gray-200 group lg:h-[600px] lg:aspect-auto"
        >
          <img
            src="/input_file_0.png"
            alt="Fitness Transformation"
            className="h-full w-full object-cover grayscale transition-all duration-700 group-hover:grayscale-0"
            referrerPolicy="no-referrer"
          />
        </motion.div>
      </section>

      <section className="overflow-hidden bg-black py-12">
        <div className="flex whitespace-nowrap animate-marquee">
          {[...Array(10)].map((_, i) => (
            <div key={i} className="mx-6 flex items-center gap-12">
              <span className="text-4xl font-black tracking-tighter uppercase text-white/20">
                Science Backed
              </span>
              <span className="text-4xl font-black tracking-tighter uppercase text-orange-500">
                Results Driven
              </span>
              <span className="text-4xl font-black tracking-tighter uppercase text-white/20">
                Elite Performance
              </span>
            </div>
          ))}
        </div>
      </section>

      <section id="story" className="bg-white px-6 py-32">
        <div className="mx-auto grid max-w-7xl items-center gap-20 lg:grid-cols-2">
          <div className="order-2 lg:order-1">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-4">
                <div className="group relative aspect-[3/4] overflow-hidden rounded-2xl bg-gray-100">
                  <img
                    src="/input_file_1.png"
                    alt="Before Transformation"
                    className="h-full w-full object-cover grayscale transition-all group-hover:grayscale-0"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute top-4 left-4 rounded-full bg-black/50 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-white backdrop-blur-md">
                    Before
                  </div>
                </div>
                <div className="flex aspect-square items-center justify-center rounded-2xl bg-orange-500 p-8 text-white">
                  <Award className="h-16 w-16" />
                </div>
              </div>
              <div className="space-y-4 pt-12">
                <div className="group relative flex aspect-square flex-col justify-end overflow-hidden rounded-2xl bg-black p-6 text-white">
                  <img
                    src="/input_file_2.png"
                    alt="100lb+ Weight Gained"
                    className="absolute inset-0 h-full w-full object-cover opacity-60 transition-opacity group-hover:opacity-80"
                    referrerPolicy="no-referrer"
                  />
                  <div className="relative z-10">
                    <p className="mb-1 text-4xl font-bold">100lb+</p>
                    <p className="text-[10px] uppercase tracking-widest opacity-60">
                      Weight Gained
                    </p>
                  </div>
                </div>
                <div className="group relative aspect-[3/4] overflow-hidden rounded-2xl bg-gray-100">
                  <img
                    src="/input_file_0.png"
                    alt="After Transformation"
                    className="h-full w-full object-cover grayscale transition-all group-hover:grayscale-0"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute top-4 left-4 rounded-full bg-orange-600 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-white shadow-lg">
                    After
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="order-1 lg:order-2">
            <div className="mb-6 flex items-center gap-2">
              <span className="h-px w-8 bg-orange-500"></span>
              <span className="text-xs font-bold uppercase tracking-[0.2em] text-orange-600">
                The Man Behind The Method
              </span>
            </div>
            <h2 className="mb-8 text-5xl font-semibold tracking-tighter">
              I BUILT THE <br /> <span className="italic text-orange-600">IMPOSSIBLE.</span>
            </h2>
            <div className="space-y-6 leading-relaxed text-gray-600">
              <p>
                From ages 14 to 19, I gained over 100 pounds, going from 100 lbs to
                205 lbs. I started as someone who lacked confidence, knowledge, and
                direction. Like most people, I didn’t know where to begin, what
                worked, or how to stay consistent. I was also someone who struggled
                to see progress—I didn't know what to eat or how to train properly.
              </p>
              <p>
                So over the next 4½ years, I committed to learning, training, and
                refining everything, from workouts to nutrition to recovery.
                Eventually, I built the physique I once thought was impossible by
                strengthening my mindset and building discipline.
              </p>
              <div className="rounded-2xl border-l-4 border-orange-500 bg-gray-50 p-6">
                <p className="font-medium italic text-black">
                  "These programs contain everything I wish I had when I started.
                  With all the information provided, you can achieve more than you
                  ever thought you could."
                </p>
              </div>
              <div className="space-y-2">
                <p className="text-xs font-bold uppercase tracking-widest text-black">
                  It combines:
                </p>
                <ul className="grid grid-cols-1 gap-2">
                  <li className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-orange-500" />
                    What actually works
                  </li>
                  <li className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-orange-500" />
                    What saves you time
                  </li>
                  <li className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-orange-500" />
                    What produces real, lasting results
                  </li>
                </ul>
              </div>
              <p className="text-sm">
                So you don’t waste years figuring it out on your own like I did. You
                have the information in front of you. Now all it takes is the mindset
                that you can be great.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section id="programs" className="bg-[#f5f5f4] px-6 py-32">
        <div className="mx-auto max-w-7xl">
          {purchaseError && (
            <div className="mb-8 flex items-center justify-between rounded-2xl border border-red-200 bg-red-50 p-4 text-red-600">
              <div className="flex items-center gap-2">
                <Flame className="h-5 w-5" />
                <span className="text-sm font-medium">{purchaseError}</span>
              </div>
              <button
                onClick={() => setPurchaseError(null)}
                className="text-xs font-bold uppercase tracking-widest hover:underline"
              >
                Dismiss
              </button>
            </div>
          )}

          <div className="mb-20 text-center">
            <div className="mb-6 flex items-center justify-center gap-2">
              <span className="h-px w-8 bg-orange-500"></span>
              <span className="text-xs font-bold uppercase tracking-[0.2em] text-orange-600">
                Choose Your Goal
              </span>
              <span className="h-px w-8 bg-orange-500"></span>
            </div>
            <h2 className="text-6xl font-semibold tracking-tighter">THE PROGRAMS</h2>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {programs.map((program) => (
              <motion.div
                key={program.id}
                whileHover={{ y: -10 }}
                className="flex h-full flex-col rounded-3xl border border-black/5 bg-white p-10 shadow-sm"
              >
                <div className="mb-8">{program.icon}</div>
                <h3 className="mb-4 text-3xl font-bold tracking-tight">
                  {program.title}
                </h3>
                <p className="mb-8 flex-grow leading-relaxed text-gray-500">
                  {program.description}
                </p>
                <div className="mb-10 space-y-4">
                  {program.features?.map((feature, i) => (
                    <div key={i} className="flex items-center gap-3 text-sm">
                      <CheckCircle2 className="h-4 w-4 shrink-0 text-orange-500" />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
                <div className="flex items-center justify-between border-t border-black/5 pt-8">
                  <div>
                    <p className="mb-1 text-[10px] uppercase tracking-widest text-gray-400">
                      Limited Time Offer
                    </p>
                    <div className="flex items-baseline gap-2">
                      <p className="text-3xl font-bold">${program.price}</p>
                      {program.originalPrice && (
                        <p className="text-sm text-gray-400 line-through">
                          ${program.originalPrice}
                        </p>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => handlePurchase(program)}
                    disabled={loading !== null}
                    className="flex items-center gap-2 rounded-full bg-black px-6 py-3 text-xs font-bold uppercase tracking-widest text-white transition-all hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {loading === program.id ? (
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    ) : null}
                    {loading === program.id ? "Processing..." : "Buy Now"}
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section id="bundle" className="px-6 py-32">
        <div className="relative mx-auto max-w-7xl overflow-hidden rounded-[40px] bg-black">
          <div className="pointer-events-none absolute top-0 right-0 h-full w-1/2 bg-gradient-to-l from-orange-600/20 to-transparent"></div>
          <div className="pointer-events-none absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-orange-600/30 blur-[120px]"></div>

          <div className="relative z-10 grid gap-16 p-12 md:p-24 lg:grid-cols-2 items-center">
            <div>
              <div className="mb-8 inline-flex items-center gap-2 rounded-full bg-orange-600 px-4 py-1 text-[10px] font-bold uppercase tracking-widest text-white">
                Best Value
              </div>
              <h2 className="mb-8 text-5xl leading-[0.9] font-bold tracking-tighter text-white md:text-7xl">
                THE BUNDLE <br />
                <span className="mt-4 block text-4xl italic text-orange-500 md:text-5xl">
                  The 4-Type Transformation Blueprint
                </span>
              </h2>
              <div className="mb-10 max-w-xl space-y-6 text-lg leading-relaxed text-white/80">
                <p>
                  A complete, step-by-step system designed to take you from where
                  you are now to a stronger, leaner, more confident physique in 12
                  weeks.
                </p>
                <p className="text-sm text-white/60">
                  This program combines multiple proven training splits, structured
                  nutrition plans for any goal (bulk, cut, or maintain), a full
                  supplement guide, and a built-in progress tracking system. Every
                  exercise is supported with video demonstrations so you know exactly
                  how to train with proper form and maximize results.
                </p>
                <p className="font-bold text-orange-500">
                  Everything you need — training, nutrition, cardio, and progression
                  — all in one system with no guesswork.
                </p>
              </div>
              <div className="mb-12 space-y-4">
                <div className="flex items-center gap-4 text-white">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10">
                    <CheckCircle2 className="h-5 w-5 text-orange-500" />
                  </div>
                  <span className="font-medium">All 4 Core Programs Included</span>
                </div>
                <div className="flex items-center gap-4 text-white">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10">
                    <CheckCircle2 className="h-5 w-5 text-orange-500" />
                  </div>
                  <span className="font-medium">Exclusive Nutrition Masterclass</span>
                </div>
                <div className="flex items-center gap-4 text-white">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10">
                    <CheckCircle2 className="h-5 w-5 text-orange-500" />
                  </div>
                  <span className="font-medium">Lifetime Updates & Community Access</span>
                </div>
              </div>
            </div>

            <div className="rounded-[32px] border border-white/10 bg-white/5 p-12 text-center backdrop-blur-sm">
              <Package className="mx-auto mb-6 h-16 w-16 text-orange-500" />
              <p className="mb-2 text-sm uppercase tracking-[0.2em] text-white/40">
                Total Value ${bundleProgram.originalPrice}
              </p>
              <div className="mb-8 flex items-center justify-center gap-4">
                <span className="text-4xl font-bold text-white/20 line-through">
                  ${bundleProgram.originalPrice}
                </span>
                <span className="text-7xl font-black text-white">
                  ${bundleProgram.price}
                </span>
              </div>
              <button
                onClick={() => handlePurchase(bundleProgram)}
                disabled={loading !== null}
                className="mb-6 flex w-full items-center justify-center gap-3 rounded-2xl bg-orange-600 py-6 font-black uppercase tracking-[0.2em] text-white shadow-[0_0_40px_rgba(249,115,22,0.3)] transition-all hover:bg-orange-500 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading === bundleProgram.id ? (
                  <div className="h-6 w-6 animate-spin rounded-full border-4 border-white/30 border-t-white" />
                ) : null}
                {loading === bundleProgram.id ? "Processing..." : "Claim The Bundle"}
              </button>
              <p className="text-xs text-white/40">
                Secure checkout. Instant digital delivery.
              </p>
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-black/5 bg-white px-6 pt-24 pb-12">
        <div className="mx-auto max-w-7xl">
          <div className="mb-20 grid gap-12 md:grid-cols-4">
            <div className="col-span-2">
              <div className="mb-6 text-2xl font-bold tracking-tighter uppercase">
                Nick Eunson
              </div>
              <p className="mb-8 max-w-sm leading-relaxed text-gray-500">
                Building physiques through science, dedication, and proven methods.
              </p>
              <div className="flex gap-4">
                <a
                  href="https://instagram.com/eunsonlifts"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 transition-all hover:bg-orange-500 hover:text-white"
                >
                  <Instagram className="h-5 w-5" />
                </a>
                <a
                  href="https://tiktok.com/@eunsonlifts"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 transition-all hover:bg-orange-500 hover:text-white"
                >
                  <Music2 className="h-5 w-5" />
                </a>
                <a
                  href="https://twitter.com/nickeunsonn"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 transition-all hover:bg-orange-500 hover:text-white"
                >
                  <Twitter className="h-5 w-5" />
                </a>
                <a
                  href="https://youtube.com/@nickeunson"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 transition-all hover:bg-orange-500 hover:text-white"
                >
                  <Youtube className="h-5 w-5" />
                </a>
              </div>
            </div>
            <div>
              <h4 className="mb-6 text-xs font-bold uppercase tracking-widest">
                Programs
              </h4>
              <ul className="space-y-4 text-sm text-gray-500">
                <li>
                  <a href="#programs" className="transition-colors hover:text-orange-600">
                    Lean Bulk Blueprint
                  </a>
                </li>
                <li>
                  <a href="#programs" className="transition-colors hover:text-orange-600">
                    Lean Cut Blueprint
                  </a>
                </li>
                <li>
                  <a href="#programs" className="transition-colors hover:text-orange-600">
                    Maintenance Blueprint
                  </a>
                </li>
                <li>
                  <a href="#programs" className="transition-colors hover:text-orange-600">
                    Extreme Mass Blueprint
                  </a>
                </li>
                <li>
                  <a href="#programs" className="transition-colors hover:text-orange-600">
                    Body Sculpt Blueprint
                  </a>
                </li>
                <li>
                  <a href="#bundle" className="transition-colors hover:text-orange-600">
                    The 4-Type Bundle
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="mb-6 text-xs font-bold uppercase tracking-widest">
                Support
              </h4>
              <ul className="space-y-4 text-sm text-gray-500">
                <li>
                  <a href="#" className="transition-colors hover:text-orange-600">
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a href="#" className="transition-colors hover:text-orange-600">
                    Terms of Service
                  </a>
                </li>
                <li>
                  <a href="#" className="transition-colors hover:text-orange-600">
                    Contact Us
                  </a>
                </li>
                <li>
                  <a href="#" className="transition-colors hover:text-orange-600">
                    FAQ
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="flex flex-col items-center justify-between gap-6 border-t border-black/5 pt-12 text-[10px] font-bold uppercase tracking-widest text-gray-400 md:flex-row">
            <p>© 2026 Nick Eunson. All rights reserved.</p>
            <p>Designed for performance.</p>
          </div>
        </div>
      </footer>

      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          animation: marquee 30s linear infinite;
        }
      `}</style>
    </div>
  );
}