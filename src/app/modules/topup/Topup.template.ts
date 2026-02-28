import config from '../../../config';
import { AzulServices } from '../azul/Azul.service';
import type { TCheckoutAzulPaymentTemplateData } from './Topup.interface';

export const azulTopupCheckoutTemplate = (
  session: TCheckoutAzulPaymentTemplateData,
) => {
  // ── Compute Azul payload server-side ──────────────────────────────────────
  const azulData =
    !session.is_completed &&
    AzulServices.initiatePayment({
      amount: session.amount, //? in cents
      order_number: session.id,
      custom_field_1_label: 'User ID',
      custom_field_1_value: session.user_id ?? '',
      custom_field_2_label: 'User Name',
      custom_field_2_value: session.user?.name ?? '',
      product_image_url: `${config.url.href}${session.user?.avatar ?? config.server.default_avatar}`,
    });

  return /* html */ `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>${config.server.name} — Checkout</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet"/>
  <style>
    body { font-family: 'Inter', sans-serif; }
    @keyframes fadeIn  { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }
    @keyframes shimmer { 0% { transform:translateX(-100%) skewX(-12deg); } 100% { transform:translateX(250%) skewX(-12deg); } }
    @keyframes spin    { to { transform: rotate(360deg); } }
    .fade-in  { animation: fadeIn  0.45s ease both; }
    .shimmer  { animation: shimmer 2.5s  infinite;  }
    .spinning { animation: spin    0.8s  linear infinite; }
  </style>
</head>
<body class="bg-zinc-950 min-h-screen flex items-center justify-center p-4">

  <div class="fade-in w-full max-w-sm space-y-3">

    <!-- User Card -->
    <div class="bg-zinc-900 rounded-2xl p-5 flex items-center gap-4">
      <div class="relative flex-shrink-0">
        <img id="el-avatar" src="${session.user?.avatar ?? ''}" alt=""
          onerror="this.style.display='none';document.getElementById('el-avatar-fallback').style.display='flex';"
          class="w-14 h-14 rounded-full object-cover border-2 border-zinc-700 ${session.user?.avatar ? '' : 'hidden'}"/>
        <span id="el-avatar-fallback"
          class="w-14 h-14 rounded-full border-2 border-zinc-700 bg-gradient-to-br from-violet-500 to-indigo-600 text-white font-bold text-lg ${session.user?.avatar ? 'hidden' : 'flex'} items-center justify-center">
          ${(session.user?.name ?? 'G')
            .split(' ')
            .map((w: string) => w[0])
            .join('')
            .slice(0, 2)
            .toUpperCase()}
        </span>
        <span class="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-emerald-400 border-2 border-zinc-900 rounded-full"></span>
      </div>
      <div class="flex-1 min-w-0">
        <p class="text-white font-semibold text-base truncate">${session.user?.name ?? 'Guest'}</p>
        <p class="text-zinc-500 text-xs font-mono mt-0.5 truncate">${session.user_id ? 'ID: ' + session.user_id : '—'}</p>
      </div>
      <span id="status-badge" class="flex-shrink-0 text-xs px-2.5 py-1 rounded-full font-medium border
        ${
          session.is_completed
            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
            : 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
        }">
        ${session.is_completed ? 'Completed' : 'Pending'}
      </span>
    </div>

    <!-- Checkout Card -->
    <div class="bg-zinc-900 rounded-2xl p-5 space-y-5">

      <!-- Header -->
      <div class="flex items-center justify-between">
        <p class="text-xs text-zinc-500 uppercase tracking-widest font-medium">${config.server.name}</p>
        <p class="text-xs text-zinc-600 font-mono">#${session.id.toUpperCase()}</p>
      </div>

      <!-- Amount -->
      <div class="text-center py-2">
        <p class="text-zinc-500 text-xs mb-2 uppercase tracking-widest">Amount Due</p>
        <p class="text-white font-bold text-5xl tracking-tight">$${(session.amount / 100).toFixed(2)}</p>
        <p class="text-zinc-600 text-xs mt-2">
          ${new Intl.DateTimeFormat('en-US', { month: 'long', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' }).format(session.requested_at)}
        </p>
      </div>

      <div class="border-t border-zinc-800"></div>

      <!-- Details -->
      <div class="space-y-3">
        <div class="flex justify-between items-center text-sm">
          <span class="text-zinc-500">Provider</span>
          <a href="https://www.azul.com.do" target="_blank" rel="noopener noreferrer"
            class="flex items-center gap-1.5 text-white font-semibold tracking-wide underline underline-offset-2 decoration-zinc-600 hover:decoration-white transition-all">
            ${session.provider}
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="text-zinc-500"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
          </a>
        </div>
        <div class="flex justify-between text-sm">
          <span class="text-zinc-500">Subtotal</span>
          <span class="text-zinc-300">$${(session.amount / 100).toFixed(2)}</span>
        </div>
        <div class="flex justify-between text-sm">
          <span class="text-zinc-500">Fees</span>
          <span class="text-zinc-400">$0.00</span>
        </div>
        <div class="border-t border-zinc-800 pt-3 flex justify-between text-sm font-semibold">
          <span class="text-zinc-300">Total</span>
          <span class="text-white text-base">$${(session.amount / 100).toFixed(2)}</span>
        </div>
      </div>

      <!-- Button -->
      <button id="btn" onclick="pay()"
        ${session.is_completed ? 'disabled' : ''}
        class="relative w-full rounded-2xl overflow-hidden transition-all duration-200
          ${
            session.is_completed
              ? 'opacity-60 cursor-not-allowed'
              : 'hover:-translate-y-0.5 hover:shadow-[0_8px_32px_rgba(139,92,246,0.4)] active:scale-[0.98]'
          }">
        <span id="btn-bg" class="absolute inset-0 rounded-2xl
          ${
            session.is_completed
              ? 'bg-gradient-to-br from-emerald-500 to-green-600'
              : 'bg-gradient-to-br from-indigo-500 via-violet-500 to-purple-500'
          }">
        </span>
        ${!session.is_completed ? '<span class="shimmer absolute top-0 left-0 w-[40%] h-full bg-gradient-to-r from-transparent via-white/10 to-transparent pointer-events-none z-10"></span>' : ''}
        <span class="relative z-20 flex items-center justify-center gap-2 py-4 px-6 text-white font-semibold text-sm">
          ${
            session.is_completed
              ? `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><polyline points="20 6 9 17 4 12"/></svg>
                <span id="btn-text">Payment Successful</span>`
              : `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                <span id="btn-text">Confirm &amp; Pay</span>
                <svg id="btn-arrow" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>`
          }
        </span>
      </button>

      <p class="text-center text-zinc-600 text-xs">🔒 Secured by
        <a href="https://www.azul.com.do" target="_blank" rel="noopener noreferrer"
          class="underline underline-offset-2 decoration-zinc-700 hover:text-zinc-400 hover:decoration-zinc-400 transition-all">Azul</a>
      </p>
    </div>

  </div>

  <script>
    ${
      !session.is_completed && azulData
        ? `
    const __azulPayload__ = ${JSON.stringify(azulData.payload)};
    const __azulUrl__     = ${JSON.stringify(azulData.payment_page_url)};

    function submitToAzul() {
      const existing = document.getElementById('__azul__');
      if (existing) existing.remove();

      const f = document.createElement('form');
      f.id = '__azul__';
      f.method = 'POST';
      f.action = __azulUrl__;
      f.style.display = 'none';

      Object.entries(__azulPayload__).forEach(([name, value]) => {
        const input = document.createElement('input');
        input.type  = 'hidden';
        input.name  = name;
        input.value = String(value ?? '');
        f.appendChild(input);
      });

      document.body.appendChild(f);
      f.submit();
    }

    function pay() {
      const btn = document.getElementById('btn');
      btn.disabled = true;
      document.getElementById('btn-arrow').outerHTML =
        '<svg id="btn-arrow" class="spinning" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/></svg>';
      document.getElementById('btn-text').textContent = 'Redirecting…';
      submitToAzul();
    }
    `
        : ''
    }
  </script>
</body>
</html>`;
};
