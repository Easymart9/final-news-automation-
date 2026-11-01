import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export const dynamic = 'force-dynamic';

const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000;
const RATE_LIMIT_MAX = 5;
const submissions = new Map<string, number[]>();

function isRateLimited(ip: string, now: number): boolean {
  const recent = (submissions.get(ip) || []).filter(timestamp => now - timestamp < RATE_LIMIT_WINDOW_MS);
  if (recent.length >= RATE_LIMIT_MAX) {
    submissions.set(ip, recent);
    return true;
  }
  recent.push(now);
  submissions.set(ip, recent);
  return false;
}

export async function POST(request: Request) {
  const origin = request.headers.get('origin');
  if (origin) {
    const requestHost = request.headers.get('host');
    let originUrl: URL;
    try {
      originUrl = new URL(origin);
    } catch {
      return NextResponse.json({ success: false, message: 'Invalid form origin.' }, { status: 403 });
    }
    if (!requestHost || !['https:', 'http:'].includes(originUrl.protocol) ||
        originUrl.host.toLowerCase() !== requestHost.toLowerCase()) {
      return NextResponse.json({ success: false, message: 'Invalid form origin.' }, { status: 403 });
    }
  }

  const clientIp = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
  if (isRateLimited(clientIp, Date.now())) {
    return NextResponse.json(
      { success: false, message: 'Too many submissions. Please try again later.' },
      { status: 429, headers: { 'Retry-After': '900' } }
    );
  }

  let body: unknown;
  try {
    const rawBody = await request.text();
    if (rawBody.length > 12_000) {
      return NextResponse.json({ success: false, message: 'The message is too long.' }, { status: 413 });
    }
    body = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ success: false, message: 'Invalid form submission.' }, { status: 400 });
  }

  if (typeof body !== 'object' || body === null) {
    return NextResponse.json({ success: false, message: 'Invalid form submission.' }, { status: 400 });
  }
  const fields = body as Record<string, unknown>;
  if (typeof fields.website === 'string' && fields.website.trim()) {
    return NextResponse.json({ success: true });
  }

  const name = typeof fields.name === 'string' ? fields.name.trim() : '';
  const email = typeof fields.email === 'string' ? fields.email.trim() : '';
  const message = typeof fields.message === 'string' ? fields.message.trim() : '';
  const allowedSubjects = new Set([
    'General Editorial Feedback',
    'Factual Correction Submission',
    'Research Preprint / Lab Announcement',
    'Syndication & Licensing Inquiry'
  ]);
  const subject = typeof fields.subject === 'string' && allowedSubjects.has(fields.subject)
    ? fields.subject
    : '';

  if (!name || name.length > 120 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
      email.length > 254 || !subject || !message || message.length > 10_000) {
    return NextResponse.json({ success: false, message: 'Please provide valid contact details and a message.' }, { status: 400 });
  }

  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASSWORD, CONTACT_EMAIL } = process.env;
  const port = Number(SMTP_PORT);
  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASSWORD || !CONTACT_EMAIL || !Number.isInteger(port) || port < 1 || port > 65535) {
    return NextResponse.json(
      { success: false, message: 'Contact delivery is not configured. Please use the published editorial email address.' },
      { status: 503 }
    );
  }

  try {
    const transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port,
      secure: port === 465,
      requireTLS: port !== 465,
      auth: { user: SMTP_USER, pass: SMTP_PASSWORD },
      connectionTimeout: 10_000,
      greetingTimeout: 10_000,
      socketTimeout: 15_000
    });
    await transporter.sendMail({
      from: SMTP_USER,
      to: CONTACT_EMAIL,
      replyTo: { name, address: email },
      subject: `[World Bulletin] ${subject}`,
      text: `Name: ${name}\nEmail: ${email}\nSubject: ${subject}\n\n${message}`
    });
    return NextResponse.json({ success: true, message: 'Your inquiry was delivered to the editorial desk.' });
  } catch (error) {
    console.error('Contact message delivery failed.', error instanceof Error ? error.message : 'Unknown SMTP error');
    return NextResponse.json(
      { success: false, message: 'We could not deliver your message. Please try again or email the editorial desk directly.' },
      { status: 502 }
    );
  }
}
