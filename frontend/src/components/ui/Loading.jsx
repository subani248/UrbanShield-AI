import { motion } from 'framer-motion';

export function Spinner({ className = '' }) {
  return (
    <motion.div
      className={`w-8 h-8 border-2 border-primary-500/30 border-t-primary-400 rounded-full ${className}`}
      animate={{ rotate: 360 }}
      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
    />
  );
}

export function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="text-center">
        <Spinner className="w-12 h-12 mx-auto mb-4" />
        <p className="text-gray-400 text-sm">Loading...</p>
      </div>
    </div>
  );
}

export function SkeletonCard() {
  return (
    <div className="glass-card p-6 space-y-4">
      <div className="skeleton h-4 w-3/4" />
      <div className="skeleton h-8 w-1/2" />
      <div className="skeleton h-4 w-full" />
      <div className="skeleton h-4 w-2/3" />
    </div>
  );
}

export function SkeletonTable({ rows = 5 }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex gap-4">
          <div className="skeleton h-12 flex-1" />
          <div className="skeleton h-12 w-24" />
          <div className="skeleton h-12 w-24" />
          <div className="skeleton h-12 w-32" />
        </div>
      ))}
    </div>
  );
}
