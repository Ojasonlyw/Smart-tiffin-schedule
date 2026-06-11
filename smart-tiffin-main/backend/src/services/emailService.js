// ============ src/services/emailService.js ============
const nodemailer = require('nodemailer');

// Create transporter
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

// Send email function
const sendEmail = async (options) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent:', info.messageId);
    return info;
  } catch (error) {
    console.error('Email sending failed:', error);
    throw error;
  }
};

// Subscription confirmation email
const sendSubscriptionConfirmation = async (user, subscription, provider) => {
  const html = `
    <h2>Subscription Confirmed!</h2>
    <p>Hi ${user.name},</p>
    <p>Your subscription to <strong>${provider.businessName}</strong> has been confirmed.</p>
    <h3>Subscription Details:</h3>
    <ul>
      <li>Plan Type: ${subscription.planType}</li>
      <li>Meal Type: ${subscription.mealType}</li>
      <li>Start Date: ${new Date(subscription.startDate).toLocaleDateString()}</li>
      <li>End Date: ${new Date(subscription.endDate).toLocaleDateString()}</li>
      <li>Amount: ₹${subscription.amount}</li>
    </ul>
    <p>Thank you for choosing Smart Tiffin Scheduler!</p>
  `;

  await sendEmail({
    to: user.email,
    subject: 'Subscription Confirmation - Smart Tiffin Scheduler',
    html
  });
};

// Meal reminder email
const sendMealReminder = async (user, meal, provider) => {
  const html = `
    <h2>Meal Reminder</h2>
    <p>Hi ${user.name},</p>
    <p>This is a reminder that your ${meal.type} is scheduled for today from <strong>${provider.businessName}</strong>.</p>
    <p>Meal: ${meal.name}</p>
    <p>Time: ${meal.time}</p>
    <p>Enjoy your meal!</p>
  `;

  await sendEmail({
    to: user.email,
    subject: 'Meal Reminder - Smart Tiffin Scheduler',
    html
  });
};

// Subscription expiring email
const sendSubscriptionExpiryReminder = async (user, subscription, provider) => {
  const html = `
    <h2>Subscription Expiring Soon</h2>
    <p>Hi ${user.name},</p>
    <p>Your subscription to <strong>${provider.businessName}</strong> will expire on ${new Date(subscription.endDate).toLocaleDateString()}.</p>
    <p>Renew now to continue enjoying delicious meals!</p>
  `;

  await sendEmail({
    to: user.email,
    subject: 'Subscription Expiring - Smart Tiffin Scheduler',
    html
  });
};

// Provider approval email
const sendProviderApproval = async (provider, user) => {
  const html = `
    <h2>Your Provider Listing is Approved!</h2>
    <p>Hi ${user.name},</p>
    <p>Congratulations! Your tiffin provider listing <strong>${provider.businessName}</strong> has been approved.</p>
    <p>You can now start receiving subscriptions from customers.</p>
    <p>Best of luck!</p>
  `;

  await sendEmail({
    to: user.email,
    subject: 'Provider Approval - Smart Tiffin Scheduler',
    html
  });
};

module.exports = {
  sendEmail,
  sendSubscriptionConfirmation,
  sendMealReminder,
  sendSubscriptionExpiryReminder,
  sendProviderApproval
};

