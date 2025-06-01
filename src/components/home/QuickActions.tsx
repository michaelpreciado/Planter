'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';

const actions = [
  {
    id: 'add-plant',
    title: 'Add Plant',
    description: 'Add a new plant to your collection',
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
      </svg>
    ),
    href: '/add-plant',
    color: 'from-green-500 to-emerald-600',
  },
  {
    id: 'view-plants',
    title: 'My Plants',
    description: 'View and manage your plants',
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
      </svg>
    ),
    href: '/plants',
    color: 'from-blue-500 to-indigo-600',
  },
  {
    id: 'settings',
    title: 'Settings',
    description: 'Customize your experience',
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
    href: '/settings',
    color: 'from-purple-500 to-pink-600',
  },
];

export function QuickActions() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: 'spring',
        stiffness: 100,
        damping: 15,
      },
    },
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="text-center mb-8"
      >
        <h3 className="text-xl font-semibold text-foreground mb-2">Quick Actions</h3>
        <p className="text-muted-foreground">Everything you need at your fingertips</p>
      </motion.div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 md:grid-cols-3 gap-6"
      >
        {actions.map((action) => (
          <motion.div key={action.id} variants={itemVariants}>
            <Link href={action.href}>
              <motion.div
                className="group relative overflow-hidden rounded-2xl card-glass p-6 h-full cursor-pointer"
                whileHover={{ 
                  scale: 1.02,
                  y: -4
                }}
                whileTap={{ scale: 0.98 }}
                transition={{ type: 'spring', stiffness: 400, damping: 17 }}
              >
                {/* Background gradient */}
                <div className={`absolute inset-0 bg-gradient-to-br ${action.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />
                
                {/* Content */}
                <div className="relative z-10 flex flex-col items-center text-center space-y-4">
                  <motion.div
                    className={`p-3 rounded-2xl bg-gradient-to-br ${action.color} text-white shadow-lg`}
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    transition={{ type: 'spring', stiffness: 500 }}
                  >
                    {action.icon}
                  </motion.div>
                  
                  <div>
                    <h4 className="font-semibold text-foreground mb-1">{action.title}</h4>
                    <p className="text-sm text-muted-foreground">{action.description}</p>
                  </div>
                  
                  {/* Arrow indicator */}
                  <motion.div
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                    initial={false}
                    animate={{ x: 0 }}
                    whileHover={{ x: 4 }}
                  >
                    <svg className="w-5 h-5 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </motion.div>
                </div>
              </motion.div>
            </Link>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
} 