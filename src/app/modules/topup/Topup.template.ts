import config from '../../../config';
import type { TCheckoutAzulPaymentTemplateData } from './Topup.interface';

export const azulTopupCheckoutTemplate = (
  session: TCheckoutAzulPaymentTemplateData,
) => /* html */ `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>${config.server.name} — Checkout</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet"/>
  <style>
    body { font-family: 'Inter', sans-serif; }
    @keyframes fadeIn { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }
    @keyframes shimmer { 0% { transform:translateX(-100%) skewX(-12deg); } 100% { transform:translateX(250%) skewX(-12deg); } }
    @keyframes spin { to { transform: rotate(360deg); } }
    .fade-in { animation: fadeIn 0.4s ease; }
    .shimmer { animation: shimmer 2.5s infinite; }
    .spinning { animation: spin 0.8s linear infinite; }
  </style>
</head>
<body class="bg-zinc-950 min-h-screen flex items-center justify-center p-4">

  <div class="fade-in bg-zinc-900 rounded-2xl w-full max-w-sm p-6 space-y-5">

    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <p class="text-xs text-zinc-500 uppercase tracking-widest">${config.server.name}</p>
        <h1 class="text-white font-bold text-lg mt-0.5">Top-up Balance</h1>
      </div>
      <span id="status-badge" class="text-xs bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 px-2.5 py-1 rounded-full font-medium">Pending</span>
    </div>

    <!-- Amount -->
    <div class="bg-zinc-800/60 rounded-xl p-4 text-center">
      <p class="text-zinc-500 text-xs mb-1">You're adding</p>
      <p class="text-white font-bold text-4xl" id="el-amount">—</p>
    </div>

    <!-- Details -->
    <div class="space-y-2.5">
      <div class="flex justify-between text-sm">
        <span class="text-zinc-500">Account</span>
        <span class="text-white font-medium" id="el-name">—</span>
      </div>
      <div class="flex justify-between text-sm">
        <span class="text-zinc-500">User ID</span>
        <span class="text-zinc-400 font-mono text-xs" id="el-uid">—</span>
      </div>
      <div class="flex justify-between text-sm">
        <span class="text-zinc-500">Provider</span>
        <a href="https://www.azul.com.do" target="_blank" rel="noopener noreferrer" id="el-provider"
          class="text-white font-semibold tracking-wide underline underline-offset-2 decoration-zinc-500 hover:decoration-white transition-all">—</a>
      </div>
      <div class="flex justify-between text-sm">
        <span class="text-zinc-500">Session</span>
        <span class="text-zinc-400 font-mono text-xs" id="el-session">—</span>
      </div>
      <div class="flex justify-between text-sm">
        <span class="text-zinc-500">Date</span>
        <span class="text-zinc-400 text-xs" id="el-date">—</span>
      </div>
      <div class="border-t border-zinc-800 pt-2.5 flex justify-between text-sm">
        <span class="text-zinc-500">Fees</span>
        <span class="text-zinc-400">$0.00</span>
      </div>
      <div class="flex justify-between text-sm font-semibold">
        <span class="text-zinc-300">Total</span>
        <span class="text-white" id="el-total">—</span>
      </div>
    </div>

    <!-- Button -->
    <button id="btn" onclick="pay()"
      class="relative w-full rounded-[14px] overflow-hidden transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_8px_30px_rgba(139,92,246,0.45)] active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none">
      <!-- base gradient -->
      <span id="btn-bg" class="absolute inset-0 bg-gradient-to-br from-indigo-500 via-violet-500 to-purple-500 transition-opacity duration-300 rounded-[14px]"></span>
      <!-- hover gradient -->
      <span class="absolute inset-0 bg-gradient-to-br from-indigo-400 via-violet-400 to-purple-400 opacity-0 hover:opacity-100 transition-opacity duration-300 rounded-[14px]"></span>
      <!-- shimmer -->
      <span class="shimmer absolute top-0 left-0 w-[40%] h-full bg-gradient-to-r from-transparent via-white/10 to-transparent skew-x-[-12deg] pointer-events-none z-10"></span>
      <!-- content -->
      <span id="btn-content" class="relative z-20 flex items-center justify-center gap-2 py-4 px-6 text-white font-semibold text-sm">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
        <span id="btn-text">Confirm &amp; Pay</span>
        <svg id="btn-arrow" class="transition-transform duration-200 group-hover:translate-x-1" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
      </span>
    </button>

    <p class="text-center text-zinc-600 text-xs">🔒 Secured by <a href="https://www.azul.com.do" target="_blank" rel="noopener noreferrer" class="text-zinc-500 underline underline-offset-2 decoration-zinc-600 hover:text-zinc-300 hover:decoration-zinc-300 transition-all">Azul</a></p>
  </div>

  <script>
    const session = {
      id: "${session.id}",
      amount: ${session.amount},
      provider: "${session.provider}",
      user_id: "${session.user_id ?? ''}",
      requested_at: "${session.requested_at.toISOString()}",
      completed_at: ${session.completed_at ? '"' + session.completed_at.toISOString() + '"' : 'null'},
      is_completed: ${session.is_completed},
      user: ${JSON.stringify(session.user)}
    };

    document.getElementById('el-amount').textContent = '$' + (session.amount / 100).toFixed(2);
    document.getElementById('el-total').textContent  = '$' + (session.amount / 100).toFixed(2);
    document.getElementById('el-name').textContent   = session.user?.name ?? 'Guest';
    document.getElementById('el-uid').textContent    = session.user_id || '—';
    document.getElementById('el-provider').textContent = session.provider;
    document.getElementById('el-session').textContent  = session.id;
    document.getElementById('el-date').textContent     = new Intl.DateTimeFormat('en-US', {
      month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
    }).format(new Date(session.requested_at));

    if (session.is_completed) {
      setSuccess();
      document.getElementById('btn').disabled = true;
      document.getElementById('btn').removeAttribute('onclick');
      document.getElementById('status-badge').textContent = 'Completed';
      document.getElementById('status-badge').className = 'text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2.5 py-1 rounded-full font-medium';
    }

    function setSuccess() {
      document.getElementById('btn-bg').className = 'absolute inset-0 bg-gradient-to-br from-emerald-500 to-green-600 transition-opacity duration-300 rounded-[14px]';
      document.getElementById('btn-arrow').outerHTML = '<svg id="btn-arrow" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><polyline points="20 6 9 17 4 12"/></svg>';
      document.getElementById('btn-text').textContent = 'Payment Successful';
    }

    function pay() {
      const btn = document.getElementById('btn');
      btn.disabled = true;
      document.getElementById('btn-arrow').outerHTML = '<svg id="btn-arrow" class="spinning" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/></svg>';
      document.getElementById('btn-text').textContent = 'Processing…';

      // 👇 Replace with your actual POST/redirect
      setTimeout(() => {
        setSuccess();
        document.getElementById('status-badge').textContent = 'Completed';
        document.getElementById('status-badge').className = 'text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2.5 py-1 rounded-full font-medium';
      }, 2000);
    }
  </script>
</body>
</html>`;
