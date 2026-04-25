import { Order, OrderItem } from '@/types'
import { formatPrice, formatDate, ORDER_STATUS_LABELS } from '@/lib/utils'

const BRAND_COLOR = '#B76E79'
const DARK_COLOR = '#2C2C2C'
const CREAM_COLOR = '#FAF6F1'
const BORDER_COLOR = '#EDD9C8'

function baseLayout(content: string, previewText = '') {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="x-apple-disable-message-reformatting" />
  <title>Vela Intimates</title>
  <!--[if mso]><noscript><xml><o:OfficeDocumentSettings><o:PixelsPerInch>96</o:PixelsPerInch></o:OfficeDocumentSettings></xml></noscript><![endif]-->
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;500&family=Inter:wght@300;400;500&display=swap');
    body { margin: 0; padding: 0; background-color: #F5EDE4; font-family: 'Inter', Arial, sans-serif; }
    * { box-sizing: border-box; }
    a { color: ${BRAND_COLOR}; }
    .email-wrapper { max-width: 600px; margin: 0 auto; background-color: #ffffff; }
    .header { background-color: ${DARK_COLOR}; padding: 32px 40px; text-align: center; }
    .brand-name { font-family: 'Cormorant Garamond', Georgia, serif; font-size: 24px; font-weight: 300; letter-spacing: 0.2em; color: ${CREAM_COLOR}; text-transform: uppercase; text-decoration: none; }
    .content { padding: 40px; }
    .footer { background-color: ${DARK_COLOR}; padding: 24px 40px; text-align: center; }
    .footer p { color: #9A8E8E; font-size: 11px; margin: 4px 0; }
    .footer a { color: ${BRAND_COLOR}; text-decoration: none; }
    .divider { border: none; border-top: 1px solid ${BORDER_COLOR}; margin: 24px 0; }
    .btn { display: inline-block; background-color: ${DARK_COLOR}; color: ${CREAM_COLOR} !important; text-decoration: none; padding: 14px 32px; font-size: 11px; letter-spacing: 0.2em; text-transform: uppercase; font-family: 'Inter', Arial, sans-serif; }
    .btn-rose { background-color: ${BRAND_COLOR}; }
    .item-row { border-bottom: 1px solid ${BORDER_COLOR}; padding: 16px 0; }
    .item-row:last-child { border-bottom: none; }
    .badge { display: inline-block; padding: 4px 12px; font-size: 11px; letter-spacing: 0.1em; text-transform: uppercase; }
    @media (max-width: 480px) {
      .content { padding: 24px 20px; }
      .header { padding: 24px 20px; }
    }
  </style>
</head>
<body>
  ${previewText ? `<div style="display:none;max-height:0;overflow:hidden;">${previewText}</div>` : ''}
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: #F5EDE4; padding: 20px 0;">
    <tr><td align="center">
      <div class="email-wrapper">
        <!-- Header -->
        <div class="header">
          <a href="${process.env.NEXT_PUBLIC_SITE_URL || 'https://velaintimates.com'}" class="brand-name">Vela Intimates</a>
        </div>

        <!-- Content -->
        <div class="content">
          ${content}
        </div>

        <!-- Footer -->
        <div class="footer">
          <p>© ${new Date().getFullYear()} Vela Intimates. All rights reserved.</p>
          <p>
            <a href="${process.env.NEXT_PUBLIC_SITE_URL || 'https://velaintimates.com'}">Shop</a> &nbsp;·&nbsp;
            <a href="${process.env.NEXT_PUBLIC_SITE_URL || 'https://velaintimates.com'}/contact">Contact Us</a> &nbsp;·&nbsp;
            <a href="${process.env.NEXT_PUBLIC_SITE_URL || 'https://velaintimates.com'}/returns">Returns</a>
          </p>
          <p style="margin-top: 12px; color: #6B6B6B; font-size: 10px;">
            Luxury Lingerie & Intimates · hello@velaintimates.com
          </p>
        </div>
      </div>
    </td></tr>
  </table>
</body>
</html>`
}

function itemsHtml(items: OrderItem[]) {
  return items.map((item) => `
    <div class="item-row">
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr>
          ${item.product_image ? `
          <td width="70" valign="top">
            <img src="${item.product_image}" width="60" height="80" alt="${item.product_name}" style="object-fit:cover; display:block;" />
          </td>` : ''}
          <td valign="top" style="padding-left: ${item.product_image ? '16px' : '0'};">
            <p style="margin: 0 0 4px; font-size: 14px; font-weight: 500; color: ${DARK_COLOR};">${item.product_name}</p>
            <p style="margin: 0 0 4px; font-size: 12px; color: #9A8E8E;">
              ${item.size ? `Size: ${item.size}` : ''}${item.size && item.color ? ' · ' : ''}${item.color || ''}
              &nbsp;&nbsp;Qty: ${item.quantity}
            </p>
          </td>
          <td valign="top" align="right">
            <p style="margin: 0; font-size: 14px; font-weight: 500; color: ${DARK_COLOR};">${formatPrice(item.total_price)}</p>
          </td>
        </tr>
      </table>
    </div>
  `).join('')
}

function totalsHtml(order: Order) {
  return `
    <table width="100%" cellpadding="0" cellspacing="8" style="margin-top: 16px;">
      <tr>
        <td style="font-size: 13px; color: #9A8E8E;">Subtotal</td>
        <td align="right" style="font-size: 13px; color: ${DARK_COLOR};">${formatPrice(order.subtotal)}</td>
      </tr>
      ${order.discount_amount > 0 ? `
      <tr>
        <td style="font-size: 13px; color: #4CAF50;">Discount</td>
        <td align="right" style="font-size: 13px; color: #4CAF50;">-${formatPrice(order.discount_amount)}</td>
      </tr>` : ''}
      <tr>
        <td style="font-size: 13px; color: #9A8E8E;">Shipping</td>
        <td align="right" style="font-size: 13px; color: ${DARK_COLOR};">${order.shipping_fee === 0 ? 'Free' : formatPrice(order.shipping_fee)}</td>
      </tr>
      <tr>
        <td colspan="2"><hr style="border: none; border-top: 1px solid ${BORDER_COLOR}; margin: 8px 0;" /></td>
      </tr>
      <tr>
        <td style="font-size: 15px; font-weight: 600; color: ${DARK_COLOR};">Total</td>
        <td align="right" style="font-size: 16px; font-weight: 600; font-family: 'Cormorant Garamond', Georgia, serif; color: ${DARK_COLOR};">${formatPrice(order.total)}</td>
      </tr>
    </table>
  `
}

export function orderConfirmationEmail(order: Order): { subject: string; html: string } {
  const subject = `Order Confirmed – ${order.order_number} | Vela Intimates`
  const html = baseLayout(`
    <p style="font-family: 'Cormorant Garamond', Georgia, serif; font-size: 28px; font-weight: 300; color: ${DARK_COLOR}; margin: 0 0 8px;">
      Thank you, ${order.shipping_full_name.split(' ')[0]}!
    </p>
    <p style="font-size: 13px; color: #9A8E8E; margin: 0 0 24px;">
      Your order has been received and is being reviewed. We'll send you another email as soon as it ships.
    </p>

    <div style="background-color: ${CREAM_COLOR}; padding: 20px; border-left: 3px solid ${BRAND_COLOR}; margin-bottom: 24px;">
      <p style="margin: 0 0 4px; font-size: 11px; letter-spacing: 0.15em; text-transform: uppercase; color: #9A8E8E;">Order Number</p>
      <p style="margin: 0; font-size: 20px; font-family: 'Cormorant Garamond', Georgia, serif; color: ${DARK_COLOR};">${order.order_number}</p>
      <p style="margin: 6px 0 0; font-size: 12px; color: #9A8E8E;">Placed on ${formatDate(order.created_at)}</p>
    </div>

    <h3 style="font-size: 12px; letter-spacing: 0.15em; text-transform: uppercase; color: ${DARK_COLOR}; margin: 0 0 12px;">Items Ordered</h3>
    ${itemsHtml(order.items || [])}
    ${totalsHtml(order)}

    <hr class="divider" />

    <h3 style="font-size: 12px; letter-spacing: 0.15em; text-transform: uppercase; color: ${DARK_COLOR}; margin: 0 0 12px;">Shipping To</h3>
    <p style="font-size: 13px; color: #9A8E8E; line-height: 1.6; margin: 0;">
      ${order.shipping_full_name}<br/>
      ${order.shipping_address}<br/>
      ${order.shipping_city}${order.shipping_postal_code ? ', ' + order.shipping_postal_code : ''}<br/>
      ${order.shipping_country}
    </p>

    <hr class="divider" />

    <div style="text-align: center; padding: 16px 0;">
      <p style="font-size: 13px; color: #9A8E8E; margin: 0 0 20px;">Questions about your order?</p>
      <a href="mailto:hello@velaintimates.com" class="btn btn-rose">Contact Us</a>
    </div>
  `, `Order ${order.order_number} confirmed — thank you for shopping with Vela Intimates!`)

  return { subject, html }
}

export function orderStatusUpdateEmail(order: Order): { subject: string; html: string } {
  const statusLabel = ORDER_STATUS_LABELS[order.status] || order.status
  const subject = `Your Order ${order.order_number} — ${statusLabel} | Vela Intimates`

  const statusMessages: Record<string, string> = {
    confirmed: 'Great news! Your order has been confirmed and is being prepared.',
    processing: 'Your order is currently being processed and packed by our team.',
    packed: 'Your order has been carefully packed and is ready for shipment.',
    dispatched: `Your order is on its way!${order.tracking_number ? ` Tracking number: <strong>${order.tracking_number}</strong>` : ''}`,
    delivered: 'Your order has been delivered. We hope you love your new pieces!',
    cancelled: 'Your order has been cancelled. If you have any questions, please contact us.',
  }

  const message = statusMessages[order.status] || `Your order status has been updated to: ${statusLabel}`

  const html = baseLayout(`
    <p style="font-family: 'Cormorant Garamond', Georgia, serif; font-size: 26px; font-weight: 300; color: ${DARK_COLOR}; margin: 0 0 8px;">
      Order Update
    </p>
    <p style="font-size: 13px; color: #9A8E8E; margin: 0 0 24px;">
      Hi ${order.shipping_full_name.split(' ')[0]}, here's an update on your order.
    </p>

    <div style="background-color: ${CREAM_COLOR}; padding: 20px; margin-bottom: 24px;">
      <p style="margin: 0 0 4px; font-size: 11px; letter-spacing: 0.15em; text-transform: uppercase; color: #9A8E8E;">Order</p>
      <p style="margin: 0 0 8px; font-size: 18px; font-family: 'Cormorant Garamond', Georgia, serif; color: ${DARK_COLOR};">${order.order_number}</p>
      <span class="badge" style="background-color: ${order.status === 'delivered' ? '#D1FAE5' : order.status === 'cancelled' ? '#FEE2E2' : '#FDF0F2'}; color: ${order.status === 'delivered' ? '#065F46' : order.status === 'cancelled' ? '#991B1B' : BRAND_COLOR};">
        ${statusLabel}
      </span>
    </div>

    <p style="font-size: 14px; color: ${DARK_COLOR}; line-height: 1.6;">${message}</p>

    ${order.status === 'dispatched' && order.tracking_url ? `
    <div style="text-align: center; margin: 24px 0;">
      <a href="${order.tracking_url}" class="btn">Track Your Order</a>
    </div>` : ''}

    ${order.status === 'delivered' ? `
    <div style="background-color: ${CREAM_COLOR}; padding: 20px; text-align: center; margin-top: 24px;">
      <p style="font-family: 'Cormorant Garamond', Georgia, serif; font-size: 18px; color: ${DARK_COLOR}; margin: 0 0 8px;">
        We'd love to hear from you
      </p>
      <p style="font-size: 12px; color: #9A8E8E; margin: 0 0 16px;">Share your experience and help other shoppers</p>
      <a href="${process.env.NEXT_PUBLIC_SITE_URL || 'https://velaintimates.com'}/shop" class="btn btn-rose">Shop Again</a>
    </div>` : ''}
  `, `Update on your Vela Intimates order ${order.order_number}: ${statusLabel}`)

  return { subject, html }
}

export function adminNewOrderEmail(order: Order): { subject: string; html: string } {
  const subject = `🛍️ New Order ${order.order_number} — ${formatPrice(order.total)}`
  const html = baseLayout(`
    <p style="font-family: 'Cormorant Garamond', Georgia, serif; font-size: 24px; font-weight: 300; color: ${DARK_COLOR}; margin: 0 0 8px;">
      New Order Received
    </p>
    <p style="font-size: 13px; color: #9A8E8E; margin: 0 0 24px;">
      A new order has been placed on Vela Intimates.
    </p>

    <div style="background-color: ${CREAM_COLOR}; padding: 20px; margin-bottom: 20px;">
      <table width="100%" cellpadding="0" cellspacing="6">
        <tr>
          <td style="font-size: 11px; text-transform: uppercase; letter-spacing: 0.1em; color: #9A8E8E;">Order Number</td>
          <td align="right" style="font-size: 14px; font-weight: 600; color: ${DARK_COLOR};">${order.order_number}</td>
        </tr>
        <tr>
          <td style="font-size: 11px; text-transform: uppercase; letter-spacing: 0.1em; color: #9A8E8E;">Customer</td>
          <td align="right" style="font-size: 13px; color: ${DARK_COLOR};">${order.shipping_full_name}</td>
        </tr>
        <tr>
          <td style="font-size: 11px; text-transform: uppercase; letter-spacing: 0.1em; color: #9A8E8E;">Email</td>
          <td align="right" style="font-size: 13px; color: ${DARK_COLOR};">${order.shipping_email}</td>
        </tr>
        <tr>
          <td style="font-size: 11px; text-transform: uppercase; letter-spacing: 0.1em; color: #9A8E8E;">Total</td>
          <td align="right" style="font-size: 16px; font-weight: 600; color: ${BRAND_COLOR};">${formatPrice(order.total)}</td>
        </tr>
        <tr>
          <td style="font-size: 11px; text-transform: uppercase; letter-spacing: 0.1em; color: #9A8E8E;">Payment</td>
          <td align="right" style="font-size: 13px; color: ${DARK_COLOR};">${order.payment_method === 'cod' ? 'Cash on Delivery' : 'Manual Payment'}</td>
        </tr>
      </table>
    </div>

    <h3 style="font-size: 12px; letter-spacing: 0.15em; text-transform: uppercase; color: ${DARK_COLOR}; margin: 0 0 12px;">Items</h3>
    ${itemsHtml(order.items || [])}

    <div style="text-align: center; margin-top: 28px;">
      <a href="${process.env.NEXT_PUBLIC_SITE_URL || 'https://velaintimates.com'}/admin/orders/${order.id}" class="btn">
        View Order in Admin
      </a>
    </div>
  `, `New order ${order.order_number} — ${formatPrice(order.total)}`)

  return { subject, html }
}
