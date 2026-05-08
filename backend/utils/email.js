const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }
});

exports.sendVerificationEmail = async (email, token) => {
  const url = `${process.env.CLIENT_URL}/verify-email/${token}`;
  await transporter.sendMail({
    from: `"PizzaCraft 🍕" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'Verify your PizzaCraft account',
    html: `
      <div style="font-family:sans-serif;max-width:500px;margin:auto;padding:32px;background:#1a1a2e;color:#eee;border-radius:12px;">
        <h2 style="color:#f97316;">🍕 Welcome to PizzaCraft!</h2>
        <p>Please verify your email to start ordering delicious pizzas.</p>
        <a href="${url}" style="display:inline-block;margin:16px 0;padding:12px 28px;background:#f97316;color:#fff;text-decoration:none;border-radius:8px;font-weight:bold;">Verify Email</a>
        <p style="color:#999;font-size:12px;">Link expires in 24 hours.</p>
      </div>`
  });
};

exports.sendPasswordResetEmail = async (email, token) => {
  const url = `${process.env.CLIENT_URL}/reset-password/${token}`;
  await transporter.sendMail({
    from: `"PizzaCraft 🍕" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'Reset your PizzaCraft password',
    html: `
      <div style="font-family:sans-serif;max-width:500px;margin:auto;padding:32px;background:#1a1a2e;color:#eee;border-radius:12px;">
        <h2 style="color:#f97316;">🔐 Password Reset</h2>
        <p>Click below to reset your password. This link expires in 1 hour.</p>
        <a href="${url}" style="display:inline-block;margin:16px 0;padding:12px 28px;background:#f97316;color:#fff;text-decoration:none;border-radius:8px;font-weight:bold;">Reset Password</a>
      </div>`
  });
};

exports.sendStockAlert = async (items) => {
  const itemList = items.map(i => `<li>${i.name} (${i.category}): ${i.quantity} remaining</li>`).join('');
  await transporter.sendMail({
    from: `"PizzaCraft System" <${process.env.EMAIL_USER}>`,
    to: process.env.ADMIN_EMAIL,
    subject: '⚠️ Low Stock Alert - PizzaCraft Inventory',
    html: `
      <div style="font-family:sans-serif;max-width:500px;margin:auto;padding:32px;background:#1a1a2e;color:#eee;border-radius:12px;">
        <h2 style="color:#ef4444;">⚠️ Low Stock Alert</h2>
        <p>The following items have fallen below the threshold:</p>
        <ul style="color:#fbbf24;">${itemList}</ul>
        <p>Please restock immediately to avoid disruptions.</p>
      </div>`
  });
};

exports.sendOrderStatusEmail = async (email, orderStatus, orderId) => {
  const icons = { 'Order Received': '📋', 'In the Kitchen': '👨‍🍳', 'Sent to Delivery': '🚀', 'Delivered': '✅' };
  await transporter.sendMail({
    from: `"PizzaCraft 🍕" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: `Order Update: ${orderStatus}`,
    html: `
      <div style="font-family:sans-serif;max-width:500px;margin:auto;padding:32px;background:#1a1a2e;color:#eee;border-radius:12px;">
        <h2 style="color:#f97316;">${icons[orderStatus] || '🍕'} Order Update</h2>
        <p>Your order <strong>#${orderId}</strong> is now: <strong style="color:#f97316;">${orderStatus}</strong></p>
      </div>`
  });
};