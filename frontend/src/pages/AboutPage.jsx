// frontend/src/pages/AboutPage.jsx
import React from 'react';
import { 
  Users, 
  Award, 
  Sparkles, 
  ShieldCheck, 
  CheckCircle2, 
  Heart,
  Gem,
  Compass,
  Star
} from 'lucide-react';

export default function AboutPage() {
  const teamMembers = [
    {
      name: 'Ravi Raj',
      role: 'Co-Founder & Chief Technology Officer',
      specialty: 'Full-Stack Architecture & Security',
      bio: 'Architected the core transactional platform, secure tokenized user authentication, and high-performance booking engines.',
      image: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=400',
      badge: 'Full-Stack Lead',
    },
    {
      name: 'Manpreet',
      role: 'Co-Founder & Head of Data Systems',
      specialty: 'Relational Modeling & Normalization',
      bio: 'Designed the 3NF relational data framework across 12 entities, automated reservation triggers, and database-level business constraints.',
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=400',
      badge: 'Data Architect',
    },
    {
      name: 'Perirt',
      role: 'Co-Founder & VP of Engineering',
      specialty: 'Stored Procedures & Cloud Infrastructure',
      bio: 'Engineered high-throughput stored functions, automated double-booking prevention routines, and enterprise payment reconciliation.',
      image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=400',
      badge: 'Backend Specialist',
    },
    {
      name: 'Raj Tripathi',
      role: 'Co-Founder & Head of Product Design',
      specialty: 'UI/UX & Interactive Demonstrations',
      bio: 'Crafted the luxury wedding aesthetics, responsive booking interfaces for couples, and administrative query analytics consoles.',
      image: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=400',
      badge: 'Product & UI Lead',
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-16">
      
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <span className="text-xs font-bold uppercase tracking-widest text-gold-700">
          Our Heritage & Mission
        </span>
        <h1 className="font-serif text-3xl sm:text-5xl font-bold text-slate-900">
          Redefining Luxury Wedding Planning
        </h1>
        <p className="text-sm text-slate-600 leading-relaxed">
          Wedding Bliss was established with a singular vision: to bring mathematical precision, transactional certainty, and royal hospitality to India's most extraordinary celebrations.
        </p>
      </div>

      {/* Story & Philosophy */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
        <div className="bg-white p-8 rounded-3xl border border-champagne-300/80 shadow-sm space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-gold-100 text-gold-800 flex items-center justify-center">
            <Gem className="w-6 h-6" />
          </div>
          <h3 className="font-serif text-2xl font-bold text-slate-900">
            Uncompromising Luxury
          </h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Every palace, seaside villa, and master caterer on Wedding Bliss undergoes rigorous multi-point verification before induction into our certified collection.
          </p>
        </div>

        <div className="bg-white p-8 rounded-3xl border border-champagne-300/80 shadow-sm space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-gold-100 text-gold-800 flex items-center justify-center">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h3 className="font-serif text-2xl font-bold text-slate-900">
            Transactional Reliability
          </h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Backed by enterprise ACID transaction protocols and automated double-booking prevention, your dream wedding date is reserved with guaranteed peace of mind.
          </p>
        </div>

        <div className="bg-white p-8 rounded-3xl border border-champagne-300/80 shadow-sm space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-gold-100 text-gold-800 flex items-center justify-center">
            <Sparkles className="w-6 h-6" />
          </div>
          <h3 className="font-serif text-2xl font-bold text-slate-900">
            Transparent Celebrations
          </h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            No surprise surcharges or hidden venue fees. Transparent milestone installments, downloadable invoices, and direct artisan collaboration.
          </p>
        </div>
      </div>

      {/* Founding Team Members */}
      <div className="space-y-8">
        <div className="text-center space-y-2">
          <span className="text-xs font-bold uppercase tracking-widest text-gold-700">
            Leadership & Engineering
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-slate-900">
            Meet the Founding Team
          </h2>
          <p className="text-xs text-slate-500 max-w-xl mx-auto">
            The visionary minds behind the architecture, design, and execution of Wedding Bliss.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {teamMembers.map((member, idx) => (
            <div
              key={idx}
              className="bg-white rounded-3xl p-6 border border-champagne-300/80 shadow-sm hover:shadow-gold-soft hover:border-gold-400 transition-all duration-300 flex flex-col justify-between space-y-4 text-center group card-hover-luxury"
            >
              <div>
                <div className="w-24 h-24 rounded-full overflow-hidden mx-auto mb-4 border-2 border-gold-400 p-1 group-hover:scale-105 transition-transform duration-300 shadow-md">
                  <img
                    src={member.image}
                    alt={member.name}
                    className="w-full h-full object-cover rounded-full"
                  />
                </div>

                <span className="inline-block px-3 py-0.5 rounded-full text-[10px] font-bold bg-gold-100 text-gold-900 uppercase tracking-wider mb-2">
                  {member.badge}
                </span>

                <h3 className="font-serif text-xl font-bold text-slate-900">
                  {member.name}
                </h3>
                <span className="text-xs font-semibold text-gold-700 block mb-1">
                  {member.role}
                </span>
                <span className="text-[10px] text-slate-400 block mb-3 font-medium">
                  {member.specialty}
                </span>

                <p className="text-xs text-slate-600 leading-relaxed">
                  {member.bio}
                </p>
              </div>

              <div className="pt-3 border-t border-champagne-100 text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
                Wedding Bliss Executive Team
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
