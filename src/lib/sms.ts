import twilio from 'twilio';
import { db } from '../db';
import { notifications } from '../db/schema';

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const fromNumber = process.env.TWILIO_FROM_NUMBER;

const client = twilio(accountSid || 'AC_placeholder', authToken || 'token_placeholder');

export async function sendLeadSMSNotification({
  businessId,
  to,
  businessName,
  leadName,
  leadPhone,
}: {
  businessId: string;
  to: string;
  businessName: string;
  leadName: string;
  leadPhone?: string | null;
}) {
  if (!accountSid || !authToken || !fromNumber) {
    console.warn('Twilio credentials not set. Skipping SMS notification.');
    return;
  }

  try {
    await client.messages.create({
      body: `New lead for ${businessName}: ${leadName}${leadPhone ? ` (${leadPhone})` : ''}. View in LocalAmp dashboard.`,
      from: fromNumber,
      to,
    });

    await db.insert(notifications).values({
      businessId,
      type: 'sms',
      recipient: to,
      status: 'sent',
    });

    console.log(`SMS notification sent to ${to} for lead ${leadName}`);
  } catch (error: any) {
    console.error('Failed to send SMS notification:', error);
    
    await db.insert(notifications).values({
      businessId,
      type: 'sms',
      recipient: to,
      status: 'failed',
      error: error.message || 'Unknown error',
    });
  }
}
