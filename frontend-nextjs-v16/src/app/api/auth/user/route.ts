/**
 * GET /api/auth/user
 *
 * Route Handler to get current authenticated user
 * This is called from client-side to fetch user data
 */

import { NextResponse } from 'next/server';
import { verifySession } from '@/lib/auth/dal';

export async function GET() {
  try {
    const { isAuth, user } = await verifySession();

    if (!isAuth || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    return NextResponse.json({ user });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch user' },
      { status: 500 }
    );
  }
}
