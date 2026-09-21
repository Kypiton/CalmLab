import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const orders = await prisma.order.findMany({
      where: { userId: user.id },
      include: { items: true },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json({ orders }, { headers: { 'Cache-Control': 'private, no-store' } });
  } catch (error) {
    console.error('Loading orders failed:', error);
    return NextResponse.json({ error: 'Orders not available' }, { status: 500 });
  }
}
