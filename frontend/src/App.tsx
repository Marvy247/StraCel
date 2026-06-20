import { BrowserRouter, Link, Route, Routes, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { Toaster } from 'react-hot-toast';
import { WalletProvider, useWallet } from './context/WalletContext';
import Home from './pages/Home';
import PostBounty from './pages/PostBounty';
import BountyDetail from './pages/BountyDetail';
import MyBounties from './pages/MyBounties';

function Navigation() {
  const location = useLocation();
  const { address, connect, celoBalance, gdBalance } = useWallet();

  return (
    <nav className="fixed top-6 left-1/2 -translate-x-1/2 z-50 w-[95%] max-w-7xl">
      <div className="glass rounded-2xl px-6 py-4 border border-app-border shadow-floating flex items-center justify-between">
        <Link to="/" className="flex items-center group">
          <span className="font-serif font-bold text-2xl tracking-tighter text-text-main group-hover:text-accent-indigo transition-colors duration-300">
            <span className="italic">Task</span>y
          </span>
        </Link>

        <div className="hidden md:flex items-center gap-1">
          <Link to="/" className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
            location.pathname === '/' ? 'bg-accent-indigo text-white' : 'text-text-dim hover:text-accent-indigo'
          }`}>Browse</Link>
          <Link to="/post" className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
            location.pathname === '/post' ? 'bg-accent-indigo text-white' : 'text-text-dim hover:text-accent-indigo'
          }`}>Post</Link>
          <Link to="/my-bounties" className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
            location.pathname === '/my-bounties' ? 'bg-accent-indigo text-white' : 'text-text-dim hover:text-accent-indigo'
          }`}>My Bounties</Link>
        </div>

        <div className="flex items-center gap-3">
          {address ? (
            <>
              <div className="hidden sm:flex items-center gap-3 text-xs">
                <span className="text-text-dim">
                  <span className="font-mono font-medium text-accent-indigo">{celoBalance}</span> CELO
                </span>
                <span className="text-text-dim">
                  <span className="font-mono font-medium text-accent-emerald">{gdBalance}</span> G$
                </span>
              </div>
              <span className="text-xs font-mono text-text-pale bg-app-hover px-3 py-1.5 rounded-full">
                {address.slice(0, 6)}...{address.slice(-4)}
              </span>
            </>
          ) : (
            <button onClick={connect} className="btn-primary text-sm !px-5 !py-2.5">
              Connect
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}

function AnimatedRoutes() {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<Home />} />
        <Route path="/post" element={<PostBounty />} />
        <Route path="/bounty/:id" element={<BountyDetail />} />
        <Route path="/my-bounties" element={<MyBounties />} />
      </Routes>
    </AnimatePresence>
  );
}

function App() {
  return (
    <BrowserRouter>
      <WalletProvider>
        <Toaster position="top-right" toastOptions={{
          duration: 4000,
          style: { borderRadius: '12px', padding: '12px 16px', fontSize: '14px' },
        }} />
        <div className="min-h-screen bg-app-bg grid-subtle selection:bg-accent-indigo/10 selection:text-accent-indigo">
          <Navigation />
          <main className="relative">
            <AnimatedRoutes />
          </main>
          <footer className="border-t border-app-border py-12 px-6 bg-white">
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
              <span className="font-serif font-bold text-xl tracking-tighter text-text-main">
                <span className="italic">Task</span>y
              </span>
              <p className="text-xs text-text-pale">
                Decentralized bounties on Celo. Pay with CELO or G$.
              </p>
              <p className="text-xs text-text-pale">© 2026 Tasky</p>
            </div>
          </footer>
        </div>
      </WalletProvider>
    </BrowserRouter>
  );
}

export default App;
