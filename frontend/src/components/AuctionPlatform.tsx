import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Gavel,
  Clock,
  CreditCard,
  ShieldCheck,
  Users,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  DollarSign,
  Activity,
  RefreshCw,
} from 'lucide-react';
import { useAuction } from '../hooks/useAuction';
import { api } from '../lib/api';
import { formatCurrency, formatTime, formatTimestamp, getInitials } from '../utils/formatters';
import type { PaymentStatus, Bid } from '../types/auction';

// Demo user - in production, this would come from auth
const DEMO_USER = {
  id: 'user-demo-001',
  name: 'You',
};

const AUCTION_ID = 'auction-001';

export default function AuctionPlatform(): React.ReactElement {
  const {
    auctionState,
    connectionStatus,
    placeBid,
    error: bidError,
    clearError,
    isLoading,
  } = useAuction({
    auctionId: AUCTION_ID,
    userId: DEMO_USER.id,
    userName: DEMO_USER.name,
  });

  const [userBid, setUserBid] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>('IDLE');
  const [timeDisplay, setTimeDisplay] = useState<string>('--:--');

  const scrollRef = useRef<HTMLDivElement>(null);

  // Update timer display every second
  useEffect(() => {
    if (!auctionState) return;

    const updateTimer = () => {
      if (auctionState.status !== 'LIVE') {
        setTimeDisplay('CLOSED');
      } else {
        setTimeDisplay(formatTime(auctionState.endTime));
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [auctionState?.endTime, auctionState?.status]);

  // Auto-scroll bids to top on new bid
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = 0;
    }
  }, [auctionState?.bids.length]);

  // Clear errors after 5 seconds
  useEffect(() => {
    if (bidError || paymentStatus === 'ERROR') {
      const timer = setTimeout(() => {
        clearError();
        setPaymentStatus('IDLE');
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [bidError, paymentStatus, clearError]);

  const handlePlaceBid = useCallback(async () => {
    const bidAmount = parseInt(userBid, 10);

    if (!bidAmount || !auctionState) return;
    if (bidAmount <= auctionState.currentPrice) return;

    setIsProcessing(true);
    setPaymentStatus('HOLDING');

    try {
      // Step 1: Create payment hold via API
      const { paymentIntentId } = await api.createPaymentHold(
        AUCTION_ID,
        bidAmount,
        DEMO_USER.id
      );

      // Step 2: Simulate card confirmation (in production, use Stripe Elements)
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Step 3: Place bid via WebSocket
      setPaymentStatus('SUCCESS');
      placeBid(bidAmount, paymentIntentId);

      // Reset form
      setTimeout(() => {
        setIsProcessing(false);
        setPaymentStatus('IDLE');
        setUserBid('');
      }, 1000);
    } catch (err) {
      console.error('Bid failed:', err);
      setPaymentStatus('ERROR');
      setIsProcessing(false);
    }
  }, [userBid, auctionState, placeBid]);

  const handleResetAuction = useCallback(async () => {
    try {
      await api.resetAuction(AUCTION_ID);
      window.location.reload();
    } catch (err) {
      console.error('Reset failed:', err);
    }
  }, []);

  const minBid = auctionState
    ? auctionState.currentPrice + auctionState.minIncrement
    : 0;

  const isLive = auctionState?.status === 'LIVE';
  const canBid =
    isLive &&
    !isProcessing &&
    parseInt(userBid || '0', 10) >= minBid;

  const timeRemaining = auctionState
    ? auctionState.endTime - Date.now()
    : Infinity;
  const isUrgent = timeRemaining < 15000 && timeRemaining > 0;

  if (isLoading || !auctionState) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-400">Connecting to auction...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans selection:bg-indigo-500/30">
      {/* NAVBAR */}
      <nav className="h-16 border-b border-slate-800 bg-slate-900/50 flex items-center px-6 justify-between backdrop-blur-md sticky top-0 z-20">
        <div className="flex items-center gap-2">
          <Gavel className="text-indigo-500" />
          <span className="font-bold tracking-tight text-lg">
            Bid<span className="text-indigo-500">Stream</span>
          </span>
        </div>
        <div className="flex items-center gap-4 text-xs font-medium">
          <div className="flex items-center gap-2 px-3 py-1 bg-slate-800 rounded-full text-slate-400">
            <Users size={14} />
            <span className="text-white">{auctionState.viewerCount}</span>{' '}
            Watching
          </div>
          <div
            className={`flex items-center gap-2 px-3 py-1 rounded-full border ${
              connectionStatus === 'CONNECTED'
                ? 'bg-green-500/10 text-green-500 border-green-500/20'
                : connectionStatus === 'RECONNECTING'
                  ? 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'
                  : 'bg-red-500/10 text-red-500 border-red-500/20'
            }`}
          >
            <Activity size={14} />
            Socket: {connectionStatus}
          </div>
          {auctionState.status !== 'LIVE' && (
            <button
              onClick={handleResetAuction}
              className="flex items-center gap-2 px-3 py-1 bg-indigo-600 hover:bg-indigo-500 rounded-full transition-colors"
            >
              <RefreshCw size={14} />
              Reset Demo
            </button>
          )}
        </div>
      </nav>

      <main className="max-w-7xl mx-auto p-6 grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* LEFT COL: PRODUCT SHOWCASE */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          <div className="relative aspect-video bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl overflow-hidden border border-slate-800 shadow-2xl">
            <img
              src={auctionState.item.imageUrl}
              alt={auctionState.item.title}
              className="w-full h-full object-cover opacity-80 hover:scale-105 transition-transform duration-700"
            />

            {/* Live Overlay */}
            <div className="absolute top-6 left-6 flex flex-col gap-2">
              {isLive ? (
                <span className="bg-red-600 text-white text-xs font-bold px-3 py-1 rounded-full animate-pulse w-fit">
                  LIVE AUCTION
                </span>
              ) : (
                <span className="bg-slate-600 text-white text-xs font-bold px-3 py-1 rounded-full w-fit">
                  {auctionState.status}
                </span>
              )}
              <h1 className="text-3xl font-bold text-white drop-shadow-md">
                {auctionState.item.title}
              </h1>
            </div>

            {/* Timer Overlay */}
            <div
              className={`absolute bottom-6 right-6 px-6 py-4 rounded-xl border backdrop-blur-md flex items-center gap-4 transition-colors ${
                isUrgent
                  ? 'bg-red-500/20 border-red-500 text-red-100'
                  : 'bg-black/60 border-white/10 text-white'
              }`}
            >
              <Clock className={isLive ? 'animate-pulse' : ''} />
              <div>
                <div className="text-xs uppercase tracking-wider opacity-70">
                  Time Remaining
                </div>
                <div className="text-3xl font-mono font-bold tabular-nums">
                  {timeDisplay}
                </div>
              </div>
            </div>
          </div>

          {/* Details */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-slate-900 p-4 rounded-xl border border-slate-800">
              <div className="text-slate-500 text-xs mb-1">Current Bid</div>
              <div className="text-2xl font-bold text-white">
                {formatCurrency(auctionState.currentPrice)}
              </div>
            </div>
            <div className="bg-slate-900 p-4 rounded-xl border border-slate-800">
              <div className="text-slate-500 text-xs mb-1">Market Value</div>
              <div className="text-2xl font-bold text-emerald-400">
                {formatCurrency(auctionState.item.marketValue)}
              </div>
            </div>
            <div className="bg-slate-900 p-4 rounded-xl border border-slate-800">
              <div className="text-slate-500 text-xs mb-1">Condition</div>
              <div className="text-2xl font-bold text-white">
                {auctionState.item.condition}
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COL: BIDDING TERMINAL */}
        <div className="lg:col-span-4 flex flex-col h-[600px] bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
          {/* Header */}
          <div className="p-4 border-b border-slate-800 bg-slate-950 flex justify-between items-center">
            <h2 className="font-bold flex items-center gap-2">
              <TrendingUp size={18} className="text-indigo-500" /> Live Activity
            </h2>
            <span className="text-xs text-slate-500">
              {auctionState.bids.length} Bids
            </span>
          </div>

          {/* Scrollable Feed */}
          <div
            ref={scrollRef}
            className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-hide"
          >
            {auctionState.bids.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-600 space-y-2 opacity-50">
                <Gavel size={32} />
                <p>No bids yet. Start the action!</p>
              </div>
            ) : (
              auctionState.bids.map((bid: Bid, i: number) => (
                <div
                  key={bid.id}
                  className={`flex items-center justify-between p-3 rounded-lg border animate-in ${
                    i === 0
                      ? 'bg-indigo-500/10 border-indigo-500/50 shadow-[0_0_15px_rgba(99,102,241,0.2)]'
                      : 'bg-slate-800/50 border-slate-800 text-slate-400'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                        bid.userId === DEMO_USER.id
                          ? 'bg-emerald-500 text-black'
                          : 'bg-slate-700 text-slate-300'
                      }`}
                    >
                      {getInitials(bid.userName)}
                    </div>
                    <div>
                      <div
                        className={`text-sm font-bold ${
                          bid.userId === DEMO_USER.id
                            ? 'text-emerald-400'
                            : 'text-white'
                        }`}
                      >
                        {bid.userId === DEMO_USER.id ? 'You' : bid.userName}
                      </div>
                      <div className="text-[10px] opacity-60">
                        {formatTimestamp(new Date(bid.timestamp))}
                      </div>
                    </div>
                  </div>
                  <div className="font-mono font-bold">
                    {formatCurrency(bid.amount)}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Control Panel */}
          <div className="p-5 border-t border-slate-800 bg-slate-950 space-y-4">
            {/* Dynamic Status Message */}
            {paymentStatus === 'HOLDING' && (
              <div className="flex items-center gap-2 text-xs text-yellow-500 bg-yellow-500/10 p-2 rounded justify-center animate-pulse">
                <CreditCard size={14} /> Authorizing Payment Hold...
              </div>
            )}
            {(paymentStatus === 'ERROR' || bidError) && (
              <div className="flex items-center gap-2 text-xs text-red-400 bg-red-500/10 p-2 rounded justify-center">
                <AlertCircle size={14} />{' '}
                {bidError?.message || 'Payment Failed. Try again.'}
              </div>
            )}
            {paymentStatus === 'SUCCESS' && !bidError && (
              <div className="flex items-center gap-2 text-xs text-emerald-400 bg-emerald-500/10 p-2 rounded justify-center">
                <CheckCircle2 size={14} /> Bid Placed Successfully!
              </div>
            )}

            <div className="space-y-2">
              <label className="text-xs text-slate-400 font-bold uppercase ml-1">
                Place Max Bid
              </label>
              <div className="relative">
                <DollarSign
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
                  size={16}
                />
                <input
                  type="number"
                  value={userBid}
                  onChange={(e) => setUserBid(e.target.value)}
                  disabled={isProcessing || !isLive}
                  placeholder={`Min: ${formatCurrency(minBid)}`}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl py-3 pl-9 pr-4 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono text-lg disabled:opacity-50"
                />
              </div>
            </div>

            <button
              onClick={handlePlaceBid}
              disabled={!canBid}
              className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-all active:scale-95 shadow-lg shadow-indigo-900/20"
            >
              {isProcessing ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Verifying Funds...
                </>
              ) : (
                <>
                  <ShieldCheck size={20} />
                  Confirm Bid with Hold
                </>
              )}
            </button>

            <div className="text-[10px] text-center text-slate-500 flex items-center justify-center gap-1">
              <ShieldCheck size={10} />
              $500 hold will be placed on your card securely via Stripe
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
