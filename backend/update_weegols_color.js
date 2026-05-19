const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log("Updating name and branding colors for tenant 'weegols' in the database...");
  
  const updated = await prisma.tenant.update({
    where: { slug: 'weegols' },
    data: {
      name: "Weegol's", // Removed "Chicken Inato"
      primaryColor: '#e21b22', // Red from Weegol's brand logo
      secondaryColor: '#16a34a' // Green as secondary color
    }
  });

  console.log("Tenant updated successfully! New Name:", updated.name);
}

main()
  .catch(e => console.error("Update failed:", e))
  .finally(() => prisma.$disconnect());
