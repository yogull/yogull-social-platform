import { MailService } from '@sendgrid/mail';
import { verificationEmailTemplates } from './email-templates';

console.log("=== Email Service Debug ===");
console.log("SENDGRID_API_KEY present:", !!process.env.SENDGRID_API_KEY);
console.log("Environment NODE_ENV:", process.env.NODE_ENV);

if (!process.env.SENDGRID_API_KEY) {
  console.warn("SENDGRID_API_KEY environment variable not set - email functionality disabled");
} else {
  console.log("SendGrid API key loaded successfully - Email service operational");
}

const mailService = new MailService();
if (process.env.SENDGRID_API_KEY) {
  mailService.setApiKey(process.env.SENDGRID_API_KEY);
}

interface ThankYouEmailParams {
  donorEmail: string;
  donorName?: string;
  donationAmount: number;
  donationDate: string;
}

async function sendThankYouEmail(params: ThankYouEmailParams): Promise<boolean> {
  if (!process.env.SENDGRID_API_KEY) {
    console.log("SendGrid not configured - skipping thank you email");
    return false;
  }

  try {
    const { donorEmail, donorName, donationAmount, donationDate } = params;
    
    const emailContent = {
      to: donorEmail,
      from: {
        email: 'yogull.com@gmail.com',
        name: 'Yogull Community Team'
      },
      subject: '💚 Thank You for Your Support!',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
          <div style="background: linear-gradient(135deg, #ec4899, #8b5cf6); padding: 30px; border-radius: 12px; text-align: center; margin-bottom: 30px;">
            <h1 style="color: white; margin: 0; font-size: 28px; font-weight: bold;">
              Thank You! 💚
            </h1>
            <p style="color: white; margin: 10px 0 0 0; font-size: 18px; opacity: 0.9;">
              Your support means everything to us
            </p>
          </div>
          
          <div style="background: white; padding: 30px; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
            <p style="color: #333; font-size: 18px; line-height: 1.6; margin-bottom: 20px;">
              ${donorName ? `Dear ${donorName},` : 'Dear Friend,'}
            </p>
            
            <p style="color: #333; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
              We are incredibly grateful for your generous donation of <strong>£${donationAmount.toFixed(2)}</strong> to Yogull. Your support helps us continue our mission of providing a people-centered community where everyone can find guidance, support, and connection.
            </p>
            
            <div style="background: #f0f9ff; border-left: 4px solid #0ea5e9; padding: 20px; margin: 25px 0; border-radius: 8px;">
              <h3 style="color: #0ea5e9; margin: 0 0 10px 0; font-size: 18px;">
                Your Impact
              </h3>
              <p style="color: #333; margin: 0; line-height: 1.6;">
                Your donation directly supports our platform's development, community features, and helps us provide free access to networking resources for people who need it most.
              </p>
            </div>
            
            <p style="color: #333; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
              Together, we're building a community that's truly <strong>for the people, by the people</strong> - away from corporate control and profit-driven agendas.
            </p>
            
            <div style="background: #fef3c7; border: 1px solid #f59e0b; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <p style="color: #92400e; margin: 0; font-size: 14px; text-align: center;">
                <strong>Donation Details:</strong><br>
                Amount: £${donationAmount.toFixed(2)} • Date: ${donationDate}
              </p>
            </div>
            
            <p style="color: #333; font-size: 16px; line-height: 1.6; margin-bottom: 25px;">
              Thank you for believing in our vision of accessible, community-driven networking. Your support makes a real difference in people's lives.
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="https://yogull.com" style="background: linear-gradient(135deg, #ec4899, #8b5cf6); color: white; padding: 12px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
                Visit Yogull
              </a>
            </div>
          </div>
          
          <div style="text-align: center; margin-top: 30px; padding: 20px;">
            <p style="color: #666; font-size: 14px; margin: 0;">
              With deepest gratitude,<br>
              <strong>The Yogull Community Team</strong>
            </p>
            <p style="color: #999; font-size: 12px; margin: 15px 0 0 0;">
              Yogull Community<br>
              yogull.com@gmail.com
            </p>
          </div>
        </div>
      `,
      text: `
Dear ${donorName || 'Friend'},

Thank you so much for your generous donation of £${donationAmount.toFixed(2)} to Yogull!

Your support helps us continue our mission of providing a people-centered community platform where everyone can find guidance, support, and connection. Together, we're building a community that's truly for the people, by the people.

Your donation directly supports:
- Platform development and maintenance
- Community features and support systems
- Free access to networking resources
- Business directory and advertising platform

Donation Details:
Amount: £${donationAmount.toFixed(2)}
Date: ${donationDate}

Thank you for believing in our vision of accessible, community-driven networking. Your support makes a real difference in people's lives.

With deepest gratitude,
The Yogull Community Team

Yogull Community
Visit us at: https://yogull.com
Contact: yogull.com@gmail.com
      `
    };

    const response = await mailService.send(emailContent);
    console.log(`✅ Thank you email sent successfully to ${donorEmail}`);
    console.log('SendGrid response:', response[0].statusCode, response[0].headers);
    return true;
    
  } catch (error: any) {
    console.error('❌ Failed to send thank you email:', error);
    console.error('SendGrid error details:', error.response?.body || error.message);
    return false;
  }
}

async function sendWelcomeEmail(userEmail: string, userName: string): Promise<boolean> {
  if (!process.env.SENDGRID_API_KEY) {
    console.log("SendGrid not configured - skipping welcome email");
    return false;
  }

  try {
    const emailContent = {
      to: userEmail,
      from: {
        email: 'yogull.com@gmail.com',
        name: 'Yogull Community Team'
      },
      subject: '🌟 Welcome to Yogull - Your Journey Starts Here!',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
          <div style="background: linear-gradient(135deg, #ec4899, #8b5cf6); padding: 30px; border-radius: 12px; text-align: center; margin-bottom: 30px;">
            <h1 style="color: white; margin: 0; font-size: 28px; font-weight: bold;">
              Welcome to Yogull! 🌟
            </h1>
            <p style="color: white; margin: 10px 0 0 0; font-size: 18px; opacity: 0.9;">
              Community Networking - Connect with Real People
            </p>
          </div>
          
          <div style="background: white; padding: 30px; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
            <p style="color: #333; font-size: 18px; line-height: 1.6; margin-bottom: 20px;">
              Hi ${userName},
            </p>
            
            <p style="color: #333; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
              Welcome to Yogull! You've just joined a community that puts <strong>people first</strong> - not profits, not corporations, just genuine connections for real people to network, discuss, and grow together.
            </p>
            
            <div style="background: #f0f9ff; border-left: 4px solid #0ea5e9; padding: 20px; margin: 25px 0; border-radius: 8px;">
              <h3 style="color: #0ea5e9; margin: 0 0 10px 0; font-size: 18px;">
                What You Can Do Now
              </h3>
              <ul style="color: #333; margin: 0; padding-left: 20px; line-height: 1.6;">
                <li>Connect with community members in discussion forums</li>
                <li>Share your experiences on your profile wall</li>
                <li>Discover local businesses in our directory</li>
                <li>Access business advertising opportunities</li>
                <li>Chat with other members about topics that matter</li>
                <li>Build your professional and personal network</li>
              </ul>
            </div>
            
            <p style="color: #333; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
              Unlike other platforms controlled by big tech and profit-driven entities, Yogull is built <strong>by the people, for the people</strong>. Your data stays yours, your privacy is protected, and our community genuinely cares about giving ordinary people a voice.
            </p>
            
            <div style="background: #fef3c7; border: 1px solid #f59e0b; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <p style="color: #92400e; margin: 0; font-size: 14px; text-align: center;">
                <strong>💡 Pro Tip:</strong> Start by visiting your dashboard to explore all features and connect with community members.
              </p>
            </div>
            
            <p style="color: #333; font-size: 16px; line-height: 1.6; margin-bottom: 25px;">
              If you have any questions or need support, don't hesitate to reach out. We're here to help you on your networking journey every step of the way.
            </p>
            
            <div style="text-align: center; margin: 30px 0
