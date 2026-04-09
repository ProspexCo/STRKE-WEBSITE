/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion, AnimatePresence } from "motion/react";
import { useState, useEffect } from "react";
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
  CheckCircle
} from "lucide-react";

const programs = [
  {
    id: "lean-bulking",
    title: "12-Week Lean Bulk Blueprint",
    price: 49.99,
    icon: <Dumbbell className="w-8 h-8 text-orange-500" />,
    description: "Build lean muscle, increase strength, and add size without unnecessary fat gain. This system includes everything you need to gain quality size while staying lean and in control.",
    features: ["Structured training programs", "High-protein meal plan", "Grocery lists", "Supplement guide", "Guided progression system"],
    programLink: "https://canva.link/a5wkcu5shos2r16"
  },
  {
    id: "lean-cutting",
    title: "12-Week Lean Cut Blueprint",
    price: 49.99,
    icon: <Flame className="w-8 h-8 text-red-500" />,
    description: "Lose body fat while maintaining muscle, strength, and performance. Burn fat, stay strong, and get lean with a system that actually works.",
    features: ["Effective strength training", "LISS + HIIT cardio system", "High-protein nutrition plan", "Progression & adjustment system"],
    programLink: "https://canva.link/687i5v30uu1zrgr"
  },
  {
    id: "weight-maintenance",
    title: "12-Week Maintenance Blueprint",
    price: 49.99,
    icon: <Scale className="w-8 h-8 text-blue-500" />,
    description: "Maintain your physique, stay lean, and continue improving without extreme dieting or overtraining. Designed for sustainability and long-term results.",
    features: ["Balanced training programs", "Sustainable nutrition plan", "Controlled cardio approach", "Long-term performance focus"],
    programLink: "https://canva.link/7byvkad4ob1f53l"
  },
  {
    id: "max-bulking",
    title: "12-Week Extreme Mass Blueprint",
    price: 49.99,
    icon: <Dumbbell className="w-8 h-8 text-orange-800" />,
    description: "Gain size, build strength, and put on as much mass as possible. A proven 12-week system built for maximum muscle and weight gain.",
    features: ["Push Pull Legs (PPL) program", "Extreme mass nutrition plan", "Explosive performance training", "Muscle growth supplement guide", "Video guided demonstrations"],
    programLink: "https://canva.link/pl6mtlr4t2n5yfz"
  },
  {
    id: "body-sculpt",
    title: "12-Week Body Sculpt Blueprint",
    price: 49.99,
    icon: <Flame className="w-8 h-8 text-pink-500" />,
    description: "Build glutes, define your core, and sculpt a strong, balanced physique. A complete 12-week system designed for shape, strength, and confidence.",
    features: ["Glute-focused training", "Core development system", "Structured cardio protocol", "Sculpt nutrition plan", "Video guided demonstrations"],
    programLink: "https://canva.link/pxsa0bhq1opyb9c"
  }
];

const bundleProgram = {
  id: "the-bundle",
  title: "The 4-Type Transformation Bundle",
  price: 99.99,
  programLink: "https://canva.link/nm6lpkz0y2nsq65"
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

  const handlePurchase = async (program: typeof programs[0]) => {
    try {
      setLoading(program.id);
      const response = await fetch("https://strke-website-production.up.railway.app/api/create-checkout-session", {
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

      const session = await response.json();

      if (session.error) {
        throw new Error(session.error);
      }

      if (session.url) {
        // Redirect the current window (the iframe) to Stripe
        window.location.href = session.url;
      } else {
        throw new Error("No checkout URL returned from server");
      }
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
            className="fixed top-0 left-0 right-0 z-[100] p-4 flex justify-center"
          >
            <div className={`flex items-center gap-4 px-8 py-4 rounded-full shadow-2xl backdrop-blur-xl border ${
              status === "success" ? "bg-green-500/90 border-green-400 text-white" : "bg-red-500/90 border-red-400 text-white"
            }`}>
              {status === "success" ? (
                <>
                  <CheckCircle className="w-6 h-6" />
                  <p className="font-bold uppercase tracking-widest text-sm">Purchase Successful! Check your email.</p>
                </>
              ) : (
                <>
                  <X className="w-6 h-6" />
                  <p className="font-bold uppercase tracking-widest text-sm">Purchase Canceled.</p>
                </>
              )}
              <button onClick={() => setStatus(null)} className="ml-4 opacity-60 hover:opacity-100">
                <X className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-black/5">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="font-bold text-xl tracking-tighter uppercase">Nick Eunson</div>
          <div className="hidden md:flex items-center gap-8 text-sm font-medium uppercase tracking-wider">
            <a href="#story" className="hover:text-orange-600 transition-colors">My Story</a>
            <a href="#programs" className="hover:text-orange-600 transition-colors">Programs</a>
            <a href="#bundle" className="hover:text-orange-600 transition-colors font-bold text-orange-600">The Bundle</a>
          </div>
          <button className="bg-black text-white px-5 py-2 rounded-full text-xs font-bold uppercase tracking-widest hover:bg-orange-600 transition-all">
            Get Started
          </button>
        </div>
      </nav>

      {/* Hero Section - Split Layout */}
      <section className="pt-32 pb-20 px-6 max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center min-h-[80vh]">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div className="flex items-center gap-2 mb-6">
            <span className="h-px w-8 bg-orange-500"></span>
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-orange-600">Transform Your Life</span>
          </div>
          <h1 className="text-7xl md:text-8xl font-semibold leading-[0.88] tracking-tighter mb-8">
            MASTER YOUR <br /> <span className="text-orange-600 italic">PHYSIQUE.</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-md mb-10 leading-relaxed">
            Science-backed training programs designed to take the guesswork out of your fitness journey. Whether you're bulking, cutting, or maintaining.
          </p>
          <div className="flex flex-wrap gap-4">
            <a href="#programs" className="bg-black text-white px-8 py-4 rounded-full font-bold uppercase tracking-widest hover:bg-orange-600 transition-all flex items-center gap-2 group">
              View Programs <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </a>
            <a href="#story" className="border border-black/10 px-8 py-4 rounded-full font-bold uppercase tracking-widest hover:bg-black hover:text-white transition-all">
              My Story
            </a>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, delay: 0.2 }}
          className="relative aspect-square lg:aspect-auto lg:h-[600px] bg-gray-200 rounded-3xl overflow-hidden group"
        >
          <img 
            src="/input_file_0.png" 
            alt="Fitness Transformation" 
            className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700"
            referrerPolicy="no-referrer"
          />
        </motion.div>
      </section>

      {/* Authority/Stats Section */}
      <section className="bg-black py-12 overflow-hidden">
        <div className="flex whitespace-nowrap animate-marquee">
          {[...Array(10)].map((_, i) => (
            <div key={i} className="flex items-center gap-12 mx-6">
              <span className="text-white/20 text-4xl font-black uppercase tracking-tighter">Science Backed</span>
              <span className="text-orange-500 text-4xl font-black uppercase tracking-tighter">Results Driven</span>
              <span className="text-white/20 text-4xl font-black uppercase tracking-tighter">Elite Performance</span>
            </div>
          ))}
        </div>
      </section>

      {/* My Story Section */}
      <section id="story" className="py-32 px-6 bg-white">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-20 items-center">
          <div className="order-2 lg:order-1">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-4">
                <div className="aspect-[3/4] bg-gray-100 rounded-2xl overflow-hidden relative group">
                  <img src="/input_file_1.png" alt="Before Transformation" className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all" referrerPolicy="no-referrer" />
                  <div className="absolute top-4 left-4 bg-black/50 backdrop-blur-md text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest">Before</div>
                </div>
                <div className="aspect-square bg-orange-500 rounded-2xl flex items-center justify-center p-8 text-white">
                  <Award className="w-16 h-16" />
                </div>
              </div>
              <div className="space-y-4 pt-12">
                <div className="aspect-square bg-black rounded-2xl flex flex-col justify-end p-6 text-white relative overflow-hidden group">
                  <img src="/input_file_2.png" alt="100lb+ Weight Gained" className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:opacity-80 transition-opacity" referrerPolicy="no-referrer" />
                  <div className="relative z-10">
                    <p className="text-4xl font-bold mb-1">100lb+</p>
                    <p className="text-[10px] uppercase tracking-widest opacity-60">Weight Gained</p>
                  </div>
                </div>
                <div className="aspect-[3/4] bg-gray-100 rounded-2xl overflow-hidden relative group">
                  <img src="/input_file_0.png" alt="After Transformation" className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all" referrerPolicy="no-referrer" />
                  <div className="absolute top-4 left-4 bg-orange-600 text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest shadow-lg">After</div>
                </div>
              </div>
            </div>
          </div>

          <div className="order-1 lg:order-2">
            <div className="flex items-center gap-2 mb-6">
              <span className="h-px w-8 bg-orange-500"></span>
              <span className="text-xs font-bold uppercase tracking-[0.2em] text-orange-600">The Man Behind The Method</span>
            </div>
            <h2 className="text-5xl font-semibold tracking-tighter mb-8">
              I BUILT THE <br /> <span className="italic text-orange-600">IMPOSSIBLE.</span>
            </h2>
            <div className="space-y-6 text-gray-600 leading-relaxed">
              <p>
                From ages 14 to 19, I gained over 100 pounds, going from 100 lbs to 205 lbs. I started as someone who lacked confidence, knowledge, and direction. Like most people, I didn’t know where to begin, what worked, or how to stay consistent. I was also someone who struggled to see progress—I didn't know what to eat or how to train properly.
              </p>
              <p>
                So over the next 4½ years, I committed to learning, training, and refining everything, from workouts to nutrition to recovery. Eventually, I built the physique I once thought was impossible by strengthening my mindset and building discipline.
              </p>
              <div className="bg-gray-50 p-6 rounded-2xl border-l-4 border-orange-500">
                <p className="font-medium text-black italic">
                  "These programs contain everything I wish I had when I started. With all the information provided, you can achieve more than you ever thought you could."
                </p>
              </div>
              <div className="space-y-2">
                <p className="font-bold text-black uppercase text-xs tracking-widest">It combines:</p>
                <ul className="grid grid-cols-1 gap-2">
                  <li className="flex items-center gap-2 text-sm"><CheckCircle2 className="w-4 h-4 text-orange-500" /> What actually works</li>
                  <li className="flex items-center gap-2 text-sm"><CheckCircle2 className="w-4 h-4 text-orange-500" /> What saves you time</li>
                  <li className="flex items-center gap-2 text-sm"><CheckCircle2 className="w-4 h-4 text-orange-500" /> What produces real, lasting results</li>
                </ul>
              </div>
              <p className="text-sm">
                So you don’t waste years figuring it out on your own like I did. You have the information in front of you. Now all it takes is the mindset that you can be great.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Programs Section */}
      <section id="programs" className="py-32 px-6 bg-[#f5f5f4]">
        <div className="max-w-7xl mx-auto">
          {purchaseError && (
            <div className="mb-8 p-4 bg-red-50 border border-red-200 text-red-600 rounded-2xl flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Flame className="w-5 h-5" />
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
          <div className="text-center mb-20">
            <div className="flex items-center justify-center gap-2 mb-6">
              <span className="h-px w-8 bg-orange-500"></span>
              <span className="text-xs font-bold uppercase tracking-[0.2em] text-orange-600">Choose Your Goal</span>
              <span className="h-px w-8 bg-orange-500"></span>
            </div>
            <h2 className="text-6xl font-semibold tracking-tighter">THE PROGRAMS</h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {programs.map((program) => (
              <motion.div 
                key={program.id}
                whileHover={{ y: -10 }}
                className="bg-white p-10 rounded-3xl border border-black/5 flex flex-col h-full shadow-sm"
              >
                <div className="mb-8">{program.icon}</div>
                <h3 className="text-3xl font-bold tracking-tight mb-4">{program.title}</h3>
                <p className="text-gray-500 mb-8 flex-grow leading-relaxed">
                  {program.description}
                </p>
                <div className="space-y-4 mb-10">
                  {program.features.map((feature, i) => (
                    <div key={i} className="flex items-center gap-3 text-sm">
                      <CheckCircle2 className="w-4 h-4 text-orange-500 shrink-0" />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
                <div className="pt-8 border-t border-black/5 flex items-center justify-between">
                  <div>
                    <p className="text-[10px] uppercase tracking-widest text-gray-400 mb-1">Limited Time Offer</p>
                    <div className="flex items-baseline gap-2">
                      <p className="text-3xl font-bold">${program.price}</p>
                      {program.originalPrice && (
                        <p className="text-sm text-gray-400 line-through">${program.originalPrice}</p>
                      )}
                    </div>
                  </div>
                  <button 
                    onClick={() => handlePurchase(program)}
                    disabled={loading !== null}
                    className="bg-black text-white px-6 py-3 rounded-full text-xs font-bold uppercase tracking-widest hover:bg-orange-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {loading === program.id ? (
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : null}
                    {loading === program.id ? "Processing..." : "Buy Now"}
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* The Bundle Section */}
      <section id="bundle" className="py-32 px-6">
        <div className="max-w-7xl mx-auto bg-black rounded-[40px] overflow-hidden relative">
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-orange-600/20 to-transparent pointer-events-none"></div>
          <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-orange-600/30 blur-[120px] rounded-full pointer-events-none"></div>

          <div className="relative z-10 p-12 md:p-24 grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-orange-600 text-white px-4 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest mb-8">
                Best Value
              </div>
              <h2 className="text-5xl md:text-7xl font-bold text-white tracking-tighter mb-8 leading-[0.9]">
                THE BUNDLE <br /> <span className="text-orange-500 italic text-4xl md:text-5xl block mt-4">The 4-Type Transformation Blueprint</span>
              </h2>
              <div className="space-y-6 text-white/80 text-lg mb-10 leading-relaxed max-w-xl">
                <p>
                  A complete, step-by-step system designed to take you from where you are now to a stronger, leaner, more confident physique in 12 weeks.
                </p>
                <p className="text-sm text-white/60">
                  This program combines multiple proven training splits, structured nutrition plans for any goal (bulk, cut, or maintain), a full supplement guide, and a built-in progress tracking system. Every exercise is supported with video demonstrations so you know exactly how to train with proper form and maximize results.
                </p>
                <p className="font-bold text-orange-500">
                  Everything you need — training, nutrition, cardio, and progression — all in one system with no guesswork.
                </p>
              </div>
              <div className="space-y-4 mb-12">
                <div className="flex items-center gap-4 text-white">
                  <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                    <CheckCircle2 className="w-5 h-5 text-orange-500" />
                  </div>
                  <span className="font-medium">All 4 Core Programs Included</span>
                </div>
                <div className="flex items-center gap-4 text-white">
                  <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                    <CheckCircle2 className="w-5 h-5 text-orange-500" />
                  </div>
                  <span className="font-medium">Exclusive Nutrition Masterclass</span>
                </div>
                <div className="flex items-center gap-4 text-white">
                  <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                    <CheckCircle2 className="w-5 h-5 text-orange-500" />
                  </div>
                  <span className="font-medium">Lifetime Updates & Community Access</span>
                </div>
              </div>
            </div>

            <div className="bg-white/5 backdrop-blur-sm border border-white/10 p-12 rounded-[32px] text-center">
              <Package className="w-16 h-16 text-orange-500 mx-auto mb-6" />
              <p className="text-white/40 text-sm uppercase tracking-[0.2em] mb-2">Total Value ${bundleProgram.originalPrice}</p>
              <div className="flex items-center justify-center gap-4 mb-8">
                <span className="text-white/20 text-4xl line-through font-bold">${bundleProgram.originalPrice}</span>
                <span className="text-white text-7xl font-black">${bundleProgram.price}</span>
              </div>
              <button 
                onClick={() => handlePurchase(bundleProgram as any)}
                disabled={loading !== null}
                className="w-full bg-orange-600 text-white py-6 rounded-2xl font-black uppercase tracking-[0.2em] hover:bg-orange-500 transition-all shadow-[0_0_40px_rgba(249,115,22,0.3)] mb-6 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
              >
                {loading === bundleProgram.id ? (
                  <div className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin" />
                ) : null}
                {loading === bundleProgram.id ? "Processing..." : "Claim The Bundle"}
              </button>
              <p className="text-white/40 text-xs">Secure checkout. Instant digital delivery.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white pt-24 pb-12 px-6 border-t border-black/5">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-12 mb-20">
            <div className="col-span-2">
              <div className="font-bold text-2xl tracking-tighter uppercase mb-6">Nick Eunson</div>
              <p className="text-gray-500 max-w-sm mb-8 leading-relaxed">
                Building physiques through science, dedication, and proven methods.
              </p>
              <div className="flex gap-4">
                <a href="https://instagram.com/eunsonlifts" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center hover:bg-orange-500 hover:text-white transition-all">
                  <Instagram className="w-5 h-5" />
                </a>
                <a href="https://tiktok.com/@eunsonlifts" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center hover:bg-orange-500 hover:text-white transition-all">
                  <Music2 className="w-5 h-5" />
                </a>
                <a href="https://twitter.com/nickeunsonn" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center hover:bg-orange-500 hover:text-white transition-all">
                  <Twitter className="w-5 h-5" />
                </a>
                <a href="https://youtube.com/@nickeunson" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center hover:bg-orange-500 hover:text-white transition-all">
                  <Youtube className="w-5 h-5" />
                </a>
              </div>
            </div>
            <div>
              <h4 className="font-bold uppercase tracking-widest text-xs mb-6">Programs</h4>
              <ul className="space-y-4 text-sm text-gray-500">
                <li><a href="#programs" className="hover:text-orange-600 transition-colors">Lean Bulk Blueprint</a></li>
                <li><a href="#programs" className="hover:text-orange-600 transition-colors">Lean Cut Blueprint</a></li>
                <li><a href="#programs" className="hover:text-orange-600 transition-colors">Maintenance Blueprint</a></li>
                <li><a href="#programs" className="hover:text-orange-600 transition-colors">Extreme Mass Blueprint</a></li>
                <li><a href="#programs" className="hover:text-orange-600 transition-colors">Body Sculpt Blueprint</a></li>
                <li><a href="#bundle" className="hover:text-orange-600 transition-colors">The 4-Type Bundle</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold uppercase tracking-widest text-xs mb-6">Support</h4>
              <ul className="space-y-4 text-sm text-gray-500">
                <li><a href="#" className="hover:text-orange-600 transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-orange-600 transition-colors">Terms of Service</a></li>
                <li><a href="#" className="hover:text-orange-600 transition-colors">Contact Us</a></li>
                <li><a href="#" className="hover:text-orange-600 transition-colors">FAQ</a></li>
              </ul>
            </div>
          </div>
          <div className="pt-12 border-t border-black/5 flex flex-col md:flex-row items-center justify-between gap-6 text-[10px] uppercase tracking-widest text-gray-400 font-bold">
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
