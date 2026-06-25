import { NextResponse } from 'next/server';
import { resend } from '@/lib/resend';

export async function GET() {
  try {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      return NextResponse.json({
        success: false,
        error: 'RESEND_API_KEY environment variable is missing'
      }, { status: 500 });
    }

    const { data, error } = await resend.emails.send({
      from: 'Grainline Test <onboarding@resend.dev>',
      to: 'grainline19@gmail.com',
      subject: 'Grainline Email Test',
      text: 'This is a successful test email from Grainline.',
      html: '<p>This is a successful test email from <strong>Grainline</strong>.</p>',
    });

    if (error) {
      console.error('Resend API Error:', error);
      return NextResponse.json({
        success: false,
        error: error.message
      }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      data
    });
  } catch (err: any) {
    console.error('Unhandled Exception in test-email route:', err);
    return NextResponse.json({
      success: false,
      error: err.message || 'Internal Server Error'
    }, { status: 500 });
  }
}
export const dynamic = 'force-dynamic';
