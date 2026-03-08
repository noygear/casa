import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle2, Terminal, Calendar as CalendarIcon, MousePointer2 } from 'lucide-react';

export function LandingPage() {
  // Custom hook for scroll animations
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('opacity-100', 'translate-y-0');
            entry.target.classList.remove('opacity-0', 'translate-y-8');
          }
        });
      },
      { threshold: 0.1 }
    );

    document.querySelectorAll('.scroll-reveal').forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  // Card 1: Diagnostic Shuffler State
  const labels = ["HVAC Inspection Passed", "Elevator Safety Verified", "Fire Suppression Validated"];
  const [shufflerIndex, setShufflerIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setShufflerIndex(prev => (prev + 1) % labels.length);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  // Card 2: Telemetry Typewriter State
  const [telemetry, setTelemetry] = useState("");
  const lines = [
    "> UPLOADING EVIDENCE...",
    "> PHOTO VERIFIED...",
    "> COMPLIANCE SCORE: 98%"
  ];

  useEffect(() => {
    let currentLine = 0;
    let currentChar = 0;
    let currentText = "";

    const type = () => {
      if (currentLine < lines.length) {
        if (currentChar < lines[currentLine].length) {
          currentText += lines[currentLine][currentChar];
          setTelemetry(currentText);
          currentChar++;
          setTimeout(type, 50);
        } else {
          currentText += "\n";
          setTelemetry(currentText);
          currentChar = 0;
          currentLine++;
          setTimeout(type, 800);
        }
      } else {
        // Reset loop
        setTimeout(() => {
          currentLine = 0;
          currentChar = 0;
          currentText = "";
          setTelemetry("");
          type();
        }, 3000);
      }
    };
    
    // Start after initial delay
    const initialDelay = setTimeout(type, 1000);
    return () => clearTimeout(initialDelay);
  }, []);

  return (
    <div className="min-h-screen bg-obsidian text-cool-grey font-sans relative selection:bg-signal-red selection:text-white overflow-x-hidden">
      {/* Global CSS Noise Overlay */}
      <div className="bg-noise" />

      {/* A. NAVBAR */}
      <nav className="relative z-20 flex items-center justify-between px-6 py-6 md:px-12">
        <div className="text-2xl font-bold font-sans tracking-tight text-white flex items-center gap-3">
          <div className="w-8 h-8 bg-signal-red rounded animate-pulse-slow"></div>
          CARDO
        </div>
        <Link 
          to="/login"
          className="px-8 py-3 bg-white text-black text-sm font-bold uppercase tracking-wider rounded-full hover:scale-[1.03] transition-transform duration-300 shadow-[0_0_20px_rgba(255,255,255,0.1)]"
        >
          Login
        </Link>
      </nav>

      {/* B. HERO SECTION & C. FEATURE CARDS */}
      <main className="relative z-10 px-6 md:px-12 pt-20 pb-32">
        <div className="max-w-[1400px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
          
          {/* Hero Content */}
          <div className="lg:col-span-6 flex flex-col justify-center">
            <h1 className="text-6xl sm:text-7xl md:text-8xl xl:text-9xl tracking-tighter uppercase font-bold text-white leading-[0.85] mb-4">
              Operate<br/>The
            </h1>
            <h2 className="text-6xl sm:text-7xl md:text-8xl xl:text-[140px] font-serif italic text-signal-red leading-[0.8] mb-8 lg:-mr-20 z-20 mix-blend-screen">
              System.
            </h2>
            <p className="text-lg sm:text-xl max-w-lg mb-12 leading-relaxed text-cool-grey font-light">
              Cardo is the central operating axis for institutional real estate, enforcing structured maintenance accountability and vendor performance.
            </p>
            <div>
              <Link 
                to="/login"
                className="inline-flex items-center gap-4 px-8 py-5 bg-signal-red text-white uppercase font-bold text-sm tracking-widest rounded-full hover:scale-[1.03] transition-transform duration-300 shadow-2xl shadow-signal-red/20"
              >
                Deploy Cardo System <ArrowRight size={18} />
              </Link>
            </div>
          </div>

          {/* Functional Micro-UIs Display */}
          <div className="lg:col-span-6 relative h-[600px] hidden md:block">
            {/* Ambient Background Grid */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_10%,transparent_100%)]"></div>

            {/* Card 1: Diagnostic Shuffler */}
            <div className="absolute top-10 right-0 lg:right-10 w-80 bg-black border border-white/10 p-6 rounded-[2rem] hover:scale-[1.03] transition-transform duration-500 shadow-2xl z-20 flex flex-col gap-4">
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <span className="text-[10px] font-mono text-gray-500 uppercase">System Diagnostics</span>
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
              </div>
              <div className="flex items-start gap-4 py-2">
                <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center shrink-0">
                  <CheckCircle2 size={20} className="text-emerald-500" />
                </div>
                <div>
                  <h3 className="text-white font-medium text-lg leading-tight mb-1 transition-all duration-300">
                    {labels[shufflerIndex]}
                  </h3>
                  <p className="text-xs text-gray-500 font-mono">ID: {Math.random().toString(36).substring(2, 10).toUpperCase()}</p>
                </div>
              </div>
            </div>

            {/* Card 2: Telemetry Typewriter */}
            <div className="absolute top-64 left-0 w-[380px] bg-[#0A0A0A] border opacity-95 border-white/5 p-6 rounded-[2rem] hover:scale-[1.03] transition-transform duration-500 shadow-2xl z-30">
              <div className="flex items-center gap-2 mb-4">
                <Terminal size={14} className="text-cool-grey" />
                <span className="text-[10px] font-mono text-cool-grey">audit_log.exe</span>
              </div>
              <pre className="font-mono text-sm text-signal-red whitespace-pre-wrap min-h-[80px] leading-relaxed">
                {telemetry}
                <span className="inline-block w-2 h-4 bg-signal-red animate-pulse ml-1 align-middle"></span>
              </pre>
            </div>

            {/* Card 3: Cursor Protocol Scheduler */}
            <div className="absolute bottom-10 right-20 w-72 bg-black border border-white/10 p-6 rounded-[2rem] hover:scale-[1.03] transition-transform duration-500 shadow-2xl z-10 overflow-hidden">
              <div className="flex items-center gap-3 mb-6">
                <CalendarIcon size={16} className="text-white" />
                <span className="text-xs font-bold text-white uppercase tracking-wider">Protocol Schedule</span>
              </div>
              <div className="grid grid-cols-4 gap-2 relative">
                {[...Array(12)].map((_, i) => (
                  <div key={i} className={`h-8 rounded-lg border border-white/5 ${i === 6 ? 'bg-signal-red/20 border-signal-red/50' : 'bg-white/[0.02]'}`}></div>
                ))}
                {/* Animated Cursor */}
                <div className="absolute top-10 left-16 animate-[bounce_2s_infinite] pointer-events-none">
                  <MousePointer2 size={24} className="text-white drop-shadow-lg" fill="currentColor" />
                  <div className="bg-white text-black text-[10px] font-bold px-2 py-1 rounded-full absolute top-6 left-4 whitespace-nowrap shadow-xl">
                    Quarterly HVAC PM
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </main>

      {/* D. PHILOSOPHY SECTION */}
      <section className="relative z-10 py-32 border-y border-white/5 bg-[#0A0A0A] overflow-hidden">
        <div className="scroll-reveal opacity-0 translate-y-8 transition-all duration-1000 max-w-5xl mx-auto px-6 md:px-12 text-center">
          <h3 className="text-3xl md:text-5xl font-serif italic text-white leading-tight mb-8">
            Most property management focuses on:<br/>
            <span className="text-cool-grey not-italic font-sans font-light line-through decoration-signal-red decoration-2">reactive fixes.</span>
          </h3>
          <p className="text-4xl md:text-6xl font-sans font-bold text-white uppercase tracking-tighter">
            We focus on: <span className="text-signal-red">Accountability Loops.</span>
          </p>
        </div>
      </section>

      {/* E. PROTOCOL SECTION (Sticky Stacking) */}
      <section className="relative z-10 px-6 md:px-12 py-16 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-start">
          
          <div className="sticky top-32 scroll-reveal opacity-0 translate-y-8 transition-all duration-700">
            <h2 className="text-5xl font-bold text-white uppercase tracking-tighter mb-6">The Protocol</h2>
            <p className="text-lg text-cool-grey font-light max-w-md">
              A systematic approach to institutional asset management. We strip away the ambiguity of manual reporting and replace it with cryptographic-like operational certainty.
            </p>
          </div>

          <div className="space-y-6">
            {/* Step 01 */}
            <div className="scroll-reveal opacity-0 translate-y-8 transition-all duration-700 delay-100 bg-black border border-white/10 p-10 rounded-[2rem] hover:scale-[1.03] hover:border-white/20 hover:shadow-2xl hover:shadow-signal-red/5">
              <div className="text-signal-red font-mono text-sm mb-6">STEP 01</div>
              <h3 className="text-3xl font-bold text-white mb-4">Standardize.</h3>
              <p className="text-cool-grey leading-relaxed">
                Transform operational problems into structured software systems. Create templates for every preventative maintenance scenario across all asset types.
              </p>
            </div>

            {/* Step 02 */}
            <div className="scroll-reveal opacity-0 translate-y-8 transition-all duration-700 delay-200 bg-black border border-white/10 p-10 rounded-[2rem] hover:scale-[1.03] hover:border-white/20 hover:shadow-2xl hover:shadow-signal-red/5">
              <div className="text-signal-red font-mono text-sm mb-6">STEP 02</div>
              <h3 className="text-3xl font-bold text-white mb-4">Enforce.</h3>
              <p className="text-cool-grey leading-relaxed">
                Require photo-evidence for every recurring operational task. No ticket is closed without visual verification that the standard was met.
              </p>
            </div>

            {/* Step 03 */}
            <div className="scroll-reveal opacity-0 translate-y-8 transition-all duration-700 delay-300 bg-black border border-white/10 p-10 rounded-[2rem] hover:scale-[1.03] hover:border-white/20 hover:shadow-2xl hover:shadow-signal-red/5">
              <div className="text-signal-red font-mono text-sm mb-6">STEP 03</div>
              <h3 className="text-3xl font-bold text-white mb-4">Audit.</h3>
              <p className="text-cool-grey leading-relaxed">
                Generate real-time performance scoring to identify deficiencies. Measure vendors on strict Quality, Consistency, Speed, and Volume metrics.
              </p>
            </div>
          </div>

        </div>
      </section>

      {/* FOOTER */}
      <footer className="relative z-10 border-t border-white/5 py-12 text-center text-sm font-mono text-cool-grey/50">
        <p>CARDO SYSTEMS INC. ALL RIGHTS RESERVED {new Date().getFullYear()}.</p>
      </footer>
    </div>
  );
}
