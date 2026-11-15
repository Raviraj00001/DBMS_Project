// frontend/src/pages/DbmsShowcasePage.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import { 
  Database, 
  Play, 
  Clock, 
  Layers, 
  ShieldCheck, 
  FileCode, 
  Table, 
  Sparkles, 
  CheckCircle2, 
  GitBranch,
  BarChart3,
  Award,
  ArrowLeft,
  RefreshCw,
  Cpu,
  Lock,
  Code,
  Search,
  ChevronDown,
  ChevronUp,
  FileText,
  DollarSign,
  TrendingUp,
  Calendar,
  Users,
  Compass,
  Check,
  Zap,
  Terminal
} from 'lucide-react';
import StatusBadge from '../components/StatusBadge';

export default function DbmsShowcasePage() {
  const [queries, setQueries] = useState([]);
  const [selectedReportId, setSelectedReportId] = useState(14); // Default to Financial Health & Balances (Q14)
  const [activeTab, setActiveTab] = useState('analytics'); // 'analytics', 'schema', 'relationships', 'routines', 'stats'
  
  // Execution & results state
  const [queryResult, setQueryResult] = useState(null);
  const [executing, setExecuting] = useState(false);
  const [error, setError] = useState('');
  const [showSqlCode, setShowSqlCode] = useState(false); // Hidden by default!
  const [tableSearch, setTableSearch] = useState('');

  // Custom SQL Console Modal / Drawer
  const [customConsoleOpen, setCustomConsoleOpen] = useState(false);
  const [customSql, setCustomSql] = useState('');

  // Schema record counts & health
  const [schemaStats, setSchemaStats] = useState([]);
  const [loadingStats, setLoadingStats] = useState(false);
  const [healthInfo, setHealthInfo] = useState(null);

  // Friendly Business Report Definitions mapped to underlying PostgreSQL Queries
  const BUSINESS_REPORTS = [
    {
      id: 14,
      title: 'Customer Financial Health & Outstanding Balances',
      shortTitle: 'Client Financial Balances',
      category: 'Financial Intelligence',
      badge: 'Common Table Expressions',
      icon: DollarSign,
      description: 'Audits total contracted wedding values against settled installment payments to highlight pending dues and collection health.',
    },
    {
      id: 6,
      title: 'Venue Gross Revenue & Utilization Matrix',
      shortTitle: 'Venue Revenue & Occupancy',
      category: 'Property Analytics',
      badge: 'Aggregations & HAVING',
      icon: BarChart3,
      description: 'Computes event frequencies, cumulative rental revenue, and average guest sizes for properties with at least one confirmed booking.',
    },
    {
      id: 4,
      title: 'Vendor Line-Item Work Orders & Earnings Ledger',
      shortTitle: 'Vendor Work Orders & Payouts',
      category: 'Artisan Operations',
      badge: '4-Table Relational Join',
      icon: Users,
      description: 'Breaks down booked services line-by-line across catering, photography, and decor with exact quantities and subtotals.',
    },
    {
      id: 8,
      title: 'Payment Channel Performance & Success Ratios',
      shortTitle: 'Payment Gateway Analysis',
      category: 'Financial Intelligence',
      badge: 'Conditional Aggregations',
      icon: TrendingUp,
      description: 'Evaluates transaction volume, total successful settlements, and percentage success ratios across UPI, Cards, and Net Banking.',
    },
    {
      id: 19,
      title: 'Upcoming Wedding Logistics & Event Manifest',
      shortTitle: 'Upcoming Weddings Schedule',
      category: 'Event Operations',
      badge: 'Database View',
      icon: Calendar,
      description: 'Chronological timeline of active upcoming celebrations showing customer contacts, venues, and remaining preparation days.',
    },
    {
      id: 12,
      title: 'Property Rental Benchmark Ranking by Venue Style',
      shortTitle: 'Venue Pricing Ranks',
      category: 'Marketplace Intelligence',
      badge: 'Window Function DENSE_RANK',
      icon: Award,
      description: 'Ranks luxury venues by daily rental rates partitioned across Palace, Lawn, Beachside, and Ballroom categories.',
    },
    {
      id: 13,
      title: 'Cumulative Platform Cash Inflow Timeline',
      shortTitle: 'Cumulative Cash Timeline',
      category: 'Financial Intelligence',
      badge: 'Window Running Total',
      icon: Clock,
      description: 'Traces running cumulative cash inflow across all verified payment transactions in chronological progression.',
    },
    {
      id: 1,
      title: 'High-Capacity Royal Destinations (400+ Guests)',
      shortTitle: 'Grand Capacity Inventory',
      category: 'Property Analytics',
      badge: 'Multi-Condition Filter',
      icon: Users,
      description: 'Filters luxury estates and heritage palaces capable of hosting large destination gatherings of 400 to 1,500 guests.',
    },
    {
      id: 5,
      title: 'Unutilized Venue Inventory (Zero Bookings)',
      shortTitle: 'Unutilized Inventory',
      category: 'Audit & Optimization',
      badge: 'Outer Join NULL Check',
      icon: Compass,
      description: 'Identifies listed properties that have not yet received any wedding bookings to pinpoint inventory promotion opportunities.',
    },
    {
      id: 17,
      title: 'Dual-Presence Cities (Venues & Verified Vendors)',
      shortTitle: 'Ecosystem City Coverage',
      category: 'Geographical Analytics',
      badge: 'Set Operation INTERSECT',
      icon: MapPin,
      description: 'Determines cities where both verified wedding vendors and operational venue properties coexist.',
    },
    {
      id: 21,
      title: 'Dynamic Booking Total Cost Verification',
      shortTitle: 'Stored Procedure Audit',
      category: 'Database Procedures',
      badge: 'PL/pgSQL Function',
      icon: Zap,
      description: 'Executes stored function fn_calculate_booking_total() to dynamically verify contract totals against recorded amounts.',
    },
  ];

  useEffect(() => {
    async function loadCatalog() {
      try {
        const [qRes, hRes] = await Promise.all([
          api.getDbmsQueries(),
          api.getHealth(),
        ]);
        if (qRes.queries) setQueries(qRes.queries);
        if (hRes) setHealthInfo(hRes);
      } catch (err) {
        console.error('Failed to load queries catalog:', err);
      }
    }
    loadCatalog();
  }, []);

  // Run the default or selected report whenever selectedReportId changes
  useEffect(() => {
    executeReport(selectedReportId);
  }, [selectedReportId]);

  const executeReport = async (reportId) => {
    setExecuting(true);
    setError('');
    setTableSearch('');

    try {
      const res = await api.runDbmsQuery({ query_id: reportId });
      if (res.success) {
        setQueryResult(res);
      }
    } catch (err) {
      setError(err.message || 'Report execution failed.');
    } finally {
      setExecuting(false);
    }
  };

  const handleCustomSqlRun = async () => {
    if (!customSql.trim()) return;
    setExecuting(true);
    setError('');

    try {
      const res = await api.runDbmsQuery({ custom_sql: customSql });
      if (res.success) {
        setQueryResult(res);
        setCustomConsoleOpen(false);
      }
    } catch (err) {
      setError(err.message || 'Custom SQL query failed to execute.');
    } finally {
      setExecuting(false);
    }
  };

  const loadSchemaStats = async () => {
    setLoadingStats(true);
    try {
      const res = await api.getSchemaStats();
      if (res.tables) setSchemaStats(res.tables);
    } catch (err) {
      console.error('Failed to load schema stats:', err);
    } finally {
      setLoadingStats(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'stats' || activeTab === 'schema') {
      loadSchemaStats();
    }
  }, [activeTab]);

  const currentReportMeta = BUSINESS_REPORTS.find((r) => r.id === selectedReportId) || BUSINESS_REPORTS[0];

  // Filter query rows by search input
  const filteredRows = queryResult?.rows?.filter((row) => {
    if (!tableSearch.trim()) return true;
    const term = tableSearch.toLowerCase();
    return Object.values(row).some((val) => 
      val !== null && val !== undefined && String(val).toLowerCase().includes(term)
    );
  }) || [];

  const formatPrice = (val) => {
    const num = parseFloat(val);
    if (isNaN(num)) return val;
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(num);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-champagne-200">
        <Link
          to="/admin"
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-gold-700 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Master Admin Operations</span>
        </Link>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setCustomConsoleOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-white border border-champagne-300 hover:border-gold-400 text-slate-700 hover:text-gold-800 shadow-sm transition-all"
          >
            <Terminal className="w-3.5 h-3.5 text-gold-600" />
            <span>Ad-Hoc SQL Console</span>
          </button>

          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-gold-100 text-gold-900 border border-gold-300">
            <Lock className="w-3.5 h-3.5 text-gold-700" />
            <span>Admin Data Hub</span>
          </span>
        </div>
      </div>

      {/* Main Console Header Banner */}
      <div className="bg-gradient-to-r from-charcoal-950 via-charcoal-900 to-slate-900 rounded-3xl p-8 text-white relative overflow-hidden border border-gold-500/30 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gold-500/20 text-gold-300 border border-gold-500/30 text-xs font-semibold">
            <BarChart3 className="w-3.5 h-3.5" />
            <span>PostgreSQL Relational Analytics & Intelligence Console</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold">
            Executive Analytics & Operations
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Generate live financial balance sheets, occupancy audits, vendor work orders, and transactional analytics powered directly by PostgreSQL 3NF normalized tables.
          </p>
        </div>

        <div className="flex flex-col gap-2 shrink-0">
          <button
            onClick={() => executeReport(selectedReportId)}
            disabled={executing}
            className="px-5 py-3 rounded-2xl bg-gradient-to-r from-gold-500 to-gold-400 hover:from-gold-400 hover:to-gold-300 text-slate-950 font-bold text-xs shadow-gold-glow flex items-center justify-center gap-2 transition-all"
          >
            <RefreshCw className={`w-4 h-4 ${executing ? 'animate-spin' : ''}`} />
            <span>{executing ? 'Refreshing Data...' : 'Run Live Refresh'}</span>
          </button>
        </div>
      </div>

      {/* Modern Segmented Navigation Pills */}
      <div className="flex items-center gap-2 border-b border-champagne-300 overflow-x-auto pb-1 text-xs font-semibold">
        <button
          onClick={() => setActiveTab('analytics')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-t-xl transition-all border-b-2 whitespace-nowrap ${
            activeTab === 'analytics'
              ? 'border-gold-600 text-gold-900 bg-white shadow-sm'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <BarChart3 className="w-4 h-4 text-gold-600" />
          <span>Interactive Reports Center</span>
        </button>

        <button
          onClick={() => setActiveTab('schema')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-t-xl transition-all border-b-2 whitespace-nowrap ${
            activeTab === 'schema'
              ? 'border-gold-600 text-gold-900 bg-white shadow-sm'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <Layers className="w-4 h-4 text-gold-600" />
          <span>3NF Schema & Constraints</span>
        </button>

        <button
          onClick={() => setActiveTab('relationships')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-t-xl transition-all border-b-2 whitespace-nowrap ${
            activeTab === 'relationships'
              ? 'border-gold-600 text-gold-900 bg-white shadow-sm'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <GitBranch className="w-4 h-4 text-gold-600" />
          <span>Entity Relationships (ERD)</span>
        </button>

        <button
          onClick={() => setActiveTab('routines')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-t-xl transition-all border-b-2 whitespace-nowrap ${
            activeTab === 'routines'
              ? 'border-gold-600 text-gold-900 bg-white shadow-sm'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <FileCode className="w-4 h-4 text-gold-600" />
          <span>Views, Triggers & PL/pgSQL</span>
        </button>

        <button
          onClick={() => setActiveTab('stats')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-t-xl transition-all border-b-2 whitespace-nowrap ${
            activeTab === 'stats'
              ? 'border-gold-600 text-gold-900 bg-white shadow-sm'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <Table className="w-4 h-4 text-gold-600" />
          <span>Live Table Tuples Audit</span>
        </button>
      </div>

      {/* TAB 1: INTERACTIVE REPORTS CENTER (REPLACING RAW QUERY STRINGS!) */}
      {activeTab === 'analytics' && (
        <div className="space-y-6">
          
          {/* Quick-Run Report Selector Strip */}
          <div className="bg-white rounded-3xl p-6 border border-champagne-200 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="font-serif text-xl font-bold text-slate-900">
                  Select Analytical Operation
                </h3>
                <p className="text-xs text-slate-500">
                  Click any module below to execute the corresponding transactional query against PostgreSQL.
                </p>
              </div>

              {/* Underlying SQL Code Toggle (Hidden by default!) */}
              <button
                onClick={() => setShowSqlCode(!showSqlCode)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  showSqlCode 
                    ? 'bg-charcoal-900 text-gold-300' 
                    : 'bg-ivory-100 text-slate-700 hover:bg-champagne-200 border border-champagne-300'
                }`}
                title="Toggle Underlying SQL Syntax View"
              >
                <Code className="w-3.5 h-3.5 text-gold-600" />
                <span>{showSqlCode ? 'Hide Technical SQL' : 'Inspect Technical SQL'}</span>
                {showSqlCode ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>
            </div>

            {/* Interactive Report Selection Pills */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5">
              {BUSINESS_REPORTS.map((r) => {
                const isSelected = selectedReportId === r.id;
                const Icon = r.icon;
                return (
                  <button
                    key={r.id}
                    onClick={() => setSelectedReportId(r.id)}
                    className={`p-3 rounded-2xl text-left border transition-all flex flex-col justify-between gap-2 ${
                      isSelected
                        ? 'bg-gradient-to-tr from-gold-50 to-white border-gold-500 shadow-gold-soft ring-1 ring-gold-400'
                        : 'bg-ivory-50/70 border-champagne-200 hover:border-gold-300 hover:bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className={`p-1.5 rounded-xl ${isSelected ? 'bg-gold-500 text-white' : 'bg-champagne-200 text-slate-700'}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                        isSelected ? 'bg-gold-200 text-gold-950 font-bold' : 'bg-champagne-100 text-slate-500'
                      }`}>
                        Q{r.id}
                      </span>
                    </div>

                    <div>
                      <span className={`text-xs font-bold block line-clamp-1 ${isSelected ? 'text-slate-900' : 'text-slate-700'}`}>
                        {r.shortTitle}
                      </span>
                      <span className="text-[10px] text-slate-400 block line-clamp-1">
                        {r.badge}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Collapsible Technical SQL Viewer (For Academic Viva Evaluation) */}
          {showSqlCode && queryResult && (
            <div className="bg-charcoal-950 text-gold-300 rounded-3xl p-6 border border-charcoal-800 shadow-2xl space-y-3 animate-in fade-in duration-200">
              <div className="flex items-center justify-between pb-2 border-b border-charcoal-800 text-xs">
                <div className="flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-gold-400" />
                  <span className="font-bold text-white uppercase tracking-wider">
                    PostgreSQL Executed Query Syntax
                  </span>
                  <span className="text-slate-400">({currentReportMeta.badge})</span>
                </div>
                <span className="text-emerald-400 font-mono text-[11px]">
                  Execution Time: {queryResult.execution_time_ms} ms
                </span>
              </div>
              <pre className="font-mono text-xs overflow-x-auto whitespace-pre-wrap leading-relaxed text-gold-200">
                {queryResult.sql}
              </pre>
            </div>
          )}

          {/* Active Report Header & Search Filter */}
          <div className="bg-white rounded-3xl p-6 border border-champagne-200 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-champagne-100">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-gold-100 text-gold-900 border border-gold-300">
                    {currentReportMeta.category}
                  </span>
                  <span className="text-xs text-slate-400 font-medium">
                    {currentReportMeta.badge}
                  </span>
                </div>
                <h3 className="font-serif text-2xl font-bold text-slate-900">
                  {currentReportMeta.title}
                </h3>
                <p className="text-xs text-slate-500 mt-1 max-w-2xl">
                  {currentReportMeta.description}
                </p>
              </div>

              {/* Runtime & Row Count Metric Chips */}
              <div className="flex items-center gap-3 shrink-0">
                <div className="bg-ivory-50 px-3.5 py-1.5 rounded-2xl border border-champagne-200 text-xs">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Query Runtime</span>
                  <span className="font-bold text-emerald-700 font-mono flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    {queryResult?.execution_time_ms !== undefined ? `${queryResult.execution_time_ms} ms` : '—'}
                  </span>
                </div>

                <div className="bg-ivory-50 px-3.5 py-1.5 rounded-2xl border border-champagne-200 text-xs">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Tuples</span>
                  <span className="font-bold text-slate-900 font-mono flex items-center gap-1">
                    <Table className="w-3.5 h-3.5 text-gold-600" />
                    {queryResult?.row_count !== undefined ? `${queryResult.row_count} rows` : '—'}
                  </span>
                </div>
              </div>
            </div>

            {/* In-Table Real-Time Search */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                placeholder="Search returned data by keyword, name, reference, or amount..."
                value={tableSearch}
                onChange={(e) => setTableSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-champagne-300 focus:outline-none focus:border-gold-500 bg-ivory-50/50"
              />
            </div>

            {/* Error Banner */}
            {error && (
              <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-300 text-rose-800 text-xs">
                {error}
              </div>
            )}

            {/* Live Formatted Results Table */}
            {executing ? (
              <div className="py-16 text-center space-y-3 animate-pulse">
                <div className="w-10 h-10 border-2 border-gold-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                <p className="text-xs text-slate-500">Executing relational query on PostgreSQL...</p>
              </div>
            ) : filteredRows.length === 0 ? (
              <div className="py-12 text-center text-xs text-slate-400 italic">
                {queryResult ? 'No records matching search filter.' : 'Click any report module above to execute.'}
              </div>
            ) : (
              <div className="overflow-x-auto max-h-[480px]">
                <table className="w-full text-xs text-left border-collapse">
                  <thead className="sticky top-0 bg-ivory-100/90 backdrop-blur-sm z-10">
                    <tr className="border-b border-champagne-300 text-slate-700 font-bold uppercase text-[10px] tracking-wider">
                      {queryResult.fields?.map((f) => (
                        <th key={f} className="py-2.5 px-3 whitespace-nowrap">
                          {f.replace(/_/g, ' ')}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-champagne-100 text-slate-700 font-medium">
                    {filteredRows.map((row, idx) => (
                      <tr key={idx} className="hover:bg-champagne-50/70 transition-colors">
                        {queryResult.fields?.map((field) => {
                          const val = row[field];
                          const isNumericAmount = field.includes('amount') || field.includes('revenue') || field.includes('price') || field.includes('due') || field.includes('value');
                          const isStatus = field.includes('status');

                          return (
                            <td key={field} className="py-2.5 px-3 whitespace-nowrap">
                              {isStatus ? (
                                <StatusBadge status={val} />
                              ) : isNumericAmount && !isNaN(parseFloat(val)) ? (
                                <span className={`font-semibold ${field.includes('due') ? 'text-rose-600' : 'text-slate-900'}`}>
                                  {formatPrice(val)}
                                </span>
                              ) : val !== null && val !== undefined ? (
                                String(val)
                              ) : (
                                <span className="text-slate-400 italic">—</span>
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <div className="flex items-center justify-between pt-2 text-[11px] text-slate-400">
              <span>Showing {filteredRows.length} of {queryResult?.row_count || 0} records</span>
              <span>PostgreSQL 3NF Normalized Engine</span>
            </div>
          </div>

        </div>
      )}

      {/* TAB 2: 3NF RELATIONAL SCHEMA BREAKDOWN */}
      {activeTab === 'schema' && (
        <div className="bg-white rounded-3xl p-8 border border-champagne-300 shadow-md space-y-8">
          <div className="space-y-2">
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-slate-900">
              Third Normal Form (3NF) Relational Architecture
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-3xl">
              Every table satisfies 1NF (atomic attributes, no repeating groups), 2NF (no partial functional dependencies on composite candidate keys), and 3NF (no transitive dependencies where non-prime attributes determine non-prime attributes).
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
            <div className="p-5 rounded-2xl bg-ivory-50 border border-champagne-200 space-y-2">
              <span className="font-bold text-slate-900 text-sm block">1. users</span>
              <p className="text-slate-600">PK: id. Holds user authentication credentials, role enum ('customer', 'vendor', 'admin'), phone, and contact details. Email is UNIQUE.</p>
              <span className="text-[10px] text-gold-700 font-mono font-semibold block">Dependency: id -&gt; full_name, email, role, phone</span>
            </div>

            <div className="p-5 rounded-2xl bg-ivory-50 border border-champagne-200 space-y-2">
              <span className="font-bold text-slate-900 text-sm block">2. venues</span>
              <p className="text-slate-600">PK: id. Stores palaces and banquet halls. CHECK constraints enforce capacity_max &gt;= capacity_min and price_per_day &gt;= 0.</p>
              <span className="text-[10px] text-gold-700 font-mono font-semibold block">Dependency: id -&gt; name, city, capacity, price_per_day</span>
            </div>

            <div className="p-5 rounded-2xl bg-ivory-50 border border-champagne-200 space-y-2">
              <span className="font-bold text-slate-900 text-sm block">3. venue_availability</span>
              <p className="text-slate-600">PK: id. FK: venue_id, booking_id. UNIQUE constraint on (venue_id, available_date) guarantees calendar reservation consistency.</p>
              <span className="text-[10px] text-gold-700 font-mono font-semibold block">Constraint: UNIQUE(venue_id, available_date)</span>
            </div>

            <div className="p-5 rounded-2xl bg-ivory-50 border border-champagne-200 space-y-2">
              <span className="font-bold text-slate-900 text-sm block">4. vendors</span>
              <p className="text-slate-600">PK: id. FK: user_id (1:1 relationship with users table). Captures business name, category, rating, starting price, verification flag.</p>
              <span className="text-[10px] text-gold-700 font-mono font-semibold block">FK: user_id REFERENCES users(id) ON DELETE CASCADE</span>
            </div>

            <div className="p-5 rounded-2xl bg-ivory-50 border border-champagne-200 space-y-2">
              <span className="font-bold text-slate-900 text-sm block">5. services & vendor_services</span>
              <p className="text-slate-600">Decoupled M:N bridge with custom pricing. Enables vendors to price standardized services (e.g. Catering, Photography) independently.</p>
              <span className="text-[10px] text-gold-700 font-mono font-semibold block">Bridge: UNIQUE(vendor_id, service_id)</span>
            </div>

            <div className="p-5 rounded-2xl bg-ivory-50 border border-champagne-200 space-y-2">
              <span className="font-bold text-slate-900 text-sm block">6. packages & package_services</span>
              <p className="text-slate-600">Pre-bundled wedding tiers (Silver, Gold, Platinum). Bridge table package_services connects packages to master services.</p>
              <span className="text-[10px] text-gold-700 font-mono font-semibold block">Bridge: UNIQUE(package_id, service_id)</span>
            </div>

            <div className="p-5 rounded-2xl bg-ivory-50 border border-champagne-200 space-y-2">
              <span className="font-bold text-slate-900 text-sm block">7. bookings & booking_services</span>
              <p className="text-slate-600">Core transactional relationship. Stores booking reference, customer_id, venue_id, package_id, total amount, paid amount, and service line items.</p>
              <span className="text-[10px] text-gold-700 font-mono font-semibold block">Constraint: CHECK(paid_amount &lt;= total_amount)</span>
            </div>

            <div className="p-5 rounded-2xl bg-ivory-50 border border-champagne-200 space-y-2">
              <span className="font-bold text-slate-900 text-sm block">8. payments & reviews</span>
              <p className="text-slate-600">Financial ledgers and feedback loop. Payments enforce UNIQUE transaction_reference; reviews enforce CHECK constraint on rating (1-5).</p>
              <span className="text-[10px] text-gold-700 font-mono font-semibold block">Check: rating BETWEEN 1 AND 5</span>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: DATABASE RELATIONSHIPS & ERD */}
      {activeTab === 'relationships' && (
        <div className="bg-white rounded-3xl p-8 border border-champagne-300 shadow-md space-y-8">
          <div className="space-y-2">
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-slate-900">
              Entity-Relationship Mappings & Cardinalities
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 max-w-3xl">
              Visual overview of relational cardinality, primary/foreign key pairs, and deletion cascade rules across all 12 tables.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="border-b border-champagne-200 bg-ivory-100/70 text-slate-800 font-bold">
                  <th className="py-3 px-3">Parent Entity</th>
                  <th className="py-3 px-3">Child Entity</th>
                  <th className="py-3 px-3">Cardinality</th>
                  <th className="py-3 px-3">Foreign Key Column</th>
                  <th className="py-3 px-3">Delete Rule</th>
                  <th className="py-3 px-3">Business Relationship</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-champagne-100 text-slate-700">
                <tr>
                  <td className="py-2.5 px-3 font-mono font-semibold text-gold-900">users</td>
                  <td className="py-2.5 px-3 font-mono font-semibold text-gold-900">vendors</td>
                  <td className="py-2.5 px-3 font-semibold text-indigo-700">1 : 1</td>
                  <td className="py-2.5 px-3 font-mono">vendors.user_id</td>
                  <td className="py-2.5 px-3 text-rose-600 font-semibold">CASCADE</td>
                  <td className="py-2.5 px-3">Vendor business profile extends user identity</td>
                </tr>
                <tr>
                  <td className="py-2.5 px-3 font-mono font-semibold text-gold-900">users</td>
                  <td className="py-2.5 px-3 font-mono font-semibold text-gold-900">bookings</td>
                  <td className="py-2.5 px-3 font-semibold text-emerald-700">1 : N</td>
                  <td className="py-2.5 px-3 font-mono">bookings.customer_id</td>
                  <td className="py-2.5 px-3 text-amber-600 font-semibold">RESTRICT</td>
                  <td className="py-2.5 px-3">Customer places wedding reservations</td>
                </tr>
                <tr>
                  <td className="py-2.5 px-3 font-mono font-semibold text-gold-900">venues</td>
                  <td className="py-2.5 px-3 font-mono font-semibold text-gold-900">venue_availability</td>
                  <td className="py-2.5 px-3 font-semibold text-emerald-700">1 : N</td>
                  <td className="py-2.5 px-3 font-mono">venue_availability.venue_id</td>
                  <td className="py-2.5 px-3 text-rose-600 font-semibold">CASCADE</td>
                  <td className="py-2.5 px-3">Calendar date reservations for property</td>
                </tr>
                <tr>
                  <td className="py-2.5 px-3 font-mono font-semibold text-gold-900">venues</td>
                  <td className="py-2.5 px-3 font-mono font-semibold text-gold-900">bookings</td>
                  <td className="py-2.5 px-3 font-semibold text-emerald-700">1 : N</td>
                  <td className="py-2.5 px-3 font-mono">bookings.venue_id</td>
                  <td className="py-2.5 px-3 text-slate-500 font-semibold">SET NULL</td>
                  <td className="py-2.5 px-3">Venue reserved for wedding event</td>
                </tr>
                <tr>
                  <td className="py-2.5 px-3 font-mono font-semibold text-gold-900">vendors</td>
                  <td className="py-2.5 px-3 font-mono font-semibold text-gold-900">vendor_services</td>
                  <td className="py-2.5 px-3 font-semibold text-emerald-700">1 : N</td>
                  <td className="py-2.5 px-3 font-mono">vendor_services.vendor_id</td>
                  <td className="py-2.5 px-3 text-rose-600 font-semibold">CASCADE</td>
                  <td className="py-2.5 px-3">Custom offerings and prices listed by vendor</td>
                </tr>
                <tr>
                  <td className="py-2.5 px-3 font-mono font-semibold text-gold-900">packages</td>
                  <td className="py-2.5 px-3 font-mono font-semibold text-gold-900">package_services</td>
                  <td className="py-2.5 px-3 font-semibold text-purple-700">M : N</td>
                  <td className="py-2.5 px-3 font-mono">package_services.package_id</td>
                  <td className="py-2.5 px-3 text-rose-600 font-semibold">CASCADE</td>
                  <td className="py-2.5 px-3">Associative bridge bundling catalog services</td>
                </tr>
                <tr>
                  <td className="py-2.5 px-3 font-mono font-semibold text-gold-900">bookings</td>
                  <td className="py-2.5 px-3 font-mono font-semibold text-gold-900">booking_services</td>
                  <td className="py-2.5 px-3 font-semibold text-emerald-700">1 : N</td>
                  <td className="py-2.5 px-3 font-mono">booking_services.booking_id</td>
                  <td className="py-2.5 px-3 text-rose-600 font-semibold">CASCADE</td>
                  <td className="py-2.5 px-3">Specific custom vendor service line-items</td>
                </tr>
                <tr>
                  <td className="py-2.5 px-3 font-mono font-semibold text-gold-900">bookings</td>
                  <td className="py-2.5 px-3 font-mono font-semibold text-gold-900">payments</td>
                  <td className="py-2.5 px-3 font-semibold text-emerald-700">1 : N</td>
                  <td className="py-2.5 px-3 font-mono">payments.booking_id</td>
                  <td className="py-2.5 px-3 text-rose-600 font-semibold">CASCADE</td>
                  <td className="py-2.5 px-3">Installment ledger tracking payment history</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: VIEWS, TRIGGERS & PROCEDURES */}
      {activeTab === 'routines' && (
        <div className="bg-white rounded-3xl p-8 border border-champagne-300 shadow-md space-y-8">
          <div>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-slate-900">
              Database Views, Triggers & Stored Functions
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-1">
              Industrial PL/pgSQL logic implemented inside PostgreSQL to enforce business constraints and high-speed analytical queries.
            </p>
          </div>

          <div className="space-y-6 text-xs">
            <div className="p-5 rounded-2xl bg-ivory-100/70 border border-champagne-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900 text-sm">VIEW: view_booking_details</span>
                <span className="px-2 py-0.5 rounded bg-gold-200 text-gold-900 font-mono text-[10px]">CREATE VIEW</span>
              </div>
              <p className="text-slate-600 leading-relaxed">
                Aggregates 5 tables (bookings, users, venues, packages, booking_services) to present a consolidated event manifest with customer details, venue costs, service counts, and balance dues.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-ivory-100/70 border border-champagne-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900 text-sm">TRIGGER: trg_booking_prevent_double_booking</span>
                <span className="px-2 py-0.5 rounded bg-rose-100 text-rose-800 font-mono text-[10px]">BEFORE INSERT/UPDATE</span>
              </div>
              <p className="text-slate-600 leading-relaxed">
                Fires on <code className="text-gold-800">bookings</code> before row insertion. Checks if the requested venue is already reserved on that wedding date by an existing active booking. If conflicting, raises <code className="text-rose-700 font-mono">RAISE EXCEPTION</code> to abort the transaction.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-ivory-100/70 border border-champagne-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900 text-sm">TRIGGER: trg_payment_after_insert_update</span>
                <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-mono text-[10px]">AFTER INSERT/UPDATE</span>
              </div>
              <p className="text-slate-600 leading-relaxed">
                Fires on <code className="text-gold-800">payments</code> whenever a transaction is completed. Automatically recalculates the booking's <code className="text-gold-800">paid_amount</code>, promotes booking status to 'confirmed', and inserts/updates the date in <code className="text-gold-800">venue_availability</code>.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-ivory-100/70 border border-champagne-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900 text-sm">FUNCTION: fn_check_venue_availability(venue_id, date)</span>
                <span className="px-2 py-0.5 rounded bg-gold-200 text-gold-900 font-mono text-[10px]">RETURNS BOOLEAN</span>
              </div>
              <p className="text-slate-600 leading-relaxed">
                Evaluates date conflicts across both <code className="text-gold-800">venue_availability</code> and active pending/confirmed bookings. Used by both the API endpoint and the frontend calendar widget.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-ivory-100/70 border border-champagne-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900 text-sm">FUNCTION: fn_calculate_booking_total(booking_id)</span>
                <span className="px-2 py-0.5 rounded bg-gold-200 text-gold-900 font-mono text-[10px]">RETURNS NUMERIC</span>
              </div>
              <p className="text-slate-600 leading-relaxed">
                Dynamically computes venue daily fee + discounted package price + sum of all booked custom vendor services line items.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: LIVE SCHEMA TABLES RECORD AUDIT */}
      {activeTab === 'stats' && (
        <div className="bg-white rounded-3xl p-8 border border-champagne-300 shadow-md space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-slate-900">
                Live Database Table Tuples Audit
              </h2>
              <p className="text-xs text-slate-500">
                Live row counts queried across all 12 normalized tables.
              </p>
            </div>
            <button
              onClick={loadSchemaStats}
              disabled={loadingStats}
              className="px-4 py-2 rounded-xl bg-gold-100 hover:bg-gold-200 text-gold-900 font-semibold text-xs transition-colors flex items-center gap-1.5"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loadingStats ? 'animate-spin' : ''}`} />
              <span>{loadingStats ? 'Querying...' : 'Refresh Audit'}</span>
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {schemaStats.map((table) => (
              <div key={table.table_name} className="p-4 rounded-2xl bg-ivory-50 border border-champagne-200 text-center space-y-1 hover:border-gold-400 transition-colors">
                <span className="font-mono text-xs font-bold text-slate-700 block">
                  {table.table_name}
                </span>
                <span className="text-2xl font-extrabold text-gold-800 block">
                  {table.record_count}
                </span>
                <span className="text-[10px] text-slate-400 block">Tuples in Database</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Ad-Hoc SQL Console Drawer / Modal */}
      {customConsoleOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl border border-champagne-300 w-full max-w-2xl overflow-hidden p-6 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-champagne-200 pb-3">
              <div className="flex items-center gap-2">
                <Terminal className="w-5 h-5 text-gold-600" />
                <h3 className="font-serif text-xl font-bold text-slate-900">
                  Ad-Hoc Analytical SQL Console
                </h3>
              </div>
              <button
                onClick={() => setCustomConsoleOpen(false)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              <span className="text-[11px] font-bold uppercase text-slate-400 block">
                Quick Template Presets
              </span>
              <div className="flex flex-wrap gap-2 text-xs">
                <button
                  onClick={() => setCustomSql("SELECT name, city, venue_type, price_per_day, rating FROM venues WHERE is_available = TRUE ORDER BY rating DESC;")}
                  className="px-3 py-1.5 rounded-xl bg-ivory-100 hover:bg-gold-100 text-slate-800 text-[11px] border border-champagne-200 transition-colors"
                >
                  Top Rated Venues
                </button>
                <button
                  onClick={() => setCustomSql("SELECT booking_reference, wedding_date, guest_count, total_amount, paid_amount, status FROM bookings ORDER BY wedding_date ASC;")}
                  className="px-3 py-1.5 rounded-xl bg-ivory-100 hover:bg-gold-100 text-slate-800 text-[11px] border border-champagne-200 transition-colors"
                >
                  All Bookings Manifest
                </button>
                <button
                  onClick={() => setCustomSql("SELECT business_name, category, city, rating, starting_price FROM vendors WHERE is_verified = TRUE;")}
                  className="px-3 py-1.5 rounded-xl bg-ivory-100 hover:bg-gold-100 text-slate-800 text-[11px] border border-champagne-200 transition-colors"
                >
                  Verified Vendors
                </button>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Type SQL Query (SELECT statements only)
                </label>
                <textarea
                  rows={4}
                  value={customSql}
                  onChange={(e) => setCustomSql(e.target.value)}
                  placeholder="SELECT * FROM venues WHERE price_per_day <= 250000;"
                  className="w-full p-3 font-mono text-xs rounded-xl border border-champagne-300 focus:outline-none focus:border-gold-500 bg-ivory-50/50"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-champagne-200">
              <button
                type="button"
                onClick={() => setCustomConsoleOpen(false)}
                className="px-5 py-2 rounded-xl border border-champagne-300 text-xs text-slate-700 font-semibold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleCustomSqlRun}
                disabled={executing || !customSql.trim()}
                className="px-6 py-2 rounded-xl bg-gold-600 hover:bg-gold-700 text-white font-semibold text-xs shadow-md"
              >
                {executing ? 'Executing...' : 'Run Query'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
