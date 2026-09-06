import { prisma } from '../packages/database/src/index';
import bcrypt from 'bcryptjs';
import fs from 'node:fs';
import path from 'node:path';

async function main() {
  const newPassword = process.argv[2] || process.env.NEW_ADMIN_PASSWORD;
  const adminEmail = process.argv[3] || process.env.ADMIN_EMAIL || 'admin@axummarket.et';

  if (!newPassword || newPassword.trim().length < 6) {
    console.error('Error: Please provide a valid password of at least 6 characters.');
    console.error('\nUsage:');
    console.error('  npm run admin:password "<new_password>"');
    console.error('  npm run admin:password "<new_password>" "<optional_admin_email>"');
    process.exit(1);
  }

  const passwordHash = await bcrypt.hash(newPassword.trim(), 10);

  // Find admin user
  const admin = await prisma.user.findFirst({
    where: {
      OR: [
        { email: adminEmail },
        { role: 'ADMIN' },
      ],
    },
  });

  if (!admin) {
    console.error(`Error: No administrator found for email "${adminEmail}" or role ADMIN.`);
    console.log('Creating new administrator account...');
    await prisma.user.create({
      data: {
        fullName: 'System Administrator',
        email: adminEmail,
        passwordHash,
        phone: '+251911000001',
        role: 'ADMIN',
        status: 'ACTIVE',
        region: 'Addis Ababa',
        city: 'Addis Ababa',
      },
    });
    console.log(`✓ New Administrator account created: ${adminEmail}`);
  } else {
    await prisma.user.update({
      where: { id: admin.id },
      data: {
        passwordHash,
        email: adminEmail,
      },
    });
    console.log(`✓ Successfully updated password for Administrator: ${admin.email} (ID: ${admin.id})`);
  }

  // If local SQLite databases exist, synchronize copies
  const canonicalDb = path.resolve('packages/database/prisma/dev.db');
  if (fs.existsSync(canonicalDb)) {
    const targets = [
      path.resolve('dev.db'),
      path.resolve('packages/database/dev.db'),
      path.resolve('apps/web/prisma/dev.db'),
    ];
    for (const target of targets) {
      try {
        fs.copyFileSync(canonicalDb, target);
      } catch {
        // ignore if path does not exist
      }
    }
  }

  console.log('\nYou can now log in to the admin console with:');
  console.log(`  Email:    ${adminEmail}`);
  console.log(`  Password: ${newPassword.trim()}`);
}

main()
  .catch((err) => {
    console.error('Failed to change admin password:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

