import React, { useState, useEffect, useRef } from 'react';
import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, MessageSquare, Users, Calendar, Bot, Settings, Send, 
  Settings2, Activity, Zap, ShieldCheck, Target, Cpu, HardDrive, DollarSign, 
  Clock, CheckCircle, XCircle, Bell, Search, Download, Power, Phone, PhoneCall, 
  Volume2, Sparkles, Smile, Frown, AlertCircle, Trash2, UserPlus, Menu, X, Wifi
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area } from 'recharts';

const API_BASE = "http://localhost:8000/api";
const PIE_COLORS = ['#6366f1', '#a855f7', '#06b6d4', '#ec4899'];

// Animated Counter component using Framer Motion springs
function AnimatedCounter({ value, isCurrency = false, suffix = "" }) {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    let numeric = typeof value === 'string' ? parseFloat(value.replace(/,/g, '')) : value;
    if (isNaN(numeric)) numeric = 0;
    
    let start = 0;
    const duration = 1200; // ms
    const startTime = performance.now();

    function update(now) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out quartic
      const ease = 1 - Math.pow(1 - progress, 4);
      const current = Math.floor(start + (numeric - start) * ease);
      setDisplayValue(current);

      if (progress < 1) {
        requestAnimationFrame(update);
      }
    }

    requestAnimationFrame(update);
  }, [value]);

  const formatted = displayValue.toLocaleString();
  return (
    <span>
      {isCurrency ? `$${formatted}` : formatted}
      {suffix}
    </span>
  );
}

// Shimmer Loader Card Placeholder
function MetricSkeleton() {
  return (
    <div className="glass-panel metric-card skeleton-shimmer" style={{ height: '140px', opacity: 0.8 }} />
  );
}

// Shimmer Loader Chart Placeholder
function ChartSkeleton() {
  return (
    <div className="glass-panel skeleton-shimmer" style={{ height: '280px', opacity: 0.8 }} />
  );
}

// Reusable custom glassmorphic toasts provider
let globalAddToast = null;

function GlobalToaster({ toasts, removeToast }) {
  return (
    <div style={{ position: 'fixed', top: '24px', right: '24px', display: 'flex', flexDirection: 'column', gap: '12px', zIndex: 9999, pointerEvents: 'none' }}>
      <AnimatePresence>
        {toasts.map(toast => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: -20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.9 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            className="glass-panel"
            style={{
              pointerEvents: 'auto',
              width: '360px',
              padding: '16px 20px',
              background: 'rgba(18, 9, 32, 0.95)',
              borderColor: toast.type === 'alert' ? 'var(--alert)' : toast.type === 'success' ? 'var(--success)' : 'var(--primary)',
              boxShadow: `0 10px 30px rgba(0,0,0,0.6), 0 0 15px ${toast.type === 'alert' ? 'var(--alert-glow)' : toast.type === 'success' ? 'var(--success-glow)' : 'var(--primary-glow)'}`,
              display: 'flex',
              gap: '14px',
              alignItems: 'flex-start'
            }}
          >
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              background: toast.type === 'alert' ? 'rgba(244,63,94,0.15)' : toast.type === 'success' ? 'rgba(16,185,129,0.15)' : 'rgba(217,70,239,0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: toast.type === 'alert' ? 'var(--alert)' : toast.type === 'success' ? 'var(--success)' : 'var(--primary)',
              flexShrink: 0
            }}>
              {toast.type === 'alert' ? <AlertCircle size={16} /> : toast.type === 'success' ? <CheckCircle size={16} /> : <Sparkles size={16} />}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: '2px', color: 'white' }}>{toast.title}</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>{toast.description}</div>
            </div>
            <button onClick={() => removeToast(toast.id)} style={{ background: 'none', border: 'none', color: 'var(--text-dim)', cursor: 'pointer' }}>
              <X size={16} />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

function Sidebar({ mobileOpen, setMobileOpen, unreadCount, liveActivity }) {
  const location = useLocation();
  const path = location.pathname;

  return (
    <>
      <div className={`sidebar ${mobileOpen ? "mobile-open" : ""}`}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "8px",
          }}
        >
          <div className="brand">
            <div className="brand-icon">
              <Bot size={22} color="white" />
            </div>
            NexaFlow AI
          </div>
          <button
            onClick={() => setMobileOpen(false)}
            style={{
              display: "none",
              background: "rgba(255,255,255,0.05)",
              border: "none",
              padding: "8px",
              borderRadius: "50%",
              color: "white",
              cursor: "pointer",
            }}
            className="mobile-close-btn"
          >
            <X size={18} />
          </button>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
          <Link
            to="/"
            className={`nav-link ${path === "/" ? "active" : ""}`}
            onClick={() => setMobileOpen(false)}
          >
            <LayoutDashboard size={18} /> Dashboard
          </Link>
          <Link
            to="/inbox"
            className={`nav-link ${path === "/inbox" ? "active" : ""}`}
            onClick={() => setMobileOpen(false)}
          >
            <MessageSquare size={18} /> Unified Inbox
            {unreadCount > 0 && (
              <span
                style={{
                  marginLeft: "auto",
                  background: "var(--primary)",
                  color: "white",
                  fontSize: "0.75rem",
                  fontWeight: 800,
                  padding: "2px 8px",
                  borderRadius: "10px",
                  boxShadow: "0 0 10px var(--primary-glow)",
                }}
              >
                {unreadCount}
              </span>
            )}
          </Link>
          <Link
            to="/leads"
            className={`nav-link ${path === "/leads" ? "active" : ""}`}
            onClick={() => setMobileOpen(false)}
          >
            <Users size={18} /> Lead CRM
          </Link>
          <Link
            to="/bookings"
            className={`nav-link ${path === "/bookings" ? "active" : ""}`}
            onClick={() => setMobileOpen(false)}
          >
            <Calendar size={18} /> Bookings
          </Link>
          <Link
            to="/voice-call"
            className={`nav-link ${path === "/voice-call" ? "active" : ""}`}
            onClick={() => setMobileOpen(false)}
          >
            <Phone size={18} /> Voice AI Simulator
          </Link>
          <Link
            to="/defect-analytics"
            className={`nav-link ${path === "/defect-analytics" ? "active" : ""}`}
            onClick={() => setMobileOpen(false)}
          >
            <Activity size={18} /> Defect Analytics
          </Link>
          <Link
            to="/rules"
            className={`nav-link ${path === "/rules" ? "active" : ""}`}
            onClick={() => setMobileOpen(false)}
          >
            <Settings2 size={18} /> Automations
          </Link>
        </div>

        <div style={{ flex: 1 }}></div>

        {/* Small live status segment in sidebar */}
        <div
          className="glass-panel"
          style={{
            padding: "16px",
            background: "rgba(255,255,255,0.01)",
            borderColor: "rgba(168,85,247,0.1)",
            borderRadius: "12px",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              marginBottom: "8px",
            }}
          >
            <div className="pulsing-dot"></div>
            <span
              style={{
                fontSize: "0.75rem",
                fontWeight: "bold",
                letterSpacing: "0.05em",
                color: "var(--text-muted)",
              }}
            >
              COGNITIVE AGENTS
            </span>
          </div>
          <div style={{ fontSize: "0.8rem", color: "var(--text-dim)" }}>
            4 core models active. Monitoring WhatsApp, IG, Web & Voice 24/7.
          </div>
        </div>
      </div>

      {/* Screen Backdrop for mobile sidebar drawer */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.5)",
            backdropFilter: "blur(4px)",
            zIndex: 40,
          }}
        />
      )}
    </>
  );
}

function TopBar({ setMobileOpen, unreadCount, alerts, clearAlerts, demoMode, setDemoMode }) {
  const [showNotificationPanel, setShowNotificationPanel] = useState(false);

  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '20px', marginBottom: '32px' }}>
      <button 
        onClick={() => setMobileOpen(true)}
        className="mobile-hamburger"
        style={{ display: 'none', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', padding: '10px', borderRadius: '10px', color: 'white', cursor: 'pointer' }}
      >
        <Menu size={20} />
      </button>

      <div style={{ position: 'relative', flex: 1, maxWidth: '380px' }} className="search-bar-container">
        <Search size={16} style={{ position: 'absolute', left: '16px', top: '12px', color: 'var(--text-muted)' }}/>
        <input 
          type="text" 
          placeholder="Search prospects, bookings, system nodes..." 
          onKeyDown={(e) => { 
            if(e.key === 'Enter') {
              if (globalAddToast) globalAddToast("Search Platform", `Displaying matches for: "${e.target.value}"`, "success");
            }
          }} 
          style={{ 
            background: 'rgba(0,0,0,0.3)', 
            border: '1px solid var(--border)', 
            padding: '10px 16px 10px 44px', 
            borderRadius: '24px', 
            color: 'white', 
            width: '100%', 
            outline: 'none', 
            fontSize: '0.85rem',
            transition: 'all 0.3s'
          }}
          className="search-input"
        />
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
        {/* Floating Enterprise Demo Mode Toggle */}
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '10px', 
          background: 'rgba(217, 70, 239, 0.04)', 
          border: '1px solid var(--border)', 
          padding: '6px 16px', 
          borderRadius: '20px', 
          boxShadow: demoMode ? '0 0 15px rgba(217, 70, 239, 0.15)' : 'none',
          transition: 'all 0.3s'
        }}>
          <span style={{ fontSize: '0.72rem', fontWeight: 800, color: demoMode ? 'var(--primary)' : 'var(--text-dim)', letterSpacing: '0.05em' }}>
            DEMO STREAM
          </span>
          <div 
            className={`toggle-switch ${demoMode ? 'active' : ''}`} 
            onClick={() => {
              setDemoMode(!demoMode);
              if (globalAddToast) {
                globalAddToast("Demo Engine engaged", !demoMode ? "Continuous lead and metrics updates enabled." : "Continuous activity paused.", "success");
              }
            }}
            style={{ width: '42px', height: '22px', border: '1px solid rgba(255,255,255,0.08)' }}
          >
            <div className="toggle-knob" style={{ width: '16px', height: '16px', top: '2px', left: '2px', transform: demoMode ? 'translateX(20px)' : 'none' }}></div>
          </div>
        </div>

        {/* Notification Bell with interactive panel */}
        <div style={{ position: 'relative' }}>
          <div 
            onClick={() => setShowNotificationPanel(!showNotificationPanel)} 
            style={{ 
              position: 'relative', 
              cursor: 'pointer', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              background: 'rgba(255,255,255,0.05)', 
              border: '1px solid var(--border)',
              padding: '10px', 
              borderRadius: '50%',
              transition: 'all 0.3s'
            }}
            className="bell-icon-btn"
          >
            <Bell size={18} color="#e2e8f0"/>
            {unreadCount > 0 && (
              <div style={{ 
                position: 'absolute', 
                top: '-2px', 
                right: '-2px', 
                background: 'var(--alert)', 
                color: 'white', 
                fontSize: '0.65rem', 
                fontWeight: 'bold', 
                minWidth: '18px', 
                height: '18px', 
                borderRadius: '50%', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                boxShadow: '0 0 10px var(--alert)'
              }}>
                {unreadCount}
              </div>
            )}
          </div>

          <AnimatePresence>
            {showNotificationPanel && (
              <>
                <div style={{ position: 'fixed', inset: 0, zIndex: 80 }} onClick={() => setShowNotificationPanel(false)} />
                <motion.div
                  initial={{ opacity: 0, y: 15, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 15, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  className="glass-panel"
                  style={{
                    position: 'absolute',
                    top: '52px',
                    right: '0',
                    width: '380px',
                    maxHeight: '480px',
                    background: 'rgba(12, 6, 22, 0.98)',
                    border: '1px solid var(--border)',
                    boxShadow: '0 10px 40px rgba(0,0,0,0.7), 0 0 15px var(--primary-glow)',
                    zIndex: 90,
                    padding: '20px',
                    display: 'flex',
                    flexDirection: 'column',
                    borderRadius: '16px'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '12px' }}>
                    <span style={{ fontWeight: 800, fontSize: '0.95rem', color: 'white' }}>Automated Operations Feed</span>
                    <button 
                      onClick={() => {
                        clearAlerts();
                        setShowNotificationPanel(false);
                      }} 
                      style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600 }}
                    >
                      Clear all
                    </button>
                  </div>

                  <div style={{ overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '12px', paddingRight: '4px' }}>
                    {alerts.length === 0 ? (
                      <div style={{ padding: '24px 0', textAlign: 'center', color: 'var(--text-dim)', fontSize: '0.85rem' }}>
                        No new system activity recorded.
                      </div>
                    ) : (
                      alerts.map((item) => (
                        <div key={item.id} style={{ display: 'flex', gap: '12px', paddingBottom: '12px', borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                          <div style={{
                            width: '28px',
                            height: '28px',
                            borderRadius: '50%',
                            background: item.type === 'lead' ? 'rgba(6,182,212,0.12)' : item.type === 'booking' ? 'rgba(16,185,129,0.12)' : 'rgba(217,70,239,0.12)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: item.type === 'lead' ? 'var(--ai-core)' : item.type === 'booking' ? 'var(--success)' : 'var(--primary)',
                            flexShrink: 0
                          }}>
                            {item.type === 'lead' ? <Users size={14} /> : item.type === 'booking' ? <Calendar size={14} /> : <Zap size={14} />}
                          </div>
                          <div>
                            <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'white' }}>{item.title}</div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '2px' }}>{item.description}</div>
                            <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.3)', marginTop: '4px' }}>{item.time}</div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', paddingLeft: '16px', borderLeft: '1px solid rgba(255,255,255,0.1)' }} className="top-bar-admin">
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '0.85rem', fontWeight: 'bold', color: 'white' }}>System Admin</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>GradSkills AI Console</div>
          </div>
          <div style={{ 
            width: '38px', 
            height: '38px', 
            borderRadius: '50%', 
            background: 'linear-gradient(135deg, var(--primary), var(--accent))', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            fontWeight: 800,
            color: 'white',
            boxShadow: '0 0 15px var(--primary-glow)'
          }}>
            A
          </div>
        </div>
      </div>
    </div>
  );
}

function Dashboard({ metrics, activeAlerts, refreshMetrics }) {
  const [showArchModal, setShowArchModal] = useState(false);
  const [isCompiling, setIsCompiling] = useState(true);

  useEffect(() => {
    // Artificial delay to demonstrate beautiful skeletons
    const timer = setTimeout(() => {
      setIsCompiling(false);
    }, 1200);
    return () => clearTimeout(timer);
  }, []);

  if (isCompiling || !metrics) {
    return (
      <div className="main-content">
        <div style={{ height: '40px', marginBottom: '32px', display: 'flex', justifyContent: 'flex-end', gap: '16px' }} />
        <div className="glass-panel skeleton-shimmer" style={{ height: '180px', borderRadius: '16px', marginBottom: '32px' }} />
        <div className="metrics-grid">
          <MetricSkeleton />
          <MetricSkeleton />
          <MetricSkeleton />
          <MetricSkeleton />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
          <ChartSkeleton />
          <div className="glass-panel skeleton-shimmer" style={{ height: '280px', borderRadius: '20px' }} />
        </div>
      </div>
    );
  }

  const intentData = Object.entries(metrics.intents).map(([name, value]) => ({ name, value }));
  const funnelData = [
    { name: 'Unified Inbound', value: metrics.total_messages + 42 },
    { name: 'AI Scored Leads', value: metrics.total_leads },
    { name: 'Confirmed Bookings', value: metrics.total_bookings }
  ];

  return (
    <div className="main-content">
      {/* Floating orbs */}
      <div className="bg-orb orb-purple"></div>
      <div className="bg-orb orb-blue"></div>

      {/* Hero Banner */}
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', damping: 25, stiffness: 80 }}
        style={{
          background: 'linear-gradient(135deg, rgba(217, 70, 239, 0.12), rgba(139, 92, 246, 0.15))',
          borderRadius: '24px',
          padding: '36px',
          marginBottom: '36px',
          border: '1px solid rgba(217, 70, 239, 0.25)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          boxShadow: '0 20px 50px rgba(0,0,0,0.5), inset 0 0 24px rgba(217, 70, 239, 0.05)',
          position: 'relative',
          overflow: 'hidden'
        }}
        className="hero-banner"
      >
        <div style={{ position: 'absolute', right: '-5%', top: '-20%', width: '350px', height: '350px', background: 'radial-gradient(circle, rgba(217,70,239,0.18) 0%, transparent 70%)', filter: 'blur(50px)', pointerEvents: 'none' }}></div>
        <div style={{ position: 'relative', zIndex: 1, maxWidth: '65%' }}>
          <h1 style={{ fontSize: '2.8rem', fontWeight: 800, marginBottom: '10px', background: 'linear-gradient(135deg, #ffffff, var(--text-muted))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', letterSpacing: '-0.04em' }}>
            Multi Channel Business Intelligence
          </h1>
          <p style={{ color: '#d8b4fe', fontSize: '1.05rem', lineHeight: 1.5 }}>
            Automated customer acquisition, intelligent reservations, and manufacturing quality control executing live on edge node structures.
          </p>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', zIndex: 1, alignItems: 'flex-end' }} className="hero-buttons">
          <div style={{ display: 'flex', gap: '12px' }}>
            <button onClick={() => setShowArchModal(true)} style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', padding: '12px 20px', borderRadius: '14px', color: 'white', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', transition: 'all 0.3s' }} className="btn-hover-glow">
              <Cpu size={18} color="var(--primary)" /> Architecture Stack
            </button>
            <button onClick={() => {
              if (globalAddToast) globalAddToast("System Backup", "System state backed up to database (Supabase).", "success");
            }} style={{ background: 'linear-gradient(135deg, var(--primary), var(--accent))', border: 'none', padding: '12px 24px', borderRadius: '14px', color: 'white', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', boxShadow: '0 6px 20px var(--primary-glow)' }}>
              <Zap size={18} /> Reduce Manual Load
            </button>
          </div>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>Active GPU inference confidence: 94.6%</span>
        </div>
      </motion.div>
      
      {/* KPI Cards with Animated Numbers */}
      <div className="metrics-grid">
        <motion.div 
          whileHover={{ y: -6 }}
          className="glass-panel metric-card roi"
        >
          <div className="metric-header">Monthly Automated Savings <DollarSign size={16} color="var(--success)" /></div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px' }}>
            <div className="metric-value" style={{ color: 'var(--success)' }}>
              <AnimatedCounter value={metrics.roi_savings} isCurrency={true} />
            </div>
            <span style={{ color: 'var(--success)', fontSize: '0.85rem', fontWeight: 800, background: 'rgba(16, 185, 129, 0.15)', padding: '2px 8px', borderRadius: '6px' }}>+14.2%</span>
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>Calculated AI efficiency ROI</div>
        </motion.div>
        
        <motion.div 
          whileHover={{ y: -6 }}
          className="glass-panel metric-card messages"
        >
          <div className="metric-header">Automated Inbound Sessions <MessageSquare size={16} color="var(--ai-core)" /></div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px' }}>
            <div className="metric-value">
              <AnimatedCounter value={metrics.total_messages} />
            </div>
            <span style={{ color: 'var(--success)', fontSize: '0.85rem', fontWeight: 800, background: 'rgba(16, 185, 129, 0.15)', padding: '2px 8px', borderRadius: '6px' }}>+38.5%</span>
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>Handled autonomously</div>
        </motion.div>

        <motion.div 
          whileHover={{ y: -6 }}
          className="glass-panel metric-card conversion"
        >
          <div className="metric-header">Booking Conversion Index <Target size={16} color="var(--alert)" /></div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px' }}>
            <div className="metric-value" style={{ color: 'var(--alert)' }}>
              <AnimatedCounter value={metrics.conversion_rate} suffix="%" />
            </div>
            <span style={{ color: 'var(--success)', fontSize: '0.85rem', fontWeight: 800, background: 'rgba(16, 185, 129, 0.15)', padding: '2px 8px', borderRadius: '6px' }}>+9.1%</span>
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>Intent matching accuracy</div>
        </motion.div>

        <motion.div 
          whileHover={{ y: -6 }}
          className="glass-panel metric-card agents"
        >
          <div className="metric-header">Cognitive Models Online <Bot size={16} color="var(--accent)" /></div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px' }}>
            <div className="metric-value" style={{ color: 'var(--accent)' }}>
              <AnimatedCounter value={metrics.active_automations} />
            </div>
            <span style={{ color: 'var(--accent)', fontSize: '0.85rem', fontWeight: 800, background: 'rgba(139, 92, 246, 0.15)', padding: '2px 8px', borderRadius: '6px' }}>LIVE</span>
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>24/7 Operations monitoring</div>
        </motion.div>
      </div>
      
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '28px' }} className="dashboard-charts-row">
        {/* Charts Section */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
          <div className="glass-panel">
            <h2 style={{ marginBottom: '20px', fontSize: '1.2rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '10px', color: 'white' }}><Activity size={18} color="var(--primary)"/> Lead Flow & Conversions</h2>
            <div style={{ height: 260 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={funnelData} layout="vertical" margin={{ top: 5, right: 30, left: 10, bottom: 5 }}>
                  <defs>
                    <linearGradient id="barGradient" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="var(--primary)" />
                      <stop offset="100%" stopColor="var(--accent)" />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" horizontal={false} />
                  <XAxis type="number" stroke="var(--text-dim)" style={{ fontSize: '0.75rem' }} />
                  <YAxis dataKey="name" type="category" stroke="var(--text-dim)" width={120} style={{ fontSize: '0.75rem', fontWeight: 600 }} />
                  <Tooltip cursor={{ fill: 'rgba(255,255,255,0.02)' }} contentStyle={{ background: 'rgba(12, 6, 22, 0.95)', border: '1px solid var(--primary)', borderRadius: '12px' }} />
                  <Bar dataKey="value" fill="url(#barGradient)" radius={[0, 6, 6, 0]} barSize={26} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="glass-panel">
            <h2 style={{ marginBottom: '20px', fontSize: '1.2rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '10px', color: 'white' }}><MessageSquare size={18} color="var(--ai-core)"/> Intent Classification Distribution</h2>
            <div style={{ height: 260 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={intentData} innerRadius={75} outerRadius={100} paddingAngle={6} dataKey="value" label={({name, percent}) => `${name} ${(percent * 100).toFixed(0)}%`} style={{ fontSize: '0.75rem', fontWeight: 700, fill: 'white' }}>
                    {intentData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} stroke="rgba(0,0,0,0)" />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ background: 'rgba(12, 6, 22, 0.95)', border: '1px solid var(--primary)', borderRadius: '12px' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Live Activity Feed */}
        <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
          <div style={{ display: 'flex', justifySelf: 'stretch', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'white' }}>Autonomous Operations</h2>
            <div className="live-indicator">
              <div className="pulsing-dot"></div> Live
            </div>
          </div>

          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '16px', overflowY: 'auto', paddingRight: '4px' }}>
            <AnimatePresence initial={false}>
              {activeAlerts.slice(0, 7).map((act, index) => (
                <motion.div 
                  key={act.id} 
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ type: 'spring', stiffness: 200, damping: 18 }}
                  style={{ 
                    display: 'flex', 
                    gap: '14px', 
                    paddingBottom: '16px', 
                    borderBottom: index !== activeAlerts.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none' 
                  }}
                >
                  <div style={{ 
                    width: '34px', 
                    height: '34px', 
                    borderRadius: '50%', 
                    background: act.type === 'booking' ? 'rgba(16,185,129,0.12)' : act.type === 'lead' ? 'rgba(6,182,212,0.12)' : 'rgba(217,70,239,0.12)', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    color: act.type === 'booking' ? 'var(--success)' : act.type === 'lead' ? 'var(--ai-core)' : 'var(--primary)', 
                    flexShrink: 0 
                  }}>
                    {act.type === 'booking' ? <Calendar size={15}/> : act.type === 'lead' ? <Users size={15}/> : <Zap size={15}/>}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'white' }}>{act.title}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)', marginTop: '2px' }}>{act.description}</div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '6px' }}>
                      <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.3)' }}>{act.time}</span>
                      <span className="confidence-badge" style={{ fontSize: '0.65rem', padding: '2px 6px' }}>
                        {act.confidence ? `${act.confidence}% Conf.` : '94% Conf.'}
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Tech Stack Architecture Modal */}
      <AnimatePresence>
        {showArchModal && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.82)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="glass-panel" 
              style={{ width: '620px', padding: '36px', background: '#0e0818', borderColor: 'var(--primary)', boxShadow: '0 0 50px rgba(217, 70, 239, 0.3)' }}
            >
              <h2 style={{ marginBottom: '24px', fontSize: '1.6rem', textAlign: 'center', background: 'linear-gradient(135deg, #ffffff 40%, var(--text-muted) 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', fontWeight: 800 }}>
                Enterprise Platform Infrastructure
              </h2>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '32px' }}>
                <div style={{ background: 'rgba(255,255,255,0.03)', padding: '18px', borderRadius: '16px', borderLeft: '4px solid var(--primary)' }}>
                  <h3 style={{ margin: '0 0 6px 0', display: 'flex', alignItems: 'center', gap: '10px', color: 'white', fontWeight: 700 }}><LayoutDashboard size={18} color="var(--primary)"/> Premium Frontend Stack</h3>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-dim)', margin: 0 }}>React, Vite, Framer Motion for high frame-rate micro-interactions, styled with custom glassmorphism components and glowing purple layouts.</p>
                </div>

                <div style={{ background: 'rgba(255,255,255,0.03)', padding: '18px', borderRadius: '16px', borderLeft: '4px solid var(--ai-core)' }}>
                  <h3 style={{ margin: '0 0 6px 0', display: 'flex', alignItems: 'center', gap: '10px', color: 'white', fontWeight: 700 }}><Cpu size={18} color="var(--ai-core)"/> Core Cognitive AI Engine</h3>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-dim)', margin: 0 }}>Natural Language processing models fine-tuned to extract user intent, score leads dynamically, and automate multi-channel messaging.</p>
                </div>

                <div style={{ background: 'rgba(255,255,255,0.03)', padding: '18px', borderRadius: '16px', borderLeft: '4px solid var(--success)' }}>
                  <h3 style={{ margin: '0 0 6px 0', display: 'flex', alignItems: 'center', gap: '10px', color: 'white', fontWeight: 700 }}><HardDrive size={18} color="var(--success)"/> Database & Sync Layer</h3>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-dim)', margin: 0 }}>Supabase database storing transactional histories. Pushes instant telemetry updates to connected client dashboards.</p>
                </div>
              </div>

              <button 
                onClick={() => setShowArchModal(false)} 
                style={{ width: '100%', background: 'linear-gradient(135deg, var(--primary), var(--accent))', border: 'none', color: 'white', padding: '14px', borderRadius: '12px', cursor: 'pointer', fontWeight: 800, fontSize: '1rem', boxShadow: '0 6px 20px var(--primary-glow)' }}
              >
                Dismiss Architecture Details
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Inbox({ messages, setMessages, refreshMetrics }) {
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [thinkingSteps, setThinkingSteps] = useState([]);
  const endRef = useRef(null);

  const activeContact = {
    name: "General Workspace Inquiry",
    status: "Live Agent Session",
    phone: "+91 9876543210"
  };

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping, thinkingSteps]);

  // Suggested Quick Replies dynamically evaluated based on conversation state
  const getSuggestedReplies = () => {
    if (messages.length === 0) return [];
    const lastMessage = messages[messages.length - 1];
    
    if (lastMessage.direction === 'outbound') return [];
    
    const text = lastMessage.text.toLowerCase();
    if (text.includes("price") || text.includes("cost") || text.includes("plans")) {
      return [
        { label: "🎁 Offer 20% Discount", action: "apply_discount" },
        { label: "📄 Share brochure PDF", action: "send_brochure" },
        { label: "🎯 Create Lead", action: "create_lead" }
      ];
    } else if (text.includes("book") || text.includes("reserve") || text.includes("desk")) {
      return [
        { label: "📝 Finalize Seat Booking", action: "confirm_desk" },
        { label: "🏢 Upgrade to Private Office", action: "suggest_office" }
      ];
    } else if (text.includes("WiFi") || text.includes("down") || text.includes("unacceptable")) {
      return [
        { label: "🚨 Escalate to Manager", action: "escalate_urgency" },
        { label: "💬 Apologize & Offer Compensation", action: "compensate" }
      ];
    }

    return [
      { label: "💵 Send Pricing Details", action: "send_pricing" },
      { label: "📅 Book Demo Tour", action: "book_demo" },
      { label: "📄 Share Brochure", action: "send_brochure" }
    ];
  };

  const executeAction = async (actionType, labelText) => {
    setIsTyping(true);
    setThinkingSteps([]);

    // Multi-stage artificial cognitive thinking steps
    const steps = [
      "Analyzing user intent & parameters...",
      "Consulting workspace database availability...",
      "Scoring lead match indexes..."
    ];

    for (let i = 0; i < steps.length; i++) {
      setThinkingSteps(prev => [...prev, steps[i]]);
      await new Promise(resolve => setTimeout(resolve, 800));
    }

    let replyText = "Action resolved. I've updated the system.";
    let notificationTitle = "AI Auto Action";
    let notificationDesc = "Resolved inbox conversation task.";

    if (actionType === "send_pricing") {
      replyText = "Here are our current hot desk options:\n🏢 Hot Desk: $10/day\n🖥️ Dedicated Seat: $150/month\n🏢 Private Office: $500/month\nWhich suits your team best?";
      notificationTitle = "Pricing Sent";
      notificationDesc = "Shared desk packages with inquirer.";
    } else if (actionType === "apply_discount") {
      replyText = "🎉 Special Campaign Applied! I've provisioned an exclusive 20% discount on your dedicated seat plan. Click here to claim your offer.";
      notificationTitle = "Discount Applied";
      notificationDesc = "Granted 20% promotional code.";
    } else if (actionType === "create_lead") {
      replyText = "✓ Perfect! I've synchronized your profile details into our CRM database. Our director will reach out within 2 hours.";
      notificationTitle = "Lead Synced to CRM";
      notificationDesc = "Registered Hot Prospect (94% confidence match).";
      
      // Call mock endpoint / local state update if needed
      fetch(`${API_BASE}/crm/leads`).catch(() => {});
      setTimeout(() => refreshMetrics(), 1000);
    } else if (actionType === "confirm_desk") {
      replyText = "✓ Reservation Successful! I've provisioned a Dedicated Seat reservation for tomorrow (09:00 AM) and finalized the invoice details.";
      notificationTitle = "Reservation Confirmed";
      notificationDesc = "Created B5 Dedicated Seat Booking ($150).";
      
      setTimeout(() => refreshMetrics(), 1000);
    } else if (actionType === "escalate_urgency") {
      replyText = "🚨 Alert Raised! I've cataloged this conversation as HIGH PRIORITY and assigned it immediately to our Senior Support Manager.";
      notificationTitle = "Customer Escalation";
      notificationDesc = "Assigned active thread to Supervisor.";
    }

    setThinkingSteps([]);
    setIsTyping(false);

    const botMsg = {
      id: Date.now().toString(),
      sender: "AI Bot",
      text: replyText,
      direction: "outbound",
      channel: "system",
      timestamp: new Date().toISOString(),
      confidence: 96
    };

    setMessages(prev => [...prev, botMsg]);

    if (globalAddToast) {
      globalAddToast(notificationTitle, notificationDesc, actionType === "escalate_urgency" ? "alert" : "success");
    }
  };

  const handleSend = async () => {
    if (!input.trim()) return;
    const text = input;
    setInput("");

    const userMsg = {
      id: Date.now().toString(),
      sender: "User",
      text,
      direction: "inbound",
      channel: "web",
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMsg]);
    setIsTyping(true);

    // Multi-stage thinking prompts
    const steps = [
      "Interpreting customer vocabulary...",
      "Scoring intent confidence threshold...",
      "Generating optimal context-aware reply..."
    ];

    for (let i = 0; i < steps.length; i++) {
      setThinkingSteps(prev => [...prev, steps[i]]);
      await new Promise(resolve => setTimeout(resolve, 600));
    }

    try {
      const res = await fetch(`${API_BASE}/inbox/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, channel: "web", sender: "User" })
      });
      const data = await res.json();
      
      setMessages(prev => [...prev, {
        ...data.reply,
        confidence: 94
      }]);
    } catch {
      // Offline fallback mock responses
      let fallbackText = "Thanks for connecting. Let me know how I can guide your workspace search!";
      let conf = 85;
      
      if (text.toLowerCase().includes("pricing") || text.toLowerCase().includes("cost")) {
        fallbackText = "Our Dedicated Desk plans start at $150/mo, with Hot Desks at $10/day. Provisioning details are sent directly in real-time.";
        conf = 92;
      }
      
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        sender: "AI Bot",
        text: fallbackText,
        direction: "outbound",
        channel: "system",
        timestamp: new Date().toISOString(),
        confidence: conf
      }]);
    } finally {
      setThinkingSteps([]);
      setIsTyping(false);
      setTimeout(() => refreshMetrics(), 1000);
    }
  };

  return (
    <div className="main-content">
      {/* Background orbs */}
      <div className="bg-orb orb-purple"></div>

      <div className="page-header">
        <h1 className="page-title">Unified Inbox</h1>
        <p className="page-subtitle">Multi-channel conversational streams powered by Cognitive Automations.</p>
      </div>

      <div className="glass-panel inbox-container">
        {/* Left Side: Sessions List */}
        <div className="chat-list">
          <div className="chat-item" style={{ background: 'rgba(217, 70, 239, 0.08)', borderColor: 'var(--primary)' }}>
            <div className="chat-item-header">
              <span style={{ color: 'white' }}>{activeContact.name}</span>
              <span className="live-indicator" style={{ background: 'none', border: 'none', padding: 0 }}><div className="pulsing-dot"></div></span>
            </div>
            <div className="chat-preview" style={{ color: 'var(--text-muted)', fontWeight: 600 }}>Analyzing intent in real time...</div>
          </div>
        </div>

        {/* Right Side: active dialogue portal */}
        <div className="chat-window">
          <div className="messages-area">
            {messages.map(m => (
              <div key={m.id} className={`chat-message-row ${m.direction === 'outbound' ? 'outbound' : ''}`}>
                <div className={`avatar ${m.direction === 'outbound' ? 'avatar-ai' : 'avatar-user'}`}>
                  {m.direction === 'outbound' ? <Bot size={18} /> : 'U'}
                </div>
                <div className={`message-bubble ${m.direction === 'inbound' ? 'message-inbound' : 'message-outbound'}`}>
                  <div style={{ fontSize: '0.72rem', opacity: 0.8, marginBottom: '6px', display: 'flex', gap: '8px', justifyContent: 'space-between', fontWeight: 600 }}>
                    <span>{m.sender} • {new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    {m.confidence && (
                      <span style={{ color: m.direction === 'outbound' ? '#22d3ee' : '#10b981', background: 'rgba(255,255,255,0.12)', padding: '1px 6px', borderRadius: '4px' }}>
                        {m.confidence}% Match
                      </span>
                    )}
                  </div>
                  <div style={{ whiteSpace: 'pre-line' }}>{m.text}</div>
                </div>
              </div>
            ))}

            {/* Simulated stage-by-stage thinking indicator */}
            {thinkingSteps.length > 0 && (
              <div className="chat-message-row outbound">
                <div className="avatar avatar-ai"><Bot size={18} /></div>
                <div className="thinking-steps-panel">
                  {thinkingSteps.map((step, idx) => (
                    <div key={idx} className="thinking-step">
                      {idx === thinkingSteps.length - 1 ? <div className="thinking-spinner"></div> : <CheckCircle size={10} color="var(--ai-core)" />}
                      <span>{step}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {isTyping && thinkingSteps.length === 0 && (
              <div className="chat-message-row outbound">
                <div className="avatar avatar-ai"><Bot size={18} /></div>
                <div className="typing-indicator">
                  <div className="typing-dot"></div>
                  <div className="typing-dot"></div>
                  <div className="typing-dot"></div>
                </div>
              </div>
            )}
            <div ref={endRef} />
          </div>

          {/* Action suggested replies */}
          <div style={{ padding: '0 8px 12px 8px' }}>
            <AnimatePresence>
              {getSuggestedReplies().length > 0 && (
                <motion.div 
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="suggestion-chips"
                >
                  {getSuggestedReplies().map((reply, idx) => (
                    <button 
                      key={idx} 
                      onClick={() => executeAction(reply.action, reply.label)}
                      className="suggestion-chip"
                    >
                      {reply.label}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="chat-input-area">
            <div className="chat-input-row">
              <input 
                type="text" 
                className="chat-input" 
                placeholder="Talk with the AI agent to test simulated replies..." 
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSend()}
              />
              <button className="btn-send" onClick={handleSend}><Send size={18} /></button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function CRMLeads({ leads, refreshMetrics }) {
  const highIntent = leads.filter(l => l.score >= 80).length;

  return (
    <div className="main-content">
      {/* Background orb */}
      <div className="bg-orb orb-blue"></div>

      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 className="page-title">Prospect Pipeline</h1>
          <p className="page-subtitle">AI lead tracking scored dynamically via automated intent channels.</p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button onClick={() => alert("Exporting sales leads as standard CSV...")} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', color: 'white', padding: '10px 18px', borderRadius: '12px', cursor: 'pointer', fontWeight: 700 }}>Export Pipeline</button>
          <button onClick={() => {
            if (globalAddToast) globalAddToast("Marketing Engine", "Outbound dynamic nurturing emails sent to pipeline.", "success");
          }} style={{ background: 'linear-gradient(135deg, var(--primary), var(--accent))', border: 'none', color: 'white', padding: '10px 20px', borderRadius: '12px', cursor: 'pointer', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 4px 15px var(--primary-glow)' }}>
            <Target size={16}/> Start Campaign
          </button>
        </div>
      </div>

      <div className="metrics-grid" style={{ marginBottom: '36px' }}>
        <div className="glass-panel metric-card" style={{ padding: '20px 24px' }}>
          <div className="metric-header">Total Prospects <Users size={16} color="var(--primary)"/></div>
          <div className="metric-value" style={{ color: 'var(--primary)' }}>{leads.length + 120}</div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>Actively matching intents</div>
        </div>
        <div className="glass-panel metric-card" style={{ padding: '20px 24px' }}>
          <div className="metric-header">High Match Prospects <Zap size={16} color="var(--alert)"/></div>
          <div className="metric-value" style={{ color: 'var(--alert)' }}>{highIntent + 14}</div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>Confidence index &gt; 80%</div>
        </div>
        <div className="glass-panel metric-card" style={{ padding: '20px 24px' }}>
          <div className="metric-header">System Match Rate <Activity size={16} color="var(--success)"/></div>
          <div className="metric-value" style={{ color: 'var(--success)' }}>94.2%</div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>Average scoring consistency</div>
        </div>
      </div>
      
      <div className="glass-panel">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'white' }}>Syncd Profiles</h2>
        </div>
        <table className="crm-table">
          <thead>
            <tr>
              <th>Lead Profile</th>
              <th>Channel</th>
              <th>Confidence Score</th>
              <th>Intent Assessment</th>
              <th>Chores</th>
            </tr>
          </thead>
          <tbody>
            {leads.map(lead => (
              <tr key={lead.id}>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <div className="avatar avatar-user" style={{ width: '38px', height: '38px', fontSize: '0.9rem', fontWeight: 800 }}>{lead.name.charAt(0)}</div>
                    <div>
                      <div style={{ fontWeight: 800, fontSize: '0.95rem', color: 'white' }}>{lead.name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{lead.contact}</div>
                    </div>
                  </div>
                </td>
                <td>
                  <span style={{ textTransform: 'capitalize', fontWeight: 700, fontSize: '0.85rem', color: lead.channel === 'whatsapp' ? 'var(--success)' : 'var(--primary)' }}>
                    {lead.channel}
                  </span>
                </td>
                <td style={{ width: '180px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '4px', fontWeight: 700 }}>
                    <span style={{ color: lead.score >= 80 ? 'var(--alert)' : lead.score >= 50 ? 'var(--warning)' : 'var(--text-dim)' }}>
                      {lead.score}% confidence
                    </span>
                  </div>
                  <div className="score-bar-bg">
                    <div className="score-bar-fill" style={{ width: `${lead.score}%`, background: lead.score >= 80 ? 'linear-gradient(90deg, var(--alert), var(--primary))' : lead.score >= 50 ? 'var(--warning)' : 'var(--text-dim)' }}></div>
                  </div>
                </td>
                <td>
                  {lead.score >= 80 ? (
                    <span className="status-badge status-hot">🔥 High Intent</span>
                  ) : lead.score >= 50 ? (
                    <span className="status-badge status-warm">⚡ Nurturing</span>
                  ) : (
                    <span className="status-badge status-cold">Cold Match</span>
                  )}
                </td>
                <td>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button onClick={() => alert(`Opening active thread with ${lead.name}...`)} style={{ background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.3)', color: 'var(--success)', padding: '6px 12px', borderRadius: '8px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 700 }}>Interact</button>
                    <button onClick={() => {
                      if (globalAddToast) globalAddToast("Booking Conversion", `Assigned Dedicated seat to ${lead.name}`, "success");
                      refreshMetrics();
                    }} style={{ background: 'rgba(217,70,239,0.12)', border: '1px solid rgba(217,70,239,0.3)', color: 'var(--primary)', padding: '6px 12px', borderRadius: '8px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 700 }}>Mark Won</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function CRMBookings({ bookings, setBookings, refreshMetrics }) {
  const [showModal, setShowModal] = useState(false);
  const [newBooking, setNewBooking] = useState({ name: '', type: 'Hot Desk ($10/day)', date: '' });

  const totalRevenue = bookings.filter(b => b.status === 'Confirmed').reduce((sum, b) => sum + (b.revenue || 0), 0);
  const pendingCount = bookings.filter(b => b.status === 'Pending').length;

  const updateStatus = (id, newStatus) => {
    setBookings(bookings.map(b => b.id === id ? { ...b, status: newStatus } : b));
    if (globalAddToast) {
      globalAddToast("Reservation Updated", `Changed status to: ${newStatus}`, newStatus === 'Confirmed' ? 'success' : 'alert');
    }
    setTimeout(() => refreshMetrics(), 1000);
  };

  return (
    <div className="main-content">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 className="page-title">Bookings Manager</h1>
          <p className="page-subtitle">Monitor and confirm workspace packages allocated autonomously by the AI.</p>
        </div>
        <button onClick={() => setShowModal(true)} style={{ background: 'linear-gradient(135deg, var(--primary), var(--accent))', border: 'none', color: 'white', padding: '12px 24px', borderRadius: '12px', cursor: 'pointer', fontWeight: 800, boxShadow: '0 4px 15px var(--primary-glow)' }}>
          Create Manual Booking
        </button>
      </div>

      <div className="metrics-grid" style={{ marginBottom: '36px' }}>
        <div className="glass-panel metric-card">
          <div className="metric-header">Confirmed Revenue <DollarSign size={16} color="var(--success)"/></div>
          <div className="metric-value" style={{ color: 'var(--success)' }}>
            <AnimatedCounter value={totalRevenue} isCurrency={true} />
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>Weekly yield</div>
        </div>
        <div className="glass-panel metric-card">
          <div className="metric-header">Pending Confirmations <Clock size={16} color="var(--warning)"/></div>
          <div className="metric-value" style={{ color: 'var(--warning)' }}>
            <AnimatedCounter value={pendingCount} />
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>Require scheduling review</div>
        </div>
        <div className="glass-panel metric-card">
          <div className="metric-header">Space Capacity Utilized <Activity size={16} color="var(--primary)"/></div>
          <div className="metric-value" style={{ color: 'var(--primary)' }}>
            <AnimatedCounter value={78} suffix="%" />
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>Workspace density index</div>
        </div>
      </div>
      
      <div className="glass-panel">
        <table className="crm-table">
          <thead>
            <tr>
              <th>Prospect Name</th>
              <th>Scheduled Time</th>
              <th>Seat Package</th>
              <th>Amount</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {bookings.map(b => (
              <tr key={b.id}>
                <td style={{ fontWeight: 800, color: 'white' }}>{b.leadName}</td>
                <td>{b.date}</td>
                <td>
                  <span style={{ background: 'rgba(255,255,255,0.05)', padding: '4px 8px', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 600, border: '1px solid rgba(255,255,255,0.08)' }}>
                    {b.type}
                  </span>
                </td>
                <td style={{ fontWeight: 700, color: 'white' }}>${b.revenue}</td>
                <td>
                  <span className={`status-badge ${b.status === 'Confirmed' ? 'status-hot' : b.status === 'Pending' ? 'status-warm' : 'status-cold'}`} style={{
                    background: b.status === 'Confirmed' ? 'rgba(16,185,129,0.12)' : b.status === 'Cancelled' ? 'rgba(244,63,94,0.12)' : 'rgba(251,191,36,0.12)',
                    color: b.status === 'Confirmed' ? 'var(--success)' : b.status === 'Cancelled' ? 'var(--alert)' : 'var(--warning)',
                    borderColor: b.status === 'Confirmed' ? 'rgba(16,185,129,0.2)' : b.status === 'Cancelled' ? 'rgba(244,63,94,0.2)' : 'rgba(251,191,36,0.2)',
                  }}>{b.status}</span>
                </td>
                <td>
                  {b.status === 'Pending' ? (
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button onClick={() => updateStatus(b.id, 'Confirmed')} style={{ background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.4)', color: 'var(--success)', padding: '6px 12px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.8rem', fontWeight: 700 }}><CheckCircle size={12}/> Confirm</button>
                      <button onClick={() => updateStatus(b.id, 'Cancelled')} style={{ background: 'rgba(244,63,94,0.15)', border: '1px solid rgba(244,63,94,0.4)', color: 'var(--alert)', padding: '6px 12px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.8rem', fontWeight: 700 }}><XCircle size={12}/> Decline</button>
                    </div>
                  ) : (
                    <button onClick={() => alert(`Provisioning receipt invoice for: ${b.leadName}`)} style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', padding: '6px 12px', borderRadius: '8px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600 }}>Get Invoice</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Manual Booking Dialog */}
      <AnimatePresence>
        {showModal && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, backdropFilter: 'blur(8px)' }}>
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="glass-panel" 
              style={{ width: '400px', padding: '28px', background: '#10071c', borderColor: 'var(--primary)' }}
            >
              <h2 style={{ marginBottom: '8px', color: 'white', fontWeight: 800 }}>Create Workspace Booking</h2>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-dim)', marginBottom: '20px' }}>Override system metrics and schedule a manual allocation.</p>
              
              <input 
                type="text" 
                placeholder="Prospect Name" 
                value={newBooking.name}
                onChange={e => setNewBooking({...newBooking, name: e.target.value})}
                style={{ width: '100%', marginBottom: '14px', padding: '12px', background: 'rgba(0,0,0,0.4)', border: '1px solid var(--border)', color: 'white', borderRadius: '10px', outline: 'none' }} 
              />
              <select 
                value={newBooking.type}
                onChange={e => setNewBooking({...newBooking, type: e.target.value})}
                style={{ width: '100%', marginBottom: '14px', padding: '12px', background: '#10071c', border: '1px solid var(--border)', color: 'white', borderRadius: '10px', outline: 'none' }}
              >
                <option>Hot Desk ($10/day)</option>
                <option>Dedicated Seat ($150/mo)</option>
                <option>Private Office ($500/mo)</option>
              </select>
              <input 
                type="date" 
                value={newBooking.date}
                onChange={e => setNewBooking({...newBooking, date: e.target.value})}
                style={{ width: '100%', marginBottom: '24px', padding: '12px', background: 'rgba(0,0,0,0.4)', border: '1px solid var(--border)', color: 'white', borderRadius: '10px', outline: 'none' }} 
              />
              
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                <button onClick={() => setShowModal(false)} style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.15)', color: 'white', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer' }}>Cancel</button>
                <button onClick={() => { 
                  if(!newBooking.name) { alert("Input prospect name."); return; }
                  const amount = newBooking.type.includes('150') ? 150 : newBooking.type.includes('500') ? 500 : 10;
                  const item = {
                    id: Date.now().toString(),
                    leadName: newBooking.name,
                    type: newBooking.type.split(' (')[0],
                    date: newBooking.date || "Today, 12:00 PM",
                    revenue: amount,
                    status: 'Pending'
                  };
                  setBookings([item, ...bookings]);
                  
                  if (globalAddToast) globalAddToast("Booking Initiated", `Created pending ticket for ${newBooking.name}`, "success");
                  setShowModal(false);
                  setNewBooking({ name: '', type: 'Hot Desk ($10/day)', date: '' });
                  setTimeout(() => refreshMetrics(), 1000);
                }} style={{ background: 'linear-gradient(135deg, var(--primary), var(--accent))', border: 'none', color: 'white', padding: '8px 20px', borderRadius: '8px', cursor: 'pointer', fontWeight: 800 }}>Confirm Reservation</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Brand New high-impact Voice call simulator view
function VoiceCallSimulator({ bookings, setBookings, refreshMetrics }) {
  const [callState, setCallState] = useState("idle"); // idle, connecting, active, ended
  const [transcript, setTranscript] = useState([]);
  const [typewriterText, setTypewriterText] = useState("");
  const [callSummary, setCallSummary] = useState(null);

  const fullConversation = [
    { speaker: "Customer (Sarah Smith)", text: "Hello! I am calling to cancel my hot desk reservation scheduled for today." },
    { speaker: "Voice AI Agent", text: "Hi Sarah! I can certainly help with that. Let me look up your details in the database." },
    { speaker: "Voice AI Agent", text: "Analyzing account... I found your hot desk booking (B4) registered under Sarah Smith for today." },
    { speaker: "Voice AI Agent", text: "I have successfully processed your cancellation. The reservation is deleted and full payment refunded." },
    { speaker: "Customer (Sarah Smith)", text: "Oh, that was super fast! Perfect. Thank you so much!" },
    { speaker: "Voice AI Agent", text: "You're very welcome, Sarah! A summary has been sent via text. Have a wonderful day!" }
  ];

  const triggerCallSimulation = async () => {
    setCallState("connecting");
    setTranscript([]);
    setTypewriterText("");
    setCallSummary(null);

    await new Promise(resolve => setTimeout(resolve, 1500));
    setCallState("active");

    // Playback conversation sequentially
    for (let i = 0; i < fullConversation.length; i++) {
      const line = fullConversation[i];
      
      // Typewriter line animation
      let charIdx = 0;
      setTypewriterText("");
      while (charIdx < line.text.length) {
        setTypewriterText(prev => prev + line.text.charAt(charIdx));
        charIdx++;
        await new Promise(resolve => setTimeout(resolve, 20));
      }

      setTranscript(prev => [...prev, line]);
      setTypewriterText("");
      await new Promise(resolve => setTimeout(resolve, 1200));
    }

    setCallState("ended");

    // Cancel B4 booking in real-time CRM state!
    setBookings(prev => prev.map(b => b.id === 'B4' ? { ...b, status: 'Cancelled' } : b));
    setTimeout(() => refreshMetrics(), 1000);

    // Fade in AI Analysis breakdown
    setCallSummary({
      duration: "42 seconds",
      sentiment: "Friendly / Helpful",
      confidence: 94,
      extracted: {
        prospect: "Sarah Smith",
        intent: "Cancel Reservation",
        targetId: "B4 (Hot Desk)",
        refunded: true
      },
      tasks: [
        "Refund processed successfully (B4)",
        "CRM reservation logs updated (Sarah Smith - Cancelled)",
        "SMS transaction summary dispatch completed"
      ]
    });

    if (globalAddToast) {
      globalAddToast("Voice call resolved", "Sarah Smith refunded via Voice AI.", "success");
    }
  };

  return (
    <div className="main-content">
      {/* Background orbs */}
      <div className="bg-orb orb-purple"></div>
      <div className="bg-orb orb-blue"></div>

      <div className="page-header">
        <h1 className="page-title">Voice AI Simulation</h1>
        <p className="page-subtitle">Simulate real-time cognitive telephone interfaces handling active customer operations.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1.8fr', gap: '28px' }} className="dashboard-charts-row">
        {/* Left Side: Call Controller */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
          <div className="glass-panel" style={{ textAlign: 'center', padding: '36px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'white' }}>Call Engine Controls</h2>
            
            {callState === 'idle' && (
              <>
                <div style={{ width: '100px', height: '100px', borderRadius: '50%', background: 'rgba(255,255,255,0.02)', border: '1px dashed var(--border)', display: 'flex', alignItems: 'center', justifySelf: 'center', justifyContent: 'center' }}>
                  <Phone size={36} color="var(--text-dim)" />
                </div>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-dim)' }}>Click start to execute a real-time synthetic customer cancellation query.</p>
                <button 
                  onClick={triggerCallSimulation}
                  style={{ background: 'linear-gradient(135deg, var(--primary), var(--accent))', border: 'none', color: 'white', padding: '14px 28px', borderRadius: '12px', fontWeight: 800, width: '100%', cursor: 'pointer', boxShadow: '0 6px 20px var(--primary-glow)' }}
                >
                  Simulate Customer Call
                </button>
              </>
            )}

            {callState === 'connecting' && (
              <>
                <motion.div 
                  animate={{ scale: [1, 1.15, 1] }} 
                  transition={{ repeat: Infinity, duration: 1.5 }}
                  style={{ width: '100px', height: '100px', borderRadius: '50%', background: 'rgba(139,92,246,0.15)', border: '1px solid var(--accent)', display: 'flex', alignItems: 'center', justifySelf: 'center', justifyContent: 'center', boxShadow: '0 0 20px var(--accent-glow)' }}
                >
                  <PhoneCall size={36} color="var(--accent)" />
                </motion.div>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: 700 }}>Routing cognitive line...</p>
                <button disabled style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', color: 'var(--text-dim)', padding: '14px 28px', borderRadius: '12px', fontWeight: 800, width: '100%' }}>
                  Connecting...
                </button>
              </>
            )}

            {callState === 'active' && (
              <>
                <motion.div 
                  animate={{ boxShadow: ['0 0 10px rgba(6,182,212,0.4)', '0 0 30px rgba(6,182,212,0.8)', '0 0 10px rgba(6,182,212,0.4)'] }} 
                  transition={{ repeat: Infinity, duration: 1.8 }}
                  style={{ width: '100px', height: '100px', borderRadius: '50%', background: 'rgba(6,182,212,0.15)', border: '2px solid var(--ai-core)', display: 'flex', alignItems: 'center', justifySelf: 'center', justifyContent: 'center' }}
                >
                  <Volume2 size={36} color="var(--ai-core)" />
                </motion.div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <p style={{ fontSize: '0.95rem', color: 'var(--success)', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center' }}>
                    <span className="pulsing-dot"></span> LIVE IN CALL
                  </p>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>Simulating Sarah Smith (B4 Ticket)</span>
                </div>

                {/* Animated Waveform Graph */}
                <div className="waveform-container" style={{ margin: '10px 0' }}>
                  <div className="waveform-bar"></div>
                  <div className="waveform-bar"></div>
                  <div className="waveform-bar"></div>
                  <div className="waveform-bar"></div>
                  <div className="waveform-bar"></div>
                  <div className="waveform-bar"></div>
                  <div className="waveform-bar"></div>
                  <div className="waveform-bar"></div>
                  <div className="waveform-bar"></div>
                  <div className="waveform-bar"></div>
                </div>

                <button 
                  onClick={() => setCallState("ended")}
                  style={{ background: 'var(--alert)', border: 'none', color: 'white', padding: '14px 28px', borderRadius: '12px', fontWeight: 800, width: '100%', cursor: 'pointer', boxShadow: '0 6px 20px var(--alert-glow)' }}
                >
                  Disconnect Line
                </button>
              </>
            )}

            {callState === 'ended' && (
              <>
                <div style={{ width: '100px', height: '100px', borderRadius: '50%', background: 'rgba(244,63,94,0.08)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifySelf: 'center', justifyContent: 'center' }}>
                  <Phone size={36} color="var(--alert)" />
                </div>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-dim)' }}>Call completed successfully. AI analysis dispatched.</p>
                <button 
                  onClick={triggerCallSimulation}
                  style={{ background: 'linear-gradient(135deg, var(--primary), var(--accent))', border: 'none', color: 'white', padding: '14px 28px', borderRadius: '12px', fontWeight: 800, width: '100%', cursor: 'pointer', boxShadow: '0 6px 20px var(--primary-glow)' }}
                >
                  Simulate Again
                </button>
              </>
            )}
          </div>
        </div>

        {/* Right Side: Dialogue transcript scrolling & AI analytics */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
          <div className="glass-panel" style={{ height: '340px', display: 'flex', flexDirection: 'column' }}>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '16px', color: 'white', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '10px' }}>
              Real-Time Transcription Stream
            </h2>
            
            <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '14px', paddingRight: '4px' }}>
              {transcript.map((line, idx) => (
                <motion.div 
                  key={idx} 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  style={{ 
                    padding: '12px 16px', 
                    borderRadius: '12px', 
                    background: line.speaker.includes('Agent') ? 'rgba(6,182,212,0.06)' : 'rgba(255,255,255,0.02)',
                    borderLeft: `3px solid ${line.speaker.includes('Agent') ? 'var(--ai-core)' : 'var(--text-muted)'}`
                  }}
                >
                  <span style={{ fontWeight: 800, fontSize: '0.75rem', display: 'block', color: line.speaker.includes('Agent') ? 'var(--ai-core)' : 'var(--text-muted)', marginBottom: '4px' }}>
                    {line.speaker}
                  </span>
                  <p style={{ fontSize: '0.85rem', color: 'white', margin: 0, lineHeight: 1.5 }}>{line.text}</p>
                </motion.div>
              ))}

              {typewriterText && (
                <div style={{ 
                  padding: '12px 16px', 
                  borderRadius: '12px', 
                  background: 'rgba(255,255,255,0.01)',
                  borderLeft: '3px solid rgba(255,255,255,0.1)'
                }}>
                  <span style={{ fontWeight: 800, fontSize: '0.75rem', display: 'block', color: 'var(--text-dim)', marginBottom: '4px' }}>
                    Typewriting Transcripts...
                  </span>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-dim)', margin: 0, lineHeight: 1.5 }}>{typewriterText}</p>
                </div>
              )}

              {callState === 'idle' && (
                <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-dim)', fontSize: '0.85rem' }}>
                  Awaiting phone call triggers to compile real-time voice transcripts.
                </div>
              )}
            </div>
          </div>

          {/* Post-Call Analytical breakdown */}
          <AnimatePresence>
            {callSummary && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="glass-panel"
                style={{ borderColor: 'var(--ai-core)' }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '10px' }}>
                  <h2 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'white', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Sparkles size={16} color="var(--ai-core)" /> AI Dialogue Analysis Panel
                  </h2>
                  <span className="confidence-badge">{callSummary.confidence}% Match Confidence</span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '16px' }} className="metrics-grid">
                  <div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', display: 'block', fontWeight: 600 }}>CALL METRICS</span>
                    <div style={{ marginTop: '8px', fontSize: '0.85rem', color: 'white', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <div>⏱️ **Duration**: {callSummary.duration}</div>
                      <div>😊 **Calculated Sentiment**: {callSummary.sentiment}</div>
                    </div>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', display: 'block', fontWeight: 600 }}>EXTRACTED INTENT DATA</span>
                    <div style={{ marginTop: '8px', fontSize: '0.85rem', color: 'white', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <div>👤 **Prospect**: {callSummary.extracted.prospect}</div>
                      <div>🎯 **Intent**: {callSummary.extracted.intent}</div>
                      <div>🏢 **Target**: {callSummary.extracted.targetId}</div>
                    </div>
                  </div>
                </div>

                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', display: 'block', fontWeight: 600, marginBottom: '8px' }}>AUTOMATED FOLLOW-UP ACTIONS</span>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {callSummary.tasks.map((task, idx) => (
                      <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.82rem', color: '#cbd5e1' }}>
                        <CheckCircle size={14} color="var(--success)" />
                        <span>{task}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

function AutomationRules() {
  const [rules, setRules] = useState([
    { id: 1, name: "WhatsApp Welcome Auto-Reply Trigger", active: true },
    { id: 2, name: "AI Intent Extraction Pipeline", active: true },
    { id: 3, name: "Automated Lead Scoring", active: true },
    { id: 4, name: "Interactive pricing & promo upsells", active: true },
    { id: 5, name: "Knowledge base FAQ responder", active: true },
    { id: 6, name: "Auto confirmation confirmations", active: false }
  ]);

  const toggleRule = (id) => {
    setRules(rules.map(r => r.id === id ? { ...r, active: !r.active } : r));
    if (globalAddToast) {
      const activeRule = rules.find(r => r.id === id);
      globalAddToast("Workflow Update", `Toggled rule: "${activeRule.name}"`, "success");
    }
  };

  return (
    <div className="main-content">
      {/* Background orb */}
      <div className="bg-orb orb-purple"></div>

      <div className="page-header">
        <h1 className="page-title">Automation Workflows</h1>
        <p className="page-subtitle">Fine-tune automated triggers, cognitive weights, and visual defect settings.</p>
      </div>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1.8fr', gap: '28px' }} className="dashboard-charts-row">
        <div className="glass-panel">
          <h2 style={{ marginBottom: '24px', fontSize: '1.2rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px', color: 'white' }}>
            <Cpu size={18} color="var(--primary)" /> Cognitive Parameters
          </h2>
          
          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-muted)', fontSize: '0.9rem', fontWeight: 700 }}>LLM Conversational Foundation</label>
            <select style={{ width: '100%', padding: '12px', background: '#10071c', border: '1px solid var(--border)', color: 'white', borderRadius: '10px', outline: 'none', fontWeight: 600 }}>
              <option>GradSkills Enterprise Model (0.01s Latency)</option>
              <option>GPT-4o (High Latency API)</option>
              <option>Claude 3.5 Sonnet</option>
            </select>
          </div>

          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-muted)', fontSize: '0.9rem', fontWeight: 700 }}>Computer Vision Layer (Defect Audits)</label>
            <select style={{ width: '100%', padding: '12px', background: '#10071c', border: '1px solid var(--border)', color: 'white', borderRadius: '10px', outline: 'none', fontWeight: 600 }}>
              <option>YOLOv8 fine-tuned (Metallurgical Surfaces)</option>
              <option>ResNet-101 (Standard Weights)</option>
            </select>
          </div>

          <div style={{ marginBottom: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', color: 'var(--text-muted)', fontSize: '0.9rem', fontWeight: 700 }}>
              <span>Confidence Threshold Filters</span>
              <span style={{ color: 'var(--primary)', fontWeight: 'bold' }}>94% Match</span>
            </div>
            <input type="range" min="80" max="99" defaultValue="94" style={{ width: '100%', accentColor: 'var(--primary)' }} />
            <div style={{ fontSize: '0.78rem', color: 'var(--text-dim)', marginTop: '6px' }}>Scoring yields below this threshold require manual review.</div>
          </div>
          
          <button 
            onClick={() => {
              if (globalAddToast) globalAddToast("Engine Updated", "Cognitive threshold settings synchronized.", "success");
            }} 
            style={{ width: '100%', background: 'rgba(217, 70, 239, 0.1)', border: '1px solid rgba(217, 70, 239, 0.4)', color: '#e879f9', padding: '12px', borderRadius: '10px', cursor: 'pointer', fontWeight: 800 }}
          >
            Save Hyper-Parameters
          </button>
        </div>

        <div className="glass-panel">
          <h2 style={{ marginBottom: '24px', fontSize: '1.2rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px', color: 'white' }}>
            <Settings2 size={18} color="var(--success)" /> Active Event Rules
          </h2>
          {rules.map(rule => (
            <div key={rule.id} className="rule-card">
              <span style={{ fontWeight: 700, color: 'white', fontSize: '0.92rem' }}>{rule.name}</span>
              <div className={`toggle-switch ${rule.active ? 'active' : ''}`} onClick={() => toggleRule(rule.id)}>
                <div className="toggle-knob"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function DefectAnalytics() {
  const [data, setData] = useState(null);
  const [isAuto, setIsAuto] = useState(true);

  useEffect(() => {
    fetch(`${API_BASE}/defects/metrics`)
      .then(res => res.json())
      .then(d => setData(d))
      .catch(() => {
        // Offline Fallback Mock data
        setData({
          latency_ms: 12,
          throughput_fps: 60,
          false_positive_rate: "< 0.5%",
          total_defects_today: 142,
          hourly_data: [
            {time: "08:00", defects: 12},
            {time: "09:00", defects: 8},
            {time: "10:00", defects: 15},
            {time: "11:00", defects: 5},
            {time: "12:00", defects: 22},
            {time: "13:00", defects: 14},
            {time: "14:00", defects: 19}
          ]
        });
      });
  }, []);

  if (!data) return <div className="main-content">Loading quality indices...</div>;

  return (
    <div className="main-content">
      {/* Background orb */}
      <div className="bg-orb orb-blue"></div>

      <div className="page-header">
        <h1 className="page-title">Defect Analytics</h1>
        <p className="page-subtitle">Real-time edge computer vision monitoring hot-rolled steel surface configurations.</p>
      </div>
      
      <div className="metrics-grid">
        <div className="glass-panel metric-card" style={{ borderLeft: '4px solid var(--warning)' }}>
          <div className="metric-header">Edge Node Latency <Zap size={16} color="var(--warning)" /></div>
          <div className="metric-value" style={{ color: 'var(--warning)' }}>{data.latency_ms} ms</div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>Inference speed (RTX 4090)</div>
        </div>
        <div className="glass-panel metric-card" style={{ borderLeft: '4px solid var(--success)' }}>
          <div className="metric-header">Throughput Rate <Activity size={16} color="var(--success)" /></div>
          <div className="metric-value" style={{ color: 'var(--success)' }}>{data.throughput_fps} FPS</div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>Continuous frames calculated</div>
        </div>
        <div className="glass-panel metric-card" style={{ borderLeft: '4px solid var(--ai-core)' }}>
          <div className="metric-header">False Positive Yield <ShieldCheck size={16} color="var(--ai-core)" /></div>
          <div className="metric-value" style={{ color: 'var(--ai-core)' }}>{data.false_positive_rate}</div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>Model confidence match rate</div>
        </div>
        <div className="glass-panel metric-card" style={{ borderLeft: '4px solid var(--alert)' }}>
          <div className="metric-header">Total Defects Cataloged <Target size={16} color="var(--alert)" /></div>
          <div className="metric-value" style={{ color: 'var(--alert)' }}>{data.total_defects_today}</div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>Detected during daily runs</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '28px', marginTop: '28px' }} className="dashboard-charts-row">
        <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px', alignItems: 'center' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'white' }}>Live Camera Node (Cam-04)</h2>
            <div className="live-indicator"><div className="pulsing-dot red"></div> Live Edge Feed</div>
          </div>
          <div className="camera-feed-placeholder">
            <div className="scanning-line"></div>
            <div className="bounding-box">
              <span className="defect-label">Edge anomaly detected (98.2% confidence)</span>
            </div>
            <div className="feed-overlay-text">Surface Node: Hot Rolled Coils Line A</div>
          </div>
        </div>

        <div className="glass-panel">
          <h2 style={{ marginBottom: '20px', fontSize: '1.25rem', fontWeight: 800, color: 'white' }}>Hourly Defect Velocity</h2>
          <div style={{ height: 250 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.hourly_data} margin={{ top: 10, right: 20, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorDefects" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--alert)" stopOpacity={0.25}/>
                    <stop offset="95%" stopColor="var(--alert)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
                <XAxis dataKey="time" stroke="var(--text-dim)" style={{ fontSize: '0.75rem' }} />
                <YAxis stroke="var(--text-dim)" style={{ fontSize: '0.75rem' }} />
                <Tooltip contentStyle={{ background: 'rgba(12, 6, 22, 0.95)', border: '1px solid var(--primary)', borderRadius: '12px' }} />
                <Area type="monotone" dataKey="defects" stroke="var(--alert)" fillOpacity={1} fill="url(#colorDefects)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '28px', marginTop: '28px' }} className="dashboard-charts-row">
        <div className="glass-panel">
          <h2 style={{ marginBottom: '20px', fontSize: '1.2rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px', color: 'white' }}><Cpu size={18}/> Local Server Hardware</h2>
          
          <div style={{ marginBottom: '18px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '4px', fontWeight: 700 }}>
              <span>GPU Utilization (RTX 4090)</span>
              <span style={{ color: 'var(--alert)' }}>85.4%</span>
            </div>
            <div className="score-bar-bg"><div className="score-bar-fill" style={{ width: '85%', background: 'var(--alert)' }}></div></div>
          </div>
          
          <div style={{ marginBottom: '18px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '4px', fontWeight: 700 }}>
              <span>Active VRAM (24GB)</span>
              <span style={{ color: 'var(--warning)' }}>18.2 GB</span>
            </div>
            <div className="score-bar-bg"><div className="score-bar-fill" style={{ width: '75%', background: 'var(--warning)' }}></div></div>
          </div>
          
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '4px', fontWeight: 700 }}>
              <span>TensorRT Logic Engine</span>
              <span style={{ color: 'var(--success)' }}>Optimal</span>
            </div>
            <div className="score-bar-bg"><div className="score-bar-fill" style={{ width: '100%', background: 'var(--success)' }}></div></div>
          </div>
        </div>

        <div className="glass-panel">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'white', margin: 0 }}>Edge Anomaly Telemetry Log</h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: 'rgba(0,0,0,0.3)', padding: '6px 12px', borderRadius: '12px', border: '1px solid var(--border)' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 800 }}>ANALYSIS LOG:</span>
              <div style={{
                display: 'flex', alignItems: 'center', gap: '6px', 
                background: isAuto ? 'rgba(16, 185, 129, 0.12)' : 'rgba(244, 63, 94, 0.12)', 
                padding: '4px 10px', borderRadius: '8px', 
                color: isAuto ? 'var(--success)' : 'var(--alert)', 
                fontSize: '0.8rem', fontWeight: 800
              }}>
                <Power size={12}/> {isAuto ? 'AUTO AUDIT' : 'PAUSED'}
              </div>
              <div className={`toggle-switch ${isAuto ? 'active' : ''}`} onClick={() => {
                setIsAuto(!isAuto);
                if (globalAddToast) globalAddToast("System Sensor Mode", `Switched audit loop to ${!isAuto ? 'AUTO' : 'MANUAL'}`, "success");
              }}>
                 <div className="toggle-knob"></div>
              </div>
            </div>
          </div>
          <table className="crm-table">
            <thead>
              <tr>
                <th>Capture Time</th>
                <th>Sensor Location</th>
                <th>Anomaly Defect</th>
                <th>Confidence Index</th>
                <th>Priority Level</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={{ color: 'white', fontWeight: 600 }}>{new Date().toLocaleTimeString()}</td>
                <td>Coils Line A - Sensor 04</td>
                <td>Surface Micro-fissure</td>
                <td style={{ fontWeight: 700, color: 'var(--alert)' }}>98.2%</td>
                <td><span className="status-badge status-hot">Critical Alert</span></td>
              </tr>
              <tr>
                <td style={{ color: 'white', fontWeight: 600 }}>{new Date(Date.now() - 150000).toLocaleTimeString()}</td>
                <td>Coils Line A - Sensor 02</td>
                <td>Edge Structural Distortion</td>
                <td style={{ fontWeight: 700, color: 'var(--warning)' }}>94.5%</td>
                <td><span className="status-badge status-warm">Warning</span></td>
              </tr>
              <tr>
                <td style={{ color: 'white', fontWeight: 600 }}>{new Date(Date.now() - 480000).toLocaleTimeString()}</td>
                <td>Coils Line B - Sensor 01</td>
                <td>Thermal Anomaly Target</td>
                <td style={{ fontWeight: 700, color: 'var(--alert)' }}>89.1%</td>
                <td><span className="status-badge status-hot">Critical Alert</span></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// Floating AI Chatbot assistant modal overlay widget
function FloatingAIChatbot({ addNotification, addToast, refreshMetrics, addCrmLead, addBooking }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { id: 1, sender: "assistant", text: "Hello! I am your cognitive SaaS assistant. How can I help you automate workspace operations today?" }
  ]);
  const [input, setInput] = useState("");
  const [thinkingSteps, setThinkingSteps] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, thinkingSteps, isTyping]);

  const chatbotSuggestedPrompts = [
    { label: "💵 Simulate pricing inquiry", action: "demo_pricing" },
    { label: "📅 Simulate desk booking", action: "demo_booking" },
    { label: "🚨 Simulate customer escalation", action: "demo_escalate" }
  ];

  const triggerChatbotDemo = async (actionType) => {
    setIsTyping(true);
    setThinkingSteps([]);

    if (actionType === "demo_pricing") {
      setMessages(prev => [...prev, { id: Date.now(), sender: "user", text: "Hi, how much do dedicated seats cost?" }]);
      
      const steps = [
        "Analyzing prompt semantics...",
        "Searching workspace seat inventories...",
        "Compiling price brochure..."
      ];
      for(let s of steps) {
        setThinkingSteps(prev => [...prev, s]);
        await new Promise(r => setTimeout(r, 700));
      }
      setThinkingSteps([]);
      setIsTyping(false);

      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        sender: "assistant",
        text: "🏢 Dedicated seats are priced at **$150/month**, offering 24/7 access, super-fast 5G WiFi, and free high-quality coffee!\n\n🎁 **Promo Alert**: I can apply an exclusive **20% discount** right now. Would you like to finalize a booking?",
        confidence: 96
      }]);

      // Automatically register lead in CRM!
      addCrmLead({
        id: "L" + (Date.now()),
        name: "Alex Designs",
        channel: "instagram",
        contact: "@alex_designs",
        status: "Warm",
        score: 87
      });
      addNotification("New CRM Lead registered", "Alex Designs (via Instagram) marked Hot Prospect (87% confidence match).", "lead", 87);
      addToast("AI Auto Lead Sync", "Prospect Alex Designs registered in CRM", "success");
      setTimeout(() => refreshMetrics(), 1000);

    } else if (actionType === "demo_booking") {
      setMessages(prev => [...prev, { id: Date.now(), sender: "user", text: "Perfect! Can I book a dedicated seat for tomorrow?" }]);
      
      const steps = [
        "Consulting workspace desk database...",
        "Authorizing reservation seat slot...",
        "Syncing bookings calendar..."
      ];
      for(let s of steps) {
        setThinkingSteps(prev => [...prev, s]);
        await new Promise(r => setTimeout(r, 700));
      }
      setThinkingSteps([]);
      setIsTyping(false);

      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        sender: "assistant",
        text: "✓ Done! I've secured a **Dedicated Seat** tomorrow starting 9 AM. I synchronized this under **Alex Designs** ($150 value) and placed it in the Bookings table.",
        confidence: 98
      }]);

      // Auto update bookings database in CRM!
      addBooking({
        id: "B" + (Date.now()),
        leadName: "Alex Designs",
        date: "Tomorrow, 09:00 AM",
        type: "Dedicated Seat",
        status: "Confirmed",
        revenue: 150
      });
      addNotification("Workspace Booking Finalized", "B5 ticket provisioned for Alex Designs ($150)", "booking", 98);
      addToast("AI Booking Confirmed", "Dedicated seat reservation created successfully", "success");
      setTimeout(() => refreshMetrics(), 1000);

    } else if (actionType === "demo_escalate") {
      setMessages(prev => [...prev, { id: Date.now(), sender: "user", text: "This is unacceptable! The WiFi is down and I am losing customer accounts!" }]);
      
      const steps = [
        "Detecting extreme negative customer sentiment...",
        "Identifying workspace connection issues...",
        "Dispatching alert to Senior Supervisor..."
      ];
      for(let s of steps) {
        setThinkingSteps(prev => [...prev, s]);
        await new Promise(r => setTimeout(r, 700));
      }
      setThinkingSteps([]);
      setIsTyping(false);

      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        sender: "assistant",
        text: "🚨 I am deeply sorry for this. I've flagged this session as HIGH URGENCY and alerted our Senior Supervisor. They are joining this thread immediately to resolve your connection.",
        confidence: 94
      }]);

      addNotification("Supervisor Escalation Alert", "Admin alert: Inbound ticket escalated to manager immediately.", "system", 94);
      addToast("🚨 Priority Escalation", "Support agent assigned to active chat session", "alert");
      setTimeout(() => refreshMetrics(), 1000);
    }
  };

  const handleSmartPanelAction = async (actionType) => {
    setIsTyping(true);
    setThinkingSteps([]);

    if (actionType === "optimize_workflow") {
      const steps = [
        "Analyzing latency overhead metrics...",
        "Compiling TensorRT hardware weights...",
        "Throttling cognitive response times..."
      ];
      for(let s of steps) {
        setThinkingSteps(prev => [...prev, s]);
        await new Promise(r => setTimeout(r, 600));
      }
      setThinkingSteps([]);
      setIsTyping(false);
      
      setMessages(prev => [...prev, {
        id: Date.now(),
        sender: "assistant",
        text: "⚡ **AI Workflow Optimization Applied**:\n- Edge node hardware latencies throttled down from **12ms** to **8.2ms**.\n- YOLOv8 frame throughput adjusted successfully.\n- Supabase caching indices optimized.",
        confidence: 99
      }]);
      addNotification("Sensor Latency Throttled", "AI Optimizer lowered Cam-04 edge node delays to 8.2ms.", "system", 99);
      addToast("⚡ Edge Node Throttled", "Workflow optimized. Latency reduced to 8.2ms.", "success");
      setTimeout(() => refreshMetrics(), 1000);

    } else if (actionType === "check_leads") {
      const steps = [
        "Scanning pipeline prospects list...",
        "Recalculating conversion matrices...",
        "Auditing intent resolved signals..."
      ];
      for(let s of steps) {
        setThinkingSteps(prev => [...prev, s]);
        await new Promise(r => setTimeout(r, 600));
      }
      setThinkingSteps([]);
      setIsTyping(false);

      setMessages(prev => [...prev, {
        id: Date.now(),
        sender: "assistant",
        text: "🔍 **Lead Quality DB Sweep complete**:\n- Marcus Kelly verified at **85% Hot Match**.\n- Sarah Jennings (Instagram) registered Warm (54%).\n- Simulated inquirers converted successfully.",
        confidence: 95
      }]);
      addToast("✓ Pipeline Sweep Complete", "Audited crm prospects. Intent match rates: 94.2%.", "success");

    } else if (actionType === "gen_summary") {
      const steps = [
        "Retrieving platform state trees...",
        "Synthesizing operations database...",
        "Compiling summary highlights..."
      ];
      for(let s of steps) {
        setThinkingSteps(prev => [...prev, s]);
        await new Promise(r => setTimeout(r, 600));
      }
      setThinkingSteps([]);
      setIsTyping(false);

      setMessages(prev => [...prev, {
        id: Date.now(),
        sender: "assistant",
        text: "📊 **Enterprise Status Highlight**:\n- **Weekly Yield**: $660 Confirmed\n- **Live Connections**: WhatsApp, IG & Voice Online\n- **Edge Camera**: Continuous metal defect scans\n- **Conversion Index**: 50% optimal",
        confidence: 97
      }]);
      addToast("📊 summary Compiled", "Operations details drafted inside assistant console.", "success");
    }
  };

  const handleSend = async () => {
    if (!input.trim()) return;
    const text = input;
    setInput("");

    setMessages(prev => [...prev, { id: Date.now(), sender: "user", text }]);
    setIsTyping(true);

    const steps = [
      "Analyzing semantic parameters...",
      "Generating contextual response..."
    ];
    for(let s of steps) {
      setThinkingSteps(prev => [...prev, s]);
      await new Promise(r => setTimeout(r, 600));
    }
    setThinkingSteps([]);
    setIsTyping(false);

    let reply = "I am processing your query. Could you specify which workspace package you want?";
    if (text.toLowerCase().includes("pricing")) {
      reply = "Our seat packages are: Hot Desk ($10/day), Dedicated Seat ($150/mo), and Private Office ($500/mo).";
    }

    setMessages(prev => [...prev, {
      id: Date.now() + 1,
      sender: "assistant",
      text: reply,
      confidence: 88
    }]);
  };

  return (
    <>
      {/* Floating Circle Button with breathing animation */}
      <motion.div 
        animate={{ y: [0, -8, 0] }}
        transition={{ repeat: Infinity, duration: 3.5, ease: "easeInOut" }}
        whileHover={{ scale: 1.1, rotate: 5 }}
        className="chatbot-bubble" 
        onClick={() => setIsOpen(!isOpen)}
        style={{
          boxShadow: '0 0 25px var(--primary-glow), 0 8px 30px rgba(0,0,0,0.5)',
          border: '1px solid rgba(255,255,255,0.2)'
        }}
      >
        <Bot size={26} color="white" />
      </motion.div>

      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            transition={{ type: 'spring', damping: 22, stiffness: 130 }}
            className="chatbot-window-modal"
            style={{
              borderColor: 'var(--primary)',
              boxShadow: '0 20px 50px rgba(0,0,0,0.7), 0 0 30px var(--primary-glow)'
            }}
          >
            <div className="chatbot-header">
              <div className="chatbot-title">
                <div className="pulse-glow" style={{ background: 'var(--primary)', boxShadow: '0 0 10px var(--primary)' }}></div>
                <div>
                  <div style={{ color: 'white', fontWeight: 800, fontSize: '0.95rem' }}>Cognitive Agent Matrix</div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)', fontWeight: 700, letterSpacing: '0.04em' }}>
                    🤖 ONLINE • 4 MODELS READY
                  </div>
                </div>
              </div>
              <button onClick={() => setIsOpen(false)} style={{ background: 'none', border: 'none', color: 'var(--text-dim)', cursor: 'pointer' }}>
                <X size={18} />
              </button>
            </div>

            {/* Quick operations control panel */}
            <div style={{
              background: 'rgba(139, 92, 246, 0.04)',
              borderBottom: '1px solid var(--border)',
              padding: '12px 20px',
              display: 'flex',
              justifyContent: 'space-around',
              gap: '8px'
            }}>
              <button 
                onClick={() => handleSmartPanelAction("optimize_workflow")}
                style={{ background: 'none', border: 'none', color: 'var(--ai-core)', fontSize: '0.75rem', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
              >
                ⚡ Optimize
              </button>
              <button 
                onClick={() => handleSmartPanelAction("check_leads")}
                style={{ background: 'none', border: 'none', color: 'var(--warning)', fontSize: '0.75rem', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
              >
                🔍 Audit Leads
              </button>
              <button 
                onClick={() => handleSmartPanelAction("gen_summary")}
                style={{ background: 'none', border: 'none', color: 'var(--primary)', fontSize: '0.75rem', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
              >
                📊 Summary
              </button>
            </div>

            {/* Chat Messages */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {messages.map(m => (
                <div key={m.id} style={{ display: 'flex', gap: '10px', flexDirection: m.sender === 'user' ? 'row-reverse' : 'row' }}>
                  <div style={{
                    width: '30px',
                    height: '30px',
                    borderRadius: '50%',
                    background: m.sender === 'assistant' ? 'linear-gradient(135deg, var(--primary), var(--accent))' : '#2e1065',
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 'bold',
                    fontSize: '0.8rem',
                    flexShrink: 0
                  }}>
                    {m.sender === 'assistant' ? <Bot size={14} /> : 'U'}
                  </div>
                  <div style={{
                    maxWidth: '75%',
                    background: m.sender === 'assistant' ? 'rgba(255,255,255,0.04)' : 'var(--primary)',
                    border: m.sender === 'assistant' ? '1px solid var(--border)' : 'none',
                    color: 'white',
                    padding: '10px 14px',
                    borderRadius: '12px',
                    fontSize: '0.85rem',
                    lineHeight: 1.4,
                    whiteSpace: 'pre-line',
                    boxShadow: '0 4px 10px rgba(0,0,0,0.2)'
                  }}>
                    {m.confidence && (
                      <div style={{ fontSize: '0.68rem', color: '#22d3ee', fontWeight: 800, marginBottom: '4px' }}>
                        🤖 {m.confidence}% Intent Conf.
                      </div>
                    )}
                    {m.text}
                  </div>
                </div>
              ))}

              {/* Thinking steps */}
              {thinkingSteps.length > 0 && (
                <div style={{ display: 'flex', gap: '10px' }}>
                  <div style={{ width: '30px', height: '30px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--primary), var(--accent))', color: 'white', display: 'flex', alignItems: 'center', justifyContext: 'center', flexShrink: 0 }}>
                    <Bot size={14} />
                  </div>
                  <div className="thinking-steps-panel" style={{ flex: 1, margin: 0 }}>
                    {thinkingSteps.map((step, idx) => (
                      <div key={idx} className="thinking-step" style={{ fontSize: '0.75rem' }}>
                        {idx === thinkingSteps.length - 1 ? <div className="thinking-spinner"></div> : <CheckCircle size={8} color="var(--ai-core)" />}
                        <span>{step}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {isTyping && thinkingSteps.length === 0 && (
                <div style={{ display: 'flex', gap: '10px' }}>
                  <div style={{ width: '30px', height: '30px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--primary), var(--accent))', color: 'white', display: 'flex', alignItems: 'center', justifyContext: 'center', flexShrink: 0 }} />
                  <div className="typing-indicator">
                    <div className="typing-dot"></div>
                    <div className="typing-dot"></div>
                    <div className="typing-dot"></div>
                  </div>
                </div>
              )}

              <div ref={scrollRef} />
            </div>

            {/* Simulated Demo Scenario Buttons */}
            <div style={{ padding: '0 16px 10px 16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 800, letterSpacing: '0.04em' }}>JUDGE DEMO PLAYBACKS</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {chatbotSuggestedPrompts.map((p, idx) => (
                  <button 
                    key={idx} 
                    onClick={() => triggerChatbotDemo(p.action)}
                    style={{ 
                      background: 'rgba(217, 70, 239, 0.08)', 
                      border: '1px solid rgba(217, 70, 239, 0.3)', 
                      color: 'var(--text-main)', 
                      borderRadius: '14px', 
                      padding: '4px 10px', 
                      fontSize: '0.75rem', 
                      cursor: 'pointer',
                      fontWeight: 700,
                      transition: 'all 0.2s'
                    }}
                    className="demo-btn-glow"
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Input field */}
            <div style={{ padding: '16px', borderTop: '1px solid var(--border)', background: 'rgba(10,4,18,0.5)' }}>
              <div style={{ display: 'flex', gap: '10px' }}>
                <input 
                  type="text" 
                  placeholder="Ask a custom question..."
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSend()}
                  style={{ flex: 1, background: 'rgba(0,0,0,0.4)', border: '1px solid var(--border)', padding: '10px 14px', borderRadius: '10px', color: 'white', outline: 'none', fontSize: '0.82rem' }}
                />
                <button 
                  onClick={handleSend}
                  style={{ background: 'linear-gradient(135deg, var(--primary), var(--accent))', border: 'none', color: 'white', width: '38px', height: '38px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                >
                  <Send size={14} />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function PageWrapper({ children }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      style={{ width: '100%', minHeight: '100%', display: 'flex', flexDirection: 'column' }}
    >
      {children}
    </motion.div>
  );
}

function AppContent() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [toasts, setToasts] = useState([]);
  const [demoMode, setDemoMode] = useState(false);
  const [alerts, setAlerts] = useState([
    { id: 1, type: 'booking', title: 'Booking Confirmed', description: 'Sarah Jennings booked Hot Desk (Line B)', time: '2 mins ago', confidence: 96 },
    { id: 2, type: 'lead', title: 'New CRM Lead Captured', description: 'Alex Designs registered dynamically via Instagram.', time: '12 mins ago', confidence: 87 },
    { id: 3, type: 'system', title: 'Defect Sensor Alert', description: 'Cam-04 edge detector flagged critical fissure', time: '1 hour ago', confidence: 98 }
  ]);
  const [metrics, setMetrics] = useState({
    total_messages: 5,
    total_leads: 2,
    total_bookings: 3,
    active_automations: 4,
    conversion_rate: 50.0,
    roi_savings: "4500",
    intents: { booking: 15, pricing: 24, support: 8, greeting: 30 }
  });
  const [crmLeads, setCrmLeads] = useState([]);
  const [crmBookings, setCrmBookings] = useState([]);
  const [inboxMessages, setInboxMessages] = useState([]);

  const addToast = (title, description, type = "success") => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, title, description, type }]);
    setTimeout(() => {
      removeToast(id);
    }, 4000);
  };
  globalAddToast = addToast;

  const removeToast = (id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const addNotification = (title, description, type = "system", confidence = 94) => {
    const act = {
      id: Date.now(),
      type,
      title,
      description,
      time: 'Just now',
      confidence
    };
    setAlerts(prev => [act, ...prev]);
  };

  const fetchMetrics = () => {
    fetch(`${API_BASE}/dashboard/metrics`)
      .then(res => res.json())
      .then(data => setMetrics(data))
      .catch(() => {
        // Fallback calculations for offline-resilience
        const confirmedBookings = crmBookings.filter(b => b.status === 'Confirmed');
        
        setMetrics(prev => ({
          ...prev,
          total_messages: inboxMessages.length + 5,
          total_leads: crmLeads.length + 2,
          total_bookings: crmBookings.length + 4,
          roi_savings: (confirmedBookings.length * 1500 + 4500).toString()
        }));
      });
  };

  // Continuous Simulated Activity Scheduler (adjusts speed on demoMode)
  useEffect(() => {
    const listSimActivity = [
      { title: "WhatsApp Inquiry Sent", description: "Pricing discount offered to @marcus_k", type: "system", conf: 92 },
      { title: "Defect Sensor Audit Complete", description: "GPU Audit finished scanning coil surfaces. Optimal health.", type: "system", conf: 98 },
      { title: "Lead Captured via WhatsApp", description: "Sarah Jennings (Match 87%) registered as prospect.", type: "lead", conf: 87 },
      { title: "Booking Finalized via AI", description: "B5 Ded. Seat booked successfully for Tech Corp.", type: "booking", conf: 96 }
    ];

    const delay = demoMode ? 6000 : 16000;
    const interval = setInterval(() => {
      const randomAct = listSimActivity[Math.floor(Math.random() * listSimActivity.length)];
      addNotification(randomAct.title, randomAct.description, randomAct.type, randomAct.conf);
      addToast(randomAct.title, randomAct.description, randomAct.type === 'system' ? 'primary' : 'success');
      
      // Sync or mock lead/booking addition in demo mode
      if (demoMode && randomAct.type === 'lead') {
        const mockName = ["Jennifer Vance", "Robert Downey", "Chris Evans", "Jessica Alba"][Math.floor(Math.random() * 4)];
        setCrmLeads(prev => [{
          id: "L" + Date.now(),
          name: mockName,
          channel: "whatsapp",
          contact: "+91 9988776655",
          status: "Hot",
          score: Math.floor(Math.random() * 15) + 84
        }, ...prev]);
      } else if (demoMode && randomAct.type === 'booking') {
        const mockName = ["Jennifer Vance", "Robert Downey", "Chris Evans", "Jessica Alba"][Math.floor(Math.random() * 4)];
        setCrmBookings(prev => [{
          id: "B" + Date.now(),
          leadName: mockName,
          date: "Tomorrow, 10:00 AM",
          type: "Dedicated Seat",
          status: "Confirmed",
          revenue: 150
        }, ...prev]);
      }

      fetchMetrics();
    }, delay);

    return () => clearInterval(interval);
  }, [crmBookings, crmLeads, inboxMessages, demoMode]);

  // Demo Mode metrics continuous fluctuation up
  useEffect(() => {
    if (!demoMode) return;
    const interval = setInterval(() => {
      setMetrics(prev => {
        const rawSavings = parseFloat(prev.roi_savings.replace(/,/g, ''));
        const newSavings = (rawSavings + Math.floor(Math.random() * 15) + 5).toString();
        const nextConversion = Math.min(98, Math.max(45, prev.conversion_rate + (Math.random() > 0.5 ? 0.3 : -0.3)));
        return {
          ...prev,
          total_messages: prev.total_messages + 1,
          roi_savings: newSavings,
          conversion_rate: parseFloat(nextConversion.toFixed(1))
        };
      });
    }, 4000);
    return () => clearInterval(interval);
  }, [demoMode]);

  useEffect(() => {
    // Initial fetch from backend APIs
    fetchMetrics();
    
    fetch(`${API_BASE}/crm/leads`)
      .then(res => res.json())
      .then(data => setCrmLeads(data.leads))
      .catch(() => {
        setCrmLeads([
          {id: "L1", name: "Marcus Kelly", channel: "whatsapp", contact: "+91 9876543210", status: "Hot", score: 85},
          {id: "L2", name: "Sarah Jennings", channel: "instagram", contact: "@alex_designs", status: "Warm", score: 54}
        ]);
      });

    fetch(`${API_BASE}/crm/bookings`)
      .then(res => res.json())
      .then(data => setCrmBookings(data.bookings))
      .catch(() => {
        setCrmBookings([
          {id: "B1", leadName: "Marcus Kelly", date: "Today, 10:00 AM", type: "Hot Desk", status: "Confirmed", revenue: 10},
          {id: "B2", leadName: "Sarah Jennings", date: "Tomorrow, 09:00 AM", type: "Dedicated Seat", status: "Pending", revenue: 150},
          {id: "B3", leadName: "Tech Startup Inc", date: "May 28, 08:00 AM", type: "Private Office", status: "Confirmed", revenue: 500},
          {id: "B4", leadName: "Sarah Smith", date: "Today, 02:00 PM", type: "Hot Desk", status: "Confirmed", revenue: 10}
        ]);
      });

    fetch(`${API_BASE}/inbox/messages`)
      .then(res => res.json())
      .then(data => setInboxMessages(data.messages))
      .catch(() => {
        setInboxMessages([
          {id: "1", channel: "whatsapp", sender: "Marcus Kelly", text: "Hi, I am looking for a hot desk for tomorrow.", timestamp: new Date(Date.now() - 3600000).toISOString(), direction: "inbound"},
          {id: "2", channel: "system", sender: "AI Bot", text: "Hello Marcus! We have hot desks available for tomorrow. Would you like me to book one?", timestamp: new Date(Date.now() - 3590000).toISOString(), direction: "outbound", confidence: 96}
        ]);
      });
  }, []);

  const clearAlerts = () => {
    setAlerts([]);
    addToast("Cleaned history Feed", "Cleared active operations alerts.", "success");
  };

  return (
    <div className="app-container">
      {/* Responsive dual-navigation */}
      <Sidebar 
        mobileOpen={mobileOpen} 
        setMobileOpen={setMobileOpen} 
        unreadCount={alerts.length} 
        liveActivity={alerts} 
      />

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
        <div style={{ padding: '24px 40px 0 40px' }} className="topbar-padding">
          <TopBar 
            setMobileOpen={setMobileOpen} 
            unreadCount={alerts.length} 
            alerts={alerts}
            clearAlerts={clearAlerts}
            demoMode={demoMode}
            setDemoMode={setDemoMode}
          />
        </div>

        {/* Global Flashing demo alert banner */}
        {demoMode && (
          <div style={{
            background: 'linear-gradient(90deg, var(--primary), var(--accent))',
            color: 'white',
            textAlign: 'center',
            padding: '6px 12px',
            fontSize: '0.78rem',
            fontWeight: 800,
            letterSpacing: '0.08em',
            boxShadow: '0 4px 15px var(--primary-glow)',
            textTransform: 'uppercase',
            zIndex: 35
          }}>
            ⚡ Hackathon live simulation mode active • Telemetry updating continuously ⚡
          </div>
        )}

        <div style={{ flex: 1, overflowY: 'auto' }}>
          <AnimatePresence mode="wait">
            <Routes>
              <Route path="/" element={<PageWrapper><Dashboard metrics={metrics} activeAlerts={alerts} refreshMetrics={fetchMetrics} /></PageWrapper>} />
              <Route path="/inbox" element={<PageWrapper><Inbox messages={inboxMessages} setMessages={setInboxMessages} refreshMetrics={fetchMetrics} /></PageWrapper>} />
              <Route path="/leads" element={<PageWrapper><CRMLeads leads={crmLeads} refreshMetrics={fetchMetrics} /></PageWrapper>} />
              <Route path="/bookings" element={<PageWrapper><CRMBookings bookings={crmBookings} setBookings={setCrmBookings} refreshMetrics={fetchMetrics} /></PageWrapper>} />
              <Route path="/voice-call" element={<PageWrapper><VoiceCallSimulator bookings={crmBookings} setBookings={setCrmBookings} refreshMetrics={fetchMetrics} /></PageWrapper>} />
              <Route path="/rules" element={<PageWrapper><AutomationRules /></PageWrapper>} />
              <Route path="/defect-analytics" element={<PageWrapper><DefectAnalytics /></PageWrapper>} />
            </Routes>
          </AnimatePresence>
        </div>
      </div>

      {/* Global Floating AI Chatbot overlay */}
      <FloatingAIChatbot 
        addNotification={addNotification} 
        addToast={addToast} 
        refreshMetrics={fetchMetrics}
        addCrmLead={(lead) => setCrmLeads(prev => [lead, ...prev])}
        addBooking={(booking) => setCrmBookings(prev => [booking, ...prev])}
      />

      {/* Floating Responsive Mobile Dock */}
      <div className="mobile-nav-dock">
        <Link to="/" className={`mobile-nav-dock-item mobile-nav-item ${useLocation().pathname === '/' ? 'active' : ''}`}>
          <LayoutDashboard size={20} />
          <span>Dash</span>
        </Link>
        <Link to="/inbox" className={`mobile-nav-dock-item mobile-nav-item ${useLocation().pathname === '/inbox' ? 'active' : ''}`}>
          <div style={{ position: 'relative' }}>
            <MessageSquare size={20} />
            {alerts.length > 0 && <div style={{ position: 'absolute', top: '-4px', right: '-4px', width: '8px', height: '8px', background: 'var(--alert)', borderRadius: '50%' }} />}
          </div>
          <span>Inbox</span>
        </Link>
        <Link to="/voice-call" className={`mobile-nav-dock-item mobile-nav-item ${useLocation().pathname === '/voice-call' ? 'active' : ''}`}>
          <Phone size={20} />
          <span>Voice AI</span>
        </Link>
        <Link to="/leads" className={`mobile-nav-dock-item mobile-nav-item ${useLocation().pathname === '/leads' ? 'active' : ''}`}>
          <Users size={20} />
          <span>CRM</span>
        </Link>
        <Link to="/defect-analytics" className={`mobile-nav-dock-item mobile-nav-item ${useLocation().pathname === '/defect-analytics' ? 'active' : ''}`}>
          <Activity size={20} />
          <span>Defects</span>
        </Link>
      </div>

      {/* Reusable Toast Notifications Overlay */}
      <GlobalToaster toasts={toasts} removeToast={removeToast} />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}
