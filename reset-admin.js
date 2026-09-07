const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function resetAdminPassword() {
  try {
    const adminEmail = 'admin@axummarket.et';
    const newPassword = 'AdminSecure2026!';
    
    console.log(`Looking for admin user: ${adminEmail}...`);
    
    const user = await prisma.user.findUnique({
      where: { email: adminEmail }
    });

    if (!user) {
      console.error("Error: Admin user not found in the database. Have you logged in at least once?");
      process.exit(1);
    }

    console.log("Generating new security hash...");
    const hash = await bcrypt.hash(newPassword, 10);
    
    await prisma.user.update({
      where: { email: adminEmail },
      data: { passwordHash: hash }
    });

    console.log("=========================================");
    console.log("✅ SUCCESS: Admin password has been reset!");
    console.log(`📧 Email: ${adminEmail}`);
    console.log(`🔑 Password: ${newPassword}`);
    console.log("=========================================");
    console.log("You can now log in and change this to something else from the Admin Dashboard.");
    
  } catch (error) {
    console.error("An error occurred while resetting the password:");
    console.error(error);
  } finally {
    await prisma.$disconnect();
  }
}

resetAdminPassword();
