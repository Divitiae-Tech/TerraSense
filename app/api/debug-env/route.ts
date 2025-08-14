import { NextResponse } from 'next/server';

/**
 * This is a temporary API route to debug environment variable loading.
 * It reads the ISDASOIL_USERNAME and ISDASOIL_PASSWORD variables and returns
 * their status (Loaded or Not Loaded).
 * This file should be removed after the debugging is complete.
 */
export async function GET() {
  const username = process.env.ISDASOIL_USERNAME;
  const password = process.env.ISDASOIL_PASSWORD;

  const response = {
    username_status: username ? 'Loaded' : 'Not Loaded',
    password_status: password ? 'Loaded' : 'Not Loaded',
  };

  console.log('Debugging Environment Variables:');
  console.log(`Username Status: ${response.username_status}`);
  console.log(`Password Status: ${response.password_status}`);

  return NextResponse.json(response);
}
