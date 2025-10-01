'use client';

import React, { useMemo } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import dynamic from 'next/dynamic';
import { scheduleWork } from '../../utils/performance';

// Dynamic import for better code splitting
const AnimatedBackground = dynamic(() => import('../../components/AnimatedBackground'), {
  ssr: false,
  loading: () => null
});

const pageTransition = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
  exit: { opacity: 0, y: -10, transition: { duration: 0.3, ease: 'easeIn' } }
};

// Tech icon mapping
const getTechIcon = (tech: string) => {
  const iconMap: { [key: string]: string } = {
    'Next.js': '/icons/nextjs.svg',
    'React': '/icons/react.svg',
    'TypeScript': '/icons/typescript.svg',
    'JavaScript': '/icons/javascript.svg',
    'Supabase': '/icons/supabase.svg',
    'PostgreSQL': '/icons/postgresql.svg',
    'Python': '/icons/python.svg',
    'Flask': '/icons/flask.svg',
    'Tailwind CSS': '/icons/tailwindcss.svg',
    'shadcn/ui': 'https://ui.shadcn.com/favicon.ico', // Keep this as CDN since it's a special case
    'VS Code': '/icons/vscode.svg',
    'GitHub': '/icons/github.svg',
    'Git': '/icons/git.svg'
  };
  return iconMap[tech] || null;
};

const TechBadge = ({ tech }: { tech: string }) => {
  const icon = getTechIcon(tech);
  
  return (
    <span className="flex items-center gap-1.5 px-3 py-1 bg-white/10 text-white rounded-full text-xs font-medium border border-white/20">
      {icon && (
        <Image 
          src={icon} 
          alt={tech} 
          width={12}
          height={12}
          className={`${tech === 'Next.js' || tech === 'GitHub' ? 'filter invert' : ''}`}
          loading="lazy"
          style={{
            transform: 'translateZ(0)', // GPU acceleration
            backfaceVisibility: 'hidden'
          }}
        />
      )}
      {tech}
    </span>
  );
};

const ProjectCard = ({ 
  title, 
  subtitle, 
  description, 
  technologies, 
  type,
  gradient,
  liveUrl,
  githubUrl
}: {
  title: string;
  subtitle: string;
  description: string;
  technologies: string[];
  type: 'experience' | 'project' | 'hackathon';
  gradient: string;
  liveUrl?: string;
  githubUrl?: string;
}) => (
  <motion.div
    className={`relative overflow-hidden rounded-2xl p-8 h-full bg-gradient-to-br ${gradient} border border-white/10 transform-gpu will-change-transform`}
    whileHover={{ scale: 1.01 }}
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.3, ease: "easeOut" }}
  >
    <div className="absolute inset-0 opacity-5">
      <div className="absolute top-4 right-4 w-20 h-20 border border-white rounded-full"></div>
      <div className="absolute bottom-4 left-4 w-16 h-16 border border-white rounded-full"></div>
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-32 h-32 border border-white rounded-full"></div>
    </div>

    <div className="relative z-10">
      <div className="flex justify-between items-start mb-4">
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
          type === 'experience' 
            ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30' 
            : type === 'hackathon'
            ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
            : 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
        }`}>
          {type === 'experience' ? 'Experience' : type === 'hackathon' ? 'Hackathon' : 'Project'}
        </span>
        <div className="w-3 h-3 bg-white/20 rounded-full animate-pulse"></div>
      </div>

      <h3 className="text-2xl font-bold text-white mb-2">{title}</h3>
      <p className="text-slate-300 text-sm mb-4 font-medium">{subtitle}</p>
      <p className="text-slate-300 mb-6 leading-relaxed">{description}</p>

      <div className="flex flex-wrap gap-2 mb-6">
        {technologies.map((tech, index) => (
          <TechBadge key={index} tech={tech} />
        ))}
      </div>

      {/* Action Buttons */}
      {(liveUrl || githubUrl) && (
        <div className="flex gap-3">
          {liveUrl && (
            <motion.a
              href={liveUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 rounded-lg text-sm font-medium border border-blue-500/30 transition-colors transform-gpu"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
              Live Demo
            </motion.a>
          )}
          {githubUrl && (
            <motion.a
              href={githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 bg-gray-500/20 hover:bg-gray-500/30 text-gray-300 rounded-lg text-sm font-medium border border-gray-500/30 transition-colors transform-gpu"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
              </svg>
              GitHub
            </motion.a>
          )}
        </div>
      )}
    </div>
  </motion.div>
);

export default function Projects() {
  const projects = [
    {
      title: "Blucliv - Social Platform",
      subtitle: "Founding Engineer • July 2025 - Present",
      description: "Leading technical architecture as Founding Engineer. Built comprehensive role-based social networking platform with secure authentication, real-time chat functionality, and scalable PostgreSQL schema design.",
      technologies: ["Next.js", "Supabase", "PostgreSQL", "Real-time", "JavaScript"],
      type: "experience" as const,
      gradient: "from-blue-900/20 to-blue-800/20"
    },
    {
      title: "YOJ AI - Client Platform",
      subtitle: "Frontend & API Integration Intern • May 2025 - Aug 2025",
      description: "Frontend & API Integration Intern delivering responsive, pixel-perfect AI client platform. Integrating multiple AI APIs with real-time analytics dashboards and seamless user experience.",
      technologies: ["React", "AI Integration", "Analytics", "JavaScript", "UI/UX"],
      type: "experience" as const,
      gradient: "from-purple-900/20 to-purple-800/20",
      liveUrl: "https://demo.yoj.ai"
    },
    {
      title: "Video Format Converter",
      subtitle: "Open Source Tool • Personal Project",
      description: "Built an efficient video conversion tool using Python and FFmpeg, solving limitations of free online converters. Open-source project focused on user accessibility.",
      technologies: ["Python", "FFmpeg", "CLI", "Open Source"],
      type: "project" as const,
      gradient: "from-green-900/20 to-green-800/20",
      githubUrl: "https://github.com/borkeradarsh/avi-to-mp4"
    },
    {
      title: "PantryAI - Smart Recipe Assistant",
      subtitle: "IBM TechXchange Hackathon • Build with Agentic AI Challenge • 2025",
      description: "Built PantryAI, an AI-powered recipe assistant that suggests personalized recipes based on available pantry ingredients. Features real-time pantry tracking, both comfort and chef-style recipes, and production-ready AI integration using IBM watsonx. Combined Flask backend with clean frontend design and advanced prompt engineering for intelligent meal suggestions.",
      technologies: ["Flask", "IBM watsonx", "AI/ML", "Prompt Engineering", "Full-Stack", "API Integration"],
      type: "hackathon" as const,
      gradient: "from-cyan-900/20 to-cyan-800/20",
      githubUrl: "https://github.com/borkeradarsh/meal-planner"
    },
    {
      title: "Manufacturing ERP System",
      subtitle: "Odoo × NMIT Hackathon • 24-Hour Challenge • 2025",
      description: "Built a complete modular ERP system for manufacturing companies in just 24 hours. Transformed paper-heavy, error-prone production processes into a centralized digital platform with real-time tracking, role-based access, and comprehensive analytics. Led core development and GitHub collaboration while working under extreme time pressure.",
      technologies: ["Next.js", "JavaScript", "Supabase", "Tailwind CSS", "shadcn/ui", "PostgreSQL", "RLS"],
      type: "hackathon" as const,
      gradient: "from-indigo-900/20 to-blue-800/20",
      githubUrl: "https://github.com/borkeradarsh/odoo-hackathon"
    },
    {
      title: "Research & Development",
      subtitle: "Academic & Community Contributions",
      description: "Published research paper and contributed to VS Code bug reports. Active contributor to open-source projects and academic research in computer science.",
      technologies: ["Research", "VS Code", "Academic Writing", "Open Source"],
      type: "project" as const,
      gradient: "from-orange-900/20 to-orange-800/20"
    }
  ];

  const experiences = projects.filter(p => p.type === 'experience');
  const personalProjects = projects.filter(p => p.type === 'project');
  const hackathonProjects = projects.filter(p => p.type === 'hackathon');

  return (
    <div className="min-h-screen relative">
      <AnimatedBackground />
      
      <motion.div 
        className="relative z-10 container mx-auto px-6 py-24"
        variants={pageTransition}
        initial="initial"
        animate="animate"
        exit="exit"
      >
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <motion.h1 
              className="text-5xl md:text-6xl font-bold text-white mb-6"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              Projects & Experience
            </motion.h1>
            <motion.p 
              className="text-xl text-slate-300 max-w-3xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              Building scalable solutions and driving innovation through modern web technologies
            </motion.p>
          </div>

          <section className="mb-20">
            <motion.h2 
              className="text-3xl font-bold text-white mb-8 flex items-center"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="w-1 h-8 bg-gradient-to-b from-blue-400 to-purple-600 rounded-full mr-4"></div>
              Professional Experience
            </motion.h2>
            <div className="grid lg:grid-cols-2 gap-8">
              {experiences.map((project, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                >
                  <ProjectCard {...project} />
                </motion.div>
              ))}
            </div>
          </section>

          <section className="mb-20">
            <motion.h2 
              className="text-3xl font-bold text-white mb-8 flex items-center"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
            >
              <div className="w-1 h-8 bg-gradient-to-b from-green-400 to-purple-600 rounded-full mr-4"></div>
              Personal Projects
            </motion.h2>
            <div className="grid lg:grid-cols-2 gap-8">
              {personalProjects.map((project, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                >
                  <ProjectCard {...project} />
                </motion.div>
              ))}
            </div>
          </section>

          {/* Hackathon Projects */}
          {hackathonProjects.length > 0 && (
            <section className="mb-20">
              <motion.h2 
                className="text-3xl font-bold text-white mb-8 flex items-center"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: 0.2 }}
              >
                <div className="w-1 h-8 bg-gradient-to-b from-cyan-400 to-blue-600 rounded-full mr-4"></div>
                Hackathons & Competitions
              </motion.h2>
              <div className="grid lg:grid-cols-2 gap-8">
                {hackathonProjects.map((project, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                  >
                    <ProjectCard {...project} />
                  </motion.div>
                ))}
              </div>
              
              {/* Add More Hackathons CTA */}
              <motion.div 
                className="mt-8 text-center"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 1.0 }}
              >
                <div className="bg-gradient-to-r from-cyan-900/20 to-blue-900/20 rounded-xl p-6 border border-cyan-500/30">
                  <h3 className="text-lg font-semibold text-white mb-2">More Hackathon Projects Coming Soon!</h3>
                  <p className="text-slate-300 text-sm">
                    I regularly participate in hackathons and coding competitions. Check back for updates on my latest builds and innovations.
                  </p>
                </div>
              </motion.div>
            </section>
          )}

          <motion.section 
            className="text-center"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.9 }}
          >
            <h2 className="text-3xl font-bold text-white mb-8">Impact & Results</h2>
            <div className="grid md:grid-cols-3 gap-8">
              <motion.div 
                className="bg-gradient-to-br from-blue-500/20 to-blue-600/20 rounded-2xl p-8 border border-blue-500/30 relative overflow-hidden transform-gpu will-change-transform"
                whileHover={{ scale: 1.02 }}
              >
                <div className="absolute top-0 right-0 w-20 h-20 bg-blue-400/10 rounded-full -translate-y-10 translate-x-10"></div>
                <h3 className="text-4xl font-bold text-blue-300 mb-2">40-70%</h3>
                <p className="text-slate-300">Faster UI Performance</p>
              </motion.div>
              <motion.div 
                className="bg-gradient-to-br from-green-500/20 to-green-600/20 rounded-2xl p-8 border border-green-500/30 relative overflow-hidden transform-gpu will-change-transform"
                whileHover={{ scale: 1.02 }}
              >
                <div className="absolute top-0 right-0 w-20 h-20 bg-green-400/10 rounded-full -translate-y-10 translate-x-10"></div>
                <h3 className="text-4xl font-bold text-green-300 mb-2">70%</h3>
                <p className="text-slate-300">Reduced Development Time</p>
              </motion.div>
              <motion.div 
                className="bg-gradient-to-br from-purple-500/20 to-purple-600/20 rounded-2xl p-8 border border-purple-500/30 relative overflow-hidden transform-gpu will-change-transform"
                whileHover={{ scale: 1.02 }}
              >
                <div className="absolute top-0 right-0 w-20 h-20 bg-purple-400/10 rounded-full -translate-y-10 translate-x-10"></div>
                <h3 className="text-4xl font-bold text-purple-300 mb-2">60%</h3>
                <p className="text-slate-300">Error Reduction</p>
              </motion.div>
            </div>
          </motion.section>
        </div>
      </motion.div>
    </div>
  );
}