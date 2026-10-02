import { prisma } from '../src/lib/prisma';
import { Permissions, ROLE_PRESETS } from '../src/lib/permissions';
import { MOCK_PROCESSES, SYSTEM_TOOLS, ORGANIZATIONS } from '../src/data/mock-processes';


async function main() {
  console.log('Seeding Fanavari PostgreSQL database...');

  // 1. Seed Super Admin User (The User)
  const superAdmin = await prisma.user.upsert({
    where: { email: 'admin@fanavari.local' },
    update: {},
    create: {
      email: 'admin@fanavari.local',
      name: 'مدیر ارشد سامانه (Super Admin)',
      roleName: ROLE_PRESETS.SUPER_ADMIN.name,
      permissions: ROLE_PRESETS.SUPER_ADMIN.bitfield,
      avatarUrl: 'https://api.dicebear.com/7.x/bottts/svg?seed=admin',
    },
  });

  // 2. Seed Editor User
  const editorUser = await prisma.user.upsert({
    where: { email: 'editor@fanavari.local' },
    update: {},
    create: {
      email: 'editor@fanavari.local',
      name: 'کارشناس تدوین فرایند',
      roleName: ROLE_PRESETS.PROCESS_EDITOR.name,
      permissions: ROLE_PRESETS.PROCESS_EDITOR.bitfield,
      avatarUrl: 'https://api.dicebear.com/7.x/bottts/svg?seed=editor',
    },
  });

  // 3. Seed Viewer User
  await prisma.user.upsert({
    where: { email: 'viewer@fanavari.local' },
    update: {},
    create: {
      email: 'viewer@fanavari.local',
      name: 'پرسنل سازمانی (کاربر عادی)',
      roleName: ROLE_PRESETS.EMPLOYEE_VIEWER.name,
      permissions: ROLE_PRESETS.EMPLOYEE_VIEWER.bitfield,
      avatarUrl: 'https://api.dicebear.com/7.x/bottts/svg?seed=viewer',
    },
  });

  // 4. Seed System Tools
  for (const tool of SYSTEM_TOOLS) {
    await prisma.systemTool.upsert({
      where: { slug: tool.slug },
      update: {
        name: tool.name,
        category: tool.category,
        icon: tool.icon,
        description: tool.description,
        websiteUrl: tool.websiteUrl,
      },
      create: {
        slug: tool.slug,
        name: tool.name,
        category: tool.category,
        icon: tool.icon,
        description: tool.description,
        websiteUrl: tool.websiteUrl,
      },
    });
  }

  // 5. Seed Departments / Organizations
  for (const org of ORGANIZATIONS) {
    await prisma.department.upsert({
      where: { slug: org.slug },
      update: {
        name: org.name,
      },
      create: {
        slug: org.slug,
        name: org.name,
        icon: 'Building',
      },
    });
  }

  // 6. Seed Processes and Steps
  for (const proc of MOCK_PROCESSES) {
    const existing = await prisma.process.findUnique({
      where: { slug: proc.slug },
    });

    if (!existing) {
      const systemTool = await prisma.systemTool.findUnique({
        where: { slug: proc.targetSystemSlug },
      });
      const department = await prisma.department.findFirst({
        where: { name: proc.departmentName },
      });

      await prisma.process.create({
        data: {
          slug: proc.slug,
          title: proc.title,
          description: proc.description,
          scope: proc.scope,
          category: proc.category,
          estimatedMinutes: proc.estimatedMinutes,
          targetSystem: proc.targetSystem,
          targetUrl: proc.targetUrl,
          authorId: superAdmin.id,
          systemToolId: systemTool?.id,
          departmentId: department?.id,
          steps: {
            create: proc.steps.map((step) => ({
              orderIndex: step.orderIndex,
              stepKey: step.stepKey,
              title: step.title,
              contentMarkdown: step.contentMarkdown,
              stepType: step.stepType,
              copyableFields: step.copyableFields ? (step.copyableFields as any) : undefined,
              hotspots: step.hotspots ? (step.hotspots as any) : undefined,
              errorGuides: {
                create: (step.errorGuides || []).map((err) => ({
                  errorCode: err.errorCode,
                  errorTitle: err.errorTitle,
                  solutionMarkdown: err.solution,
                  screenshotUrl: err.screenshotUrl,
                })),
              },
            })),
          },
        },
      });
    }
  }

  console.log('Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
