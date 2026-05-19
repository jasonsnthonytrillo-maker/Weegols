const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log("Updating primary color for tenant 'weegols' to Weegol's signature Red (#e21b22)...");
  
  const updated = await prisma.tenant.update({
    where: { slug: 'weegols' },
    data: {
      primaryColor: '#e21b22', // Red from Weegol's brand logo
      secondaryColor: '#16a34a' // Green as secondary color
    }
  });

  console.log("Tenant updated successfully! New primaryColor:", updated.primaryColor);
}

main()
  .catch(e => console.error("Update failed:", e))
  .finally(() => prisma.$disconnect());
