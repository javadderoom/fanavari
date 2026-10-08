import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionUser } from '@/lib/session';

/**
 * POST /api/auth/profile { name?, personnelCode?, avatarUrl? }
 * Only self-editable fields. Department, role and permissions are
 * admin-managed and silently ignored if sent.
 */
export async function POST(req: NextRequest) {
  try {
    const sessionUser = await getSessionUser(req);
    if (!sessionUser) {
      return NextResponse.json({ error: 'وارد نشده‌اید.' }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const data: { name?: string; personnelCode?: string | null; avatarUrl?: string | null } = {};

    if (body.name !== undefined) {
      const name = typeof body.name === 'string' ? body.name.trim() : '';
      if (name.length < 2) {
        return NextResponse.json({ error: 'نام باید حداقل ۲ کاراکتر باشد.' }, { status: 400 });
      }
      data.name = name;
    }
    if (body.personnelCode !== undefined) {
      const code = typeof body.personnelCode === 'string' ? body.personnelCode.trim() : '';
      data.personnelCode = code || null;
    }
    if (body.avatarUrl !== undefined) {
      const url = typeof body.avatarUrl === 'string' ? body.avatarUrl.trim() : '';
      if (url && !/^https?:\/\/.{3,500}$/.test(url)) {
        return NextResponse.json({ error: 'نشانی تصویر معتبر نیست.' }, { status: 400 });
      }
      data.avatarUrl = url || null;
    }

    if (Object.keys(data).length === 0) {
      return NextResponse.json({ error: 'فیلدی برای به‌روزرسانی ارسال نشده است.' }, { status: 400 });
    }

    const updated = await prisma.user.update({
      where: { id: sessionUser.id },
      data,
      select: { id: true, name: true, personnelCode: true, avatarUrl: true },
    });

    return NextResponse.json({ user: updated });
  } catch (error: any) {
    console.error('Error updating profile:', error);
    return NextResponse.json({ error: 'خطا در به‌روزرسانی مشخصات' }, { status: 500 });
  }
}
