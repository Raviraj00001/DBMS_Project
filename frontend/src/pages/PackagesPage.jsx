// frontend/src/pages/PackagesPage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import PackageCard from '../components/PackageCard';
import { Sparkles, Check, Users, ShieldCheck, HelpCircle } from 'lucide-react';

export default function PackagesPage() {
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    async function loadPackages() {
      try {
        const res = await api.getPackages();
        if (res.packages) setPackages(res.packages);
      } catch (err) {
        console.error('Failed to load packages:', err);
      } finally {
        setLoading(false);
      }
    }
    loadPackages();
  }, []);

  const handleSelectPackage = (pkg) => {
    navigate(`/venues?package_id=${pkg.id}`);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-16">
      
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <span className="text-xs font-bold uppercase tracking-widest text-gold-700">
          All-Inclusive Luxury Packages
        </span>
        <h1 className="font-serif text-3xl sm:text-5xl font-bold text-slate-900">
          Wedding Celebration Packages
        </h1>
        <p className="text-sm text-slate-600 leading-relaxed">
          From intimate gatherings to lavish palace celebrations, each tier combines vetted catering, candid photography, royal mandap decor, and audio-visual stage setups.
        </p>
      </div>

      {/* Package Cards Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-pulse">
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className="h-96 rounded-3xl bg-champagne-200/50"></div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch">
          {packages.map((pkg) => (
            <PackageCard
              key={pkg.id}
              pkg={pkg}
              onSelect={handleSelectPackage}
            />
          ))}
        </div>
      )}

      {/* Package Comparison Table */}
      <div className="bg-white rounded-3xl p-8 border border-champagne-300 shadow-md space-y-6">
        <div className="text-center max-w-xl mx-auto space-y-2">
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-slate-900">
            Package Inclusions Comparison
          </h2>
          <p className="text-xs text-slate-500">
            Detailed breakdown of services bundled in each package tier.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="border-b border-champagne-200 bg-ivory-100/50">
                <th className="py-3 px-4 font-bold text-slate-800">Wedding Feature</th>
                <th className="py-3 px-4 font-bold text-slate-800">Silver Elegance</th>
                <th className="py-3 px-4 font-bold text-slate-800">Gold Grandeur</th>
                <th className="py-3 px-4 font-bold text-gold-800">Platinum Heirloom</th>
                <th className="py-3 px-4 font-bold text-slate-800">Bespoke Coastal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-champagne-100 text-slate-600">
              <tr>
                <td className="py-3 px-4 font-semibold text-slate-800">Guest Count</td>
                <td className="py-3 px-4">Up to 250 Pax</td>
                <td className="py-3 px-4">Up to 500 Pax</td>
                <td className="py-3 px-4 font-bold text-gold-800">Up to 800 Pax</td>
                <td className="py-3 px-4">Up to 350 Pax</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-semibold text-slate-800">Gourmet Catering</td>
                <td className="py-3 px-4">Buffet Dinner</td>
                <td className="py-3 px-4">Buffet + 3 Live Chaat Stations</td>
                <td className="py-3 px-4 font-bold text-gold-800">Full Royal Maharaja 7-Course</td>
                <td className="py-3 px-4">Coastal Grills + Seafood</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-semibold text-slate-800">Photography & Film</td>
                <td className="py-3 px-4">1 Senior Photographer</td>
                <td className="py-3 px-4">2 Photographers + 4K Teaser</td>
                <td className="py-3 px-4 font-bold text-gold-800">4-Crew Team + Dual 4K Drones</td>
                <td className="py-3 px-4">Golden-Hour Sunset Shoot</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-semibold text-slate-800">Mandap & Floral Decor</td>
                <td className="py-3 px-4">Standard Floral Arch</td>
                <td className="py-3 px-4">Fresh Orchid Mandap + Tunnel</td>
                <td className="py-3 px-4 font-bold text-gold-800">Grand Palace Architectural Canopy</td>
                <td className="py-3 px-4">Driftwood & Beachside Mandap</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-semibold text-slate-800">Entertainment & DJ</td>
                <td className="py-3 px-4">Standard Sound Rig</td>
                <td className="py-3 px-4">Concert Line Array & DJ</td>
                <td className="py-3 px-4 font-bold text-gold-800">Live Sufi Band + Concert Rig</td>
                <td className="py-3 px-4">Acoustic Coastal Ensemble</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-semibold text-slate-800">Bridal Makeover</td>
                <td className="py-3 px-4">—</td>
                <td className="py-3 px-4">HD Airbrush Makeup</td>
                <td className="py-3 px-4 font-bold text-gold-800">Bride + 4 Family Members</td>
                <td className="py-3 px-4">Water-Resistant Coastal Glam</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}

