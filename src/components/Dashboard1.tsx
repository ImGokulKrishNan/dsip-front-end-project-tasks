import React from 'react';
import { UserProfile, Stock } from '../types';
import { Icons } from '../constants';
import DailyActionCard from './DailyActionCard';

interface DashboardProps {
  user: UserProfile;
  stocks: Stock[];
  onAddStock: () => void;
  onSelectStock: (id: string) => void;
  onExecute: (id: string, amount: number) => void;
}

/* ---------------- Profile Icon ---------------- */

const ProfileIcon: React.FC<{ user: UserProfile }> = ({ user }) => (
  <div className="group relative">
    <div className="w-9 h-9 bg-white rounded-xl border border-slate-100 shadow-sm flex items-center justify-center font-black cursor-pointer hover:shadow-md transition">
      {user.name.charAt(0)}
    </div>
    <div className="absolute top-full right-0 mt-2 px-3 py-1.5 bg-slate-900 text-white text-[10px] font-bold rounded-md opacity-0 invisible group-hover:opacity-100 group-hover:visible transition z-50">
      {user.name}
    </div>
  </div>
);

/* ---------------- Dashboard ---------------- */

const Dashboard: React.FC<DashboardProps> = ({
  user,
  stocks,
  onAddStock,
  onSelectStock,
  onExecute
}) => {
  /* ---------- Today’s pending actions ---------- */
  const pendingStocks = stocks.filter(
    s =>
      !s.isPaused &&
      !s.history.some(
        h => new Date(h.date).toDateString() === new Date().toDateString()
      )
  );

  /* ---------- Portfolio calculations ---------- */
  let invested = 0;
  let current = 0;

  stocks.forEach(stock => {
    const sipQty = stock.history.reduce(
      (acc, h) => acc + h.amount / h.price,
      0
    );
    const totalQty = stock.quantityOwned + sipQty;
    const cost =
      stock.quantityOwned * stock.averagePriceOwned +
      stock.deployedAmount;

    invested += cost;
    current += totalQty * stock.currentPrice;
  });

  const pnlPct =
    invested > 0 ? ((current - invested) / invested) * 100 : 0;
  const isProfit = pnlPct >= 0;
  const hasStocks = stocks.length > 0;

  return (
    <div className="min-h-screen max-w-[1200px] mx-auto p-6 md:p-10 space-y-12">

      {/* =====================================================
          HEADER
      ====================================================== */}
      <header className="flex justify-between items-center border-b border-slate-100 pb-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900">Strategy</h1>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            Automated Investing
          </p>
        </div>

        <div className="flex items-center gap-5">
          <div className="flex items-center gap-2">
            <Icons.Park className="text-sky-500" />
            <span className="text-sm font-black">
              ₹{user.moneyParkBalance.toLocaleString()}
            </span>
          </div>

          <div className="flex items-center gap-2 text-slate-500">
            <Icons.Wallet />
            <span className="text-sm font-bold">
              ₹{user.walletBalance.toLocaleString()}
            </span>
          </div>

          <button
            onClick={onAddStock}
            className="bg-slate-900 text-white px-4 py-2 rounded-xl text-[11px] font-bold uppercase tracking-widest hover:bg-slate-800 transition"
          >
            Activate Stock Engine
          </button>

          <ProfileIcon user={user} />
        </div>
      </header>

      {/* =====================================================
          TODAY – ACTION ZONE (MOST IMPORTANT)
      ====================================================== */}
      <section className="space-y-6">
        <h2 className="text-[11px] font-bold uppercase tracking-widest text-slate-400">
          Today
        </h2>

        {pendingStocks.length === 0 ? (
          <div className="bg-white border border-slate-100 rounded-2xl p-8 flex items-center gap-6 shadow-sm">
            <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-500">
              <Icons.Check />
            </div>
            <div>
              <p className="font-black text-slate-900">
                You’re done for today
              </p>
              <p className="text-sm text-slate-500">
                No action required. We’ll notify you tomorrow.
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {pendingStocks.map(stock => (
              <DailyActionCard
                key={stock.id}
                stock={stock}
                onExecute={onExecute}
              />
            ))}
          </div>
        )}
      </section>

      {/* =====================================================
          PORTFOLIO – CONFIDENCE
      ====================================================== */}
      {hasStocks && (
        <section className="bg-white border border-slate-100 rounded-3xl p-8 shadow-sm">
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">
            Portfolio Value
          </p>

          <div className="flex justify-between items-end">
            <p className="text-4xl font-black text-slate-900">
              ₹{Math.round(current).toLocaleString()}
            </p>

            <span
              className={`text-xl font-black ${
                isProfit ? 'text-emerald-600' : 'text-red-500'
              }`}
            >
              {isProfit ? '+' : ''}
              {pnlPct.toFixed(2)}%
            </span>
          </div>
        </section>
      )}

      {/* =====================================================
          STRATEGIES – CONTROL
      ====================================================== */}
      {hasStocks ? (
        <section className="space-y-4">
          <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400">
            Your Strategies
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {stocks.map(stock => {
              const progress =
                (stock.deployedAmount / stock.totalBudget) * 100;

              return (
                <div
                  key={stock.id}
                  onClick={() => onSelectStock(stock.id)}
                  className={`bg-white border rounded-2xl p-6 cursor-pointer transition ${
                    stock.isPaused
                      ? 'border-slate-200 opacity-60'
                      : 'border-slate-100 hover:shadow-lg hover:-translate-y-1'
                  }`}
                >
                  {stock.isPaused && (
                    <span className="text-[9px] font-bold uppercase text-amber-600">
                      Standby
                    </span>
                  )}

                  <h3 className="font-black text-slate-900 text-lg mt-2">
                    {stock.symbol}
                  </h3>

                  <p className="text-sm font-bold text-slate-500 mt-1">
                    ₹{stock.deployedAmount.toLocaleString()} invested
                  </p>

                  <div className="mt-4 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-sky-500 transition-all"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      ) : (
        <div className="bg-white border-2 border-dashed border-slate-200 rounded-3xl p-16 text-center">
          <p className="text-slate-500 font-bold mb-4">
            No strategies running
          </p>
          <button
            onClick={onAddStock}
            className="bg-sky-500 text-white px-6 py-3 rounded-xl font-black uppercase tracking-widest text-xs hover:bg-sky-600 transition"
          >
            Create Strategy
          </button>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
