import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Permissions, hasPermission } from '@/lib/permissions';

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function PUT(req: NextRequest, { params }: RouteContext) {
  try {
    const { id } = await params;
    const body = await req.json();
    const userPermissions = Number(req.headers.get('x-user-permissions') || '0');

    // Discord-style bitfield check: Requires EDIT_PROCESSES or ADMINISTRATOR
    if (!hasPermission(userPermissions, Permissions.EDIT_PROCESSES)) {
      return NextResponse.json(
        { error: 'Forbidden: Insufficient permissions (EDIT_PROCESSES required)' },
        { status: 403 }
      );
    }

    const { title, description, scope, category, targetSystem, targetUrl, estimatedMinutes, schedule } = body;

    const updated = await prisma.process.update({
      where: { id },
      data: {
        title,
        description,
        scope,
        category,
        targetSystem,
        targetUrl,
        estimatedMinutes: Number(estimatedMinutes) || 10,
        ...(schedule !== undefined ? { schedule } : {}),
      },
    });

    return NextResponse.json(updated);
  } catch (error: any) {
    console.error('Error updating process:', error);
    return NextResponse.json({ error: error.message || 'Failed to update process' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: RouteContext) {
  try {
    const { id } = await params;
    const userPermissions = Number(req.headers.get('x-user-permissions') || '0');

    // Discord-style bitfield check: Requires DELETE_PROCESSES or ADMINISTRATOR
    if (!hasPermission(userPermissions, Permissions.DELETE_PROCESSES)) {
      return NextResponse.json(
        { error: 'Forbidden: Insufficient permissions (DELETE_PROCESSES required)' },
        { status: 403 }
      );
    }

    await prisma.process.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: 'Process deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting process:', error);
    return NextResponse.json({ error: error.message || 'Failed to delete process' }, { status: 500 });
  }
}
