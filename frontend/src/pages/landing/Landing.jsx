import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Shield, AlertTriangle, Map, Bell, BarChart3, Brain, 
  Users, ChevronRight, Star, Globe, Clock, Activity,
  ArrowRight, Menu, X
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';

const stats = [
  { label: 'Active Users', value: '10,000+', icon: Users },
  { label: 'Incidents Tracked', value: '50,000+', icon: AlertTriangle },
  { label: 'Cities Covered', value: '100+', icon: Globe },
  { label: 'Response Time', value: '< 2min', icon: Clock },
];

const features = [
  {
    icon: Brain,
    title: 'AI-Powered Predictions',
    description: 'Advanced machine learning algorithms predict emergency patterns and provide real-time risk assessments.',
  },
  {
    icon: Map,
    title: 'Real-Time Mapping',
    description: 'Interactive city maps with live incident tracking, resource allocation, and emergency response coordination.',
  },
  {
    icon: Bell,
    title: 'Instant Alerts',
    description: 'Multi-channel alert system that notifies citizens and responders during critical situations.',
  },
  {
    icon: BarChart3,
    title: 'Advanced Analytics',
    description: 'Comprehensive dashboards with detailed analytics, trends, and performance metrics.',
  },
  {
    icon: Shield,
    title: 'Smart Resource Management',
    description: 'Intelligent allocation of emergency resources based on real-time data and predictive analysis.',
  },
  {
    icon: Activity,
    title: 'Live Monitoring',
    description: 'Continuous monitoring of city infrastructure, weather conditions, and emergency services.',
  },
];

const steps = [
  { number: '01', title: 'Report Incident', description: 'Citizens report emergencies through the platform with location data.' },
  { number: '02', title: 'AI Analysis', description: 'Our AI analyzes severity, predicts impact, and suggests response strategies.' },
  { number: '03', title: 'Dispatch Responders', description: 'Emergency services are automatically dispatched with optimal routing.' },
  { number: '04', title: 'Track & Resolve', description: 'Real-time tracking of response progress until incident resolution.' },
];

export default function Landing() {
  const { user } = useAuth();
  const [mobileMenu, setMobileMenu] = useState(false);
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-gray-950">
      <nav className="fixed top-0 left-0 right-0 z-50">
        <div className={`transition-all duration-300 ${scrollY > 20 ? 'glass border-b border-gray-800/50' : 'bg-transparent'}`}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-neon-cyan to-neon-purple flex items-center justify-center">
                  <Shield className="w-5 h-5 text-white" />
                </div>
                <span className="font-bold text-lg gradient-text">UrbanShield AI</span>
              </div>

              <div className="hidden md:flex items-center gap-6">
                <a href="#features" className="text-sm text-gray-300 hover:text-white transition-colors">Features</a>
                <a href="#how-it-works" className="text-sm text-gray-300 hover:text-white transition-colors">How It Works</a>
                <a href="#stats" className="text-sm text-gray-300 hover:text-white transition-colors">Stats</a>
                {user ? (
                  <Link to="/dashboard" className="btn-primary text-sm !px-5 !py-2">
                    Dashboard
                  </Link>
                ) : (
                  <>
                    <Link to="/login" className="text-sm text-gray-300 hover:text-white transition-colors">Login</Link>
                    <Link to="/register" className="btn-primary text-sm !px-5 !py-2">Get Started</Link>
                  </>
                )}
              </div>

              <button className="md:hidden text-gray-300" onClick={() => setMobileMenu(!mobileMenu)}>
                {mobileMenu ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {mobileMenu && (
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="md:hidden glass border-b border-gray-800/50 p-4 space-y-3">
            <a href="#features" className="block text-sm text-gray-300 py-2">Features</a>
            <a href="#how-it-works" className="block text-sm text-gray-300 py-2">How It Works</a>
            <a href="#stats" className="block text-sm text-gray-300 py-2">Stats</a>
            {user ? (
              <Link to="/dashboard" className="block btn-primary text-center text-sm">Dashboard</Link>
            ) : (
              <div className="flex gap-3 pt-2">
                <Link to="/login" className="flex-1 btn-secondary text-center text-sm">Login</Link>
                <Link to="/register" className="flex-1 btn-primary text-center text-sm">Sign Up</Link>
              </div>
            )}
          </motion.div>
        )}
      </nav>

      <section className="relative min-h-screen flex items-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-950 via-primary-950/20 to-gray-950" />
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-neon-cyan/10 rounded-full blur-[128px]" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-neon-purple/10 rounded-full blur-[128px]" />
          <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-neon-pink/5 rounded-full blur-[96px]" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32">
          <div className="max-w-4xl">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-neon-cyan/10 border border-neon-cyan/20 text-neon-cyan text-sm mb-6">
                <Star className="w-4 h-4" />
                <span>AI-Powered Emergency Response Platform</span>
              </div>
            </motion.div>

            <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }}
              className="text-5xl sm:text-6xl lg:text-8xl font-bold leading-tight mb-6"
            >
              <span className="gradient-text">Smart City</span>
              <br />
              <span className="text-white">Emergency Response</span>
            </motion.h1>

            <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }}
              className="text-lg sm:text-xl text-gray-400 max-w-2xl mb-8"
            >
              Revolutionizing urban emergency management with AI-driven predictions, real-time monitoring, 
              and intelligent resource coordination for safer cities.
            </motion.p>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-wrap gap-4"
            >
              {user ? (
                <Link to="/dashboard" className="btn-primary text-lg !px-8 !py-4">
                  Go to Dashboard <ArrowRight className="w-5 h-5 ml-2 inline" />
                </Link>
              ) : (
                <>
                  <Link to="/register" className="btn-primary text-lg !px-8 !py-4">
                    Get Started Free <ArrowRight className="w-5 h-5 ml-2 inline" />
                  </Link>
                  <Link to="/login" className="btn-secondary text-lg !px-8 !py-4">
                    Sign In
                  </Link>
                </>
              )}
            </motion.div>
          </div>
        </div>

        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce">
          <ChevronRight className="w-6 h-6 text-gray-500 rotate-90" />
        </div>
      </section>

      <section id="features" className="py-24 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-gray-950 via-primary-950/5 to-gray-950" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl sm:text-5xl font-bold mb-4">
              <span className="gradient-text">Powerful Features</span>
            </h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              Everything you need to manage city-wide emergencies effectively
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="glass-card p-8 hover:border-primary-500/30 transition-all duration-300 group"
              >
                <div className="w-12 h-12 rounded-xl bg-primary-500/10 border border-primary-500/20 flex items-center justify-center mb-4 group-hover:bg-primary-500/20 transition-colors">
                  <feature.icon className="w-6 h-6 text-primary-400" />
                </div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-gray-400 leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section id="how-it-works" className="py-24 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl sm:text-5xl font-bold mb-4">
              <span className="gradient-text">How It Works</span>
            </h2>
            <p className="text-gray-400 text-lg">From incident report to resolution in four simple steps</p>
          </motion.div>

          <div className="relative">
            <div className="hidden lg:block absolute top-1/2 left-[15%] right-[15%] h-0.5 bg-gradient-to-r from-neon-cyan/30 via-neon-purple/30 to-neon-pink/30 -translate-y-1/2" />
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {steps.map((step, index) => (
                <motion.div
                  key={step.number}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.15 }}
                  className="text-center relative"
                >
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-neon-cyan to-neon-purple flex items-center justify-center mx-auto mb-4 text-xl font-bold shadow-lg shadow-neon-cyan/20">
                    {step.number}
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{step.title}</h3>
                  <p className="text-gray-400 text-sm">{step.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="stats" className="py-24 relative">
        <div className="absolute inset-0 bg-gradient-to-r from-neon-cyan/5 via-neon-purple/5 to-neon-pink/5" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="text-center"
              >
                <div className="w-14 h-14 rounded-xl bg-primary-500/10 border border-primary-500/20 flex items-center justify-center mx-auto mb-4">
                  <stat.icon className="w-7 h-7 text-primary-400" />
                </div>
                <div className="text-4xl font-bold gradient-text mb-1">{stat.value}</div>
                <div className="text-gray-400">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <h2 className="text-4xl sm:text-5xl font-bold mb-4">
              Ready to Make Your City <span className="gradient-text">Safer?</span>
            </h2>
            <p className="text-gray-400 text-lg mb-8 max-w-2xl mx-auto">
              Join thousands of cities using UrbanShield AI to protect their citizens and respond to emergencies faster.
            </p>
            {user ? (
              <Link to="/dashboard" className="btn-primary text-lg !px-8 !py-4">
                Go to Dashboard <ArrowRight className="w-5 h-5 ml-2 inline" />
              </Link>
            ) : (
              <Link to="/register" className="btn-primary text-lg !px-8 !py-4">
                Get Started Free <ArrowRight className="w-5 h-5 ml-2 inline" />
              </Link>
            )}
          </motion.div>
        </div>
      </section>

      <footer className="border-t border-gray-800/50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-neon-cyan" />
              <span className="font-bold gradient-text">UrbanShield AI</span>
            </div>
            <p className="text-gray-500 text-sm">&copy; 2026 UrbanShield AI. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
