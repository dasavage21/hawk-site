import { Resend } from 'resend';
import { db } from '../db';
import { notifications } from '../db/schema';

const resend = new Resend(process.env.RESEND_API_KEY || 're_placeholder');

export async function sendLeadNotification({
  businessId,
  to,
  businessName,
  leadName,
  leadEmail,
  leadPhone,
  leadMessage,
}: {
  businessId: string;
  to: string;
  businessName: string;
  leadName: string;
  leadEmail?: string | null;
  leadPhone?: string | null;
  leadMessage?: string | null;
}) {
  if (!process.env.RESEND_API_KEY) {
    console.warn('RESEND_API_KEY is not set. Skipping email notification.');
    return;
  }

  try {
    const { error } = await resend.emails.send({
      from: 'LocalAmp <notifications@localamp.ai>',
      to: [to],
      subject: `New Lead for ${businessName}: ${leadName}`,
      html: `
        <h1>You have a new lead!</h1>
        <p><strong>Business:</strong> ${businessName}</p>
        <p><strong>Name:</strong> ${leadName}</p>
        <p><strong>Email:</strong> ${leadEmail || 'Not provided'}</p>
        <p><strong>Phone:</strong> ${leadPhone || 'Not provided'}</p>
        <p><strong>Message:</strong></p>
        <p>${leadMessage || 'No message provided'}</p>
        <hr />
        <p><a href="${process.env.APP_URL || 'https://localamp.ai'}/dashboard">View in Dashboard</a></p>
      `,
    });

    if (error) {
      throw error;
    }

    await db.insert(notifications).values({
      businessId,
      type: 'email',
      recipient: to,
      status: 'sent',
    });

    console.log(`Email notification sent to ${to} for lead ${leadName}`);
  } catch (error: any) {
    console.error('Failed to send email notification:', error);
    
    await db.insert(notifications).values({
      businessId,
      type: 'email',
      recipient: to,
      status: 'failed',
      error: error.message || 'Unknown error',
    });
  }
}
