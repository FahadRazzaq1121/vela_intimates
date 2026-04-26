import { NextRequest } from 'next/server'
import { createClient as serviceClient } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/server'

function esc(s: string | null | undefined): string {
  if (s == null) return ''
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function money(n: number, currency: string): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  }).format(n)
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return Response.redirect(new URL('/admin/login', req.url))
  const { data: admin } = await supabase.from('admins').select('id').eq('id', user.id).single()
  if (!admin) return Response.redirect(new URL('/admin/login', req.url))

  const db = serviceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  )

  const [{ data: order }, { data: sRows }] = await Promise.all([
    db.from('orders').select('*, items:order_items(*)').eq('id', id).single(),
    db.from('settings').select('key, value'),
  ])

  if (!order) return new Response('Not found', { status: 404 })

  const cfg: Record<string, string> = {}
  for (const r of sRows || []) cfg[r.key] = r.value || ''

  const brand      = cfg.brand_name    || 'Vela Intimates'
  const tagline    = cfg.brand_tagline || 'Luxury Lingerie & Intimates'
  const email      = cfg.contact_email || ''
  const phone      = cfg.footer_whatsapp || cfg.whatsapp_number || ''
  const storeAddr  = cfg.store_address || ''
  const currency   = cfg.store_currency || 'USD'
  const fmt = (n: number) => money(n, currency)

  const dateStr = new Date(order.created_at).toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric',
  })
  const pymtLabel = order.payment_method === 'cod' ? 'Cash on Delivery' : 'Manual Payment'

  type Item = {
    id: string
    product_name: string
    product_sku: string | null
    size: string | null
    color: string | null
    quantity: number
    unit_price: number
    total_price: number
  }
  const items: Item[] = order.items ?? []
  const totalQty = items.reduce((s, i) => s + i.quantity, 0)

  const itemRows = items.map(it => {
    const variant = [it.size, it.color].filter(Boolean).map(esc).join(' / ') || '—'
    return `<tr>
      <td class="tl"><span class="pname">${esc(it.product_name)}</span>${it.product_sku ? `<br><span class="pmeta">SKU: ${esc(it.product_sku)}</span>` : ''}</td>
      <td class="tc pmeta">${variant}</td>
      <td class="tc">${it.quantity}</td>
      <td class="tr">${fmt(it.unit_price)}</td>
      <td class="tr fw6">${fmt(it.total_price)}</td>
    </tr>`
  }).join('')

  const courierSummary = items
    .map(it => `${esc(it.product_name)}${it.size ? ` (${esc(it.size)})` : ''} &times;${it.quantity}`)
    .join(' &nbsp;&middot;&nbsp; ')

  const discRow = order.discount_amount > 0
    ? `<div class="trow disc"><span>Discount${order.coupon_code ? ` (${esc(order.coupon_code)})` : ''}</span><span>&minus;${fmt(order.discount_amount)}</span></div>`
    : ''

  const codBadge = order.payment_method === 'cod'
    ? `<div class="cod-badge">COD &nbsp;${fmt(order.total)}</div>`
    : ''

  const trackRow = order.tracking_number
    ? `<div class="meta"><span class="mlbl">Tracking</span><span class="mval">${esc(order.tracking_number)}</span></div>`
    : ''

  const orderNumJS = JSON.stringify(order.order_number)

  const css = `
*,*::before,*::after{margin:0;padding:0;box-sizing:border-box}
body{font-family:'Inter',-apple-system,Arial,sans-serif;font-size:11px;color:#1a1a1a;background:#EDE0D4;padding-top:60px}

/* ACTION BAR */
.bar{position:fixed;top:0;left:0;right:0;height:56px;background:#2C2C2C;display:flex;align-items:center;justify-content:space-between;padding:0 28px;z-index:100;gap:16px}
.bar a{color:#9A8E8E;text-decoration:none;font-size:12px;display:flex;align-items:center;gap:5px}
.bar a:hover{color:#fff}
.bar-title{font-family:'Cormorant Garamond',Georgia,serif;font-size:15px;font-weight:300;letter-spacing:.12em;color:#FAF6F1;flex:1;text-align:center}
.bar-btns{display:flex;gap:8px}
.bbtn{padding:7px 16px;font-size:11px;font-weight:500;letter-spacing:.05em;border:none;border-radius:3px;cursor:pointer;display:flex;align-items:center;gap:5px;font-family:inherit;transition:opacity .15s}
.bbtn:hover{opacity:.82}
.bbtn-p{background:#444;color:#FAF6F1}
.bbtn-dl{background:#B76E79;color:#fff}

/* A4 */
.a4{width:210mm;min-height:297mm;margin:20px auto 40px;background:#fff;padding:8mm;display:flex;flex-direction:column;box-shadow:0 8px 48px rgba(0,0,0,.18)}

/* RECEIPT COPY */
.copy{border:1.5px solid #DDD0C4;overflow:hidden}

/* Header */
.rhead{background:#2C2C2C;color:#FAF6F1;padding:10px 14px;display:flex;justify-content:space-between;align-items:center}
.rh-name{font-family:'Cormorant Garamond',Georgia,serif;font-size:18px;font-weight:300;letter-spacing:.22em;text-transform:uppercase}
.rh-sub{font-size:8px;color:#9A8E8E;letter-spacing:.12em;text-transform:uppercase;margin-top:2px}
.rh-contact{font-size:8px;color:#777;margin-top:3px}
.copy-lbl{background:#B76E79;color:#fff;font-size:8px;font-weight:700;letter-spacing:.2em;text-transform:uppercase;padding:4px 11px;border-radius:2px;white-space:nowrap}

/* Order bar */
.obar{background:#FAF6F1;border-bottom:1px solid #EDD9C8;padding:8px 14px;display:flex;align-items:center;justify-content:space-between;gap:12px}
.obar-metas{display:flex;gap:18px;flex-wrap:wrap;align-items:center}
.meta{display:flex;flex-direction:column;gap:1px}
.mlbl{font-size:7px;font-weight:700;letter-spacing:.18em;text-transform:uppercase;color:#B76E79}
.mval{font-size:11px;font-weight:600;color:#2C2C2C}

/* Info grid */
.igrid{display:grid;grid-template-columns:1fr 1fr;border-bottom:1px solid #EDD9C8}
.icell{padding:10px 14px}
.icell:first-child{border-right:1px solid #EDD9C8}
.ctitle{font-size:7px;font-weight:700;letter-spacing:.18em;text-transform:uppercase;color:#B76E79;margin-bottom:6px}
.cname{font-size:12px;font-weight:600;color:#2C2C2C;margin-bottom:3px}
.cline{font-size:9.5px;color:#666;line-height:1.6}

/* Items table */
table.ti{width:100%;border-collapse:collapse}
table.ti thead tr{background:#F8F1EA;border-bottom:1px solid #EDD9C8}
table.ti th{font-size:7px;font-weight:700;letter-spacing:.13em;text-transform:uppercase;color:#9A8E8E;padding:7px 6px;text-align:left}
table.ti th:first-child{padding-left:14px}
table.ti td{padding:7px 6px;font-size:10px;color:#2C2C2C;vertical-align:top;border-bottom:1px solid #F5F0EA}
table.ti td:first-child{padding-left:14px}
table.ti tbody tr:last-child td{border-bottom:none}
.tl{text-align:left}.tc{text-align:center}.tr{text-align:right;padding-right:14px!important}
.pname{font-weight:500}.pmeta{font-size:8.5px;color:#999}.fw6{font-weight:600}

/* Totals */
.totals-wrap{display:flex;justify-content:flex-end;padding:8px 14px;background:#FDFAF8;border-top:1px solid #EDD9C8}
.totals{min-width:190px}
.trow{display:flex;justify-content:space-between;gap:20px;padding:2px 0;font-size:10px;color:#666}
.trow.disc{color:#16A34A}
.trow.grand{font-size:13px;font-weight:700;color:#2C2C2C;border-top:1.5px solid #2C2C2C;margin-top:5px;padding-top:6px}

/* Receipt footer */
.rfoot{background:#2C2C2C;padding:7px 14px;display:flex;justify-content:space-between;align-items:center}
.rfoot-brand{font-family:'Cormorant Garamond',Georgia,serif;font-size:10px;font-weight:300;letter-spacing:.12em;color:#777;text-transform:uppercase}
.rfoot-thanks{font-size:9.5px;color:#B76E79;font-style:italic}

/* Divider */
.scissors{display:flex;align-items:center;gap:10px;padding:4mm 0;color:#bbb;font-size:8.5px;letter-spacing:.15em;text-transform:uppercase}
.scissors::before,.scissors::after{content:'';flex:1;border-top:1.5px dashed #ccc}

/* Courier copy extras */
.cgrid{display:grid;grid-template-columns:1fr 1fr;border-bottom:1px solid #EDD9C8}
.cgrid .icell:first-child{border-right:1px solid #EDD9C8}
.cname-lg{font-size:15px!important}
.cline-lg{font-size:11px!important}
.cdetail{background:#F8F1EA;border-bottom:1px solid #EDD9C8;padding:8px 14px;display:flex;align-items:center;justify-content:space-between;gap:14px;flex-wrap:wrap}
.cdetail-metas{display:flex;gap:18px;flex-wrap:wrap;align-items:center}
.cod-badge{background:#B76E79;color:#fff;font-size:9px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;padding:5px 12px;border-radius:2px;white-space:nowrap}
.csummary{padding:8px 14px;font-size:9.5px;color:#555;border-bottom:1px solid #F0EBE3;background:#fff;line-height:1.7}
.csummary strong{color:#2C2C2C;font-weight:600}

/* Print */
@page{size:A4 portrait;margin:0}
@media print{
  body{background:#fff!important;padding-top:0!important}
  .bar{display:none!important}
  .a4{margin:0!important;width:100%!important;min-height:auto;box-shadow:none!important;padding:8mm!important}
}`

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Receipt &mdash; ${esc(order.order_number)}</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300&family=Inter:wght@300;400;500;600&display=swap" rel="stylesheet">
<style>${css}</style>
</head>
<body>

<div class="bar" id="bar">
  <a href="/admin/orders/${esc(id)}">&larr; Back to Order</a>
  <span class="bar-title">${esc(brand)} &mdash; ${esc(order.order_number)}</span>
  <div class="bar-btns">
    <button class="bbtn bbtn-p" onclick="printPage()">&#128438; Print</button>
    <button class="bbtn bbtn-dl" onclick="printPage()">&#11015; Save as PDF</button>
  </div>
</div>

<div class="a4">

  <!-- ══════════════════════ CUSTOMER COPY ══════════════════════ -->
  <div class="copy">

    <div class="rhead">
      <div>
        <div class="rh-name">${esc(brand)}</div>
        <div class="rh-sub">${esc(tagline)}</div>
        ${(email || phone) ? `<div class="rh-contact">${[email, phone].filter(Boolean).map(esc).join(' &nbsp;&middot;&nbsp; ')}</div>` : ''}
      </div>
      <div class="copy-lbl">Customer Copy</div>
    </div>

    <div class="obar">
      <div class="obar-metas">
        <div class="meta"><span class="mlbl">Order #</span><span class="mval">${esc(order.order_number)}</span></div>
        <div class="meta"><span class="mlbl">Date</span><span class="mval">${esc(dateStr)}</span></div>
        <div class="meta"><span class="mlbl">Payment</span><span class="mval">${esc(pymtLabel)}</span></div>
        <div class="meta"><span class="mlbl">Status</span><span class="mval" style="text-transform:capitalize">${esc(order.status)}</span></div>
      </div>
      <svg id="bc1" style="max-width:170px;flex-shrink:0"></svg>
    </div>

    <div class="igrid">
      <div class="icell">
        <div class="ctitle">Bill To</div>
        <div class="cname">${esc(order.shipping_full_name)}</div>
        <div class="cline">${esc(order.shipping_email)}</div>
        ${order.shipping_phone ? `<div class="cline">${esc(order.shipping_phone)}</div>` : ''}
      </div>
      <div class="icell">
        <div class="ctitle">Ship To</div>
        <div class="cname">${esc(order.shipping_full_name)}</div>
        <div class="cline">${esc(order.shipping_address)}</div>
        <div class="cline">${esc(order.shipping_city)}${order.shipping_postal_code ? `, ${esc(order.shipping_postal_code)}` : ''}</div>
        <div class="cline">${esc(order.shipping_country)}</div>
      </div>
    </div>

    <table class="ti">
      <thead><tr>
        <th style="width:36%">Product</th>
        <th class="tc" style="width:16%">Variant</th>
        <th class="tc" style="width:7%">Qty</th>
        <th class="tr" style="width:18%">Unit Price</th>
        <th class="tr" style="width:18%">Total</th>
      </tr></thead>
      <tbody>${itemRows}</tbody>
    </table>

    <div class="totals-wrap">
      <div class="totals">
        <div class="trow"><span>Subtotal</span><span>${fmt(order.subtotal)}</span></div>
        ${discRow}
        <div class="trow"><span>Shipping</span><span>${order.shipping_fee === 0 ? 'Free' : fmt(order.shipping_fee)}</span></div>
        <div class="trow grand"><span>Total</span><span>${fmt(order.total)}</span></div>
      </div>
    </div>

    <div class="rfoot">
      <div class="rfoot-brand">${esc(brand)}</div>
      <div class="rfoot-thanks">Thank you for your order!</div>
    </div>

  </div>

  <!-- ══════════════════════ DIVIDER ══════════════════════ -->
  <div class="scissors">&#9988;&nbsp;&nbsp;Fold &amp; Cut Here&nbsp;&nbsp;&#9988;</div>

  <!-- ══════════════════════ COURIER COPY ══════════════════════ -->
  <div class="copy">

    <div class="rhead">
      <div>
        <div class="rh-name">${esc(brand)}</div>
        <div class="rh-sub">Shipping Slip</div>
      </div>
      <div class="copy-lbl">Courier Copy</div>
    </div>

    <div class="cgrid">
      <div class="icell">
        <div class="ctitle">From (Sender)</div>
        <div class="cname">${esc(brand)}</div>
        ${storeAddr ? `<div class="cline">${esc(storeAddr)}</div>` : ''}
        ${email ? `<div class="cline">${esc(email)}</div>` : ''}
        ${phone ? `<div class="cline">${esc(phone)}</div>` : ''}
      </div>
      <div class="icell" style="background:#FDFAF8">
        <div class="ctitle">Deliver To (Recipient)</div>
        <div class="cname cname-lg">${esc(order.shipping_full_name)}</div>
        <div class="cline cline-lg">${esc(order.shipping_address)}</div>
        <div class="cline cline-lg">${esc(order.shipping_city)}${order.shipping_postal_code ? `, ${esc(order.shipping_postal_code)}` : ''}</div>
        <div class="cline cline-lg">${esc(order.shipping_country)}</div>
        ${order.shipping_phone ? `<div class="cline cline-lg" style="margin-top:5px;font-weight:600;color:#2C2C2C">Tel: ${esc(order.shipping_phone)}</div>` : ''}
      </div>
    </div>

    <div class="cdetail">
      <div class="cdetail-metas">
        <div class="meta"><span class="mlbl">Order #</span><span class="mval">${esc(order.order_number)}</span></div>
        <div class="meta"><span class="mlbl">Date</span><span class="mval">${esc(dateStr)}</span></div>
        <div class="meta"><span class="mlbl">Items</span><span class="mval">${totalQty} pcs</span></div>
        ${trackRow}
        ${codBadge}
      </div>
      <svg id="bc2" style="max-width:170px;flex-shrink:0"></svg>
    </div>

    <div class="csummary">
      <strong>Contents:</strong>&nbsp; ${courierSummary}
    </div>

    <div class="rfoot">
      <div class="rfoot-brand">${esc(brand)}${email ? ` &nbsp;&middot;&nbsp; ${esc(email)}` : ''}</div>
      <div class="rfoot-thanks">Order ${esc(order.order_number)} &nbsp;&middot;&nbsp; ${fmt(order.total)}</div>
    </div>

  </div>

</div>

<script src="https://cdn.jsdelivr.net/npm/jsbarcode@3.11.6/dist/JsBarcode.all.min.js"></script>
<script>
(function(){
  var val = ${orderNumJS};
  var base = {format:'CODE128',width:1.4,height:36,displayValue:true,fontSize:9,textMargin:2,background:'transparent',lineColor:'#2C2C2C'};
  try{JsBarcode('#bc1',val,base);}catch(e){console.warn('barcode1',e);}
  try{JsBarcode('#bc2',val,Object.assign({},base,{height:44}));}catch(e){console.warn('barcode2',e);}
})();

function printPage(){
  var bar=document.getElementById('bar');
  bar.style.display='none';
  document.body.style.paddingTop='0';
  window.print();
  setTimeout(function(){bar.style.display='flex';document.body.style.paddingTop='60px';},1500);
}
</script>
</body>
</html>`

  return new Response(html, {
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
  })
}
