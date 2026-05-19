const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function main() {
  console.log('🚀 Wiping database and setting up WEEGOLS CHICKEN INATO POS...\n');

  // ===== 0. CLEAN WIPE DATABASE =====
  console.log('🧹 Step 0: Cleaning database...');
  await prisma.auditLog.deleteMany({});
  await prisma.expense.deleteMany({});
  await prisma.systemSetting.deleteMany({});
  await prisma.notification.deleteMany({});
  await prisma.orderItem.deleteMany({});
  await prisma.order.deleteMany({});
  await prisma.inventoryLog.deleteMany({});
  await prisma.comboOption.deleteMany({});
  await prisma.productAddon.deleteMany({});
  await prisma.product.deleteMany({});
  await prisma.supplier.deleteMany({});
  await prisma.category.deleteMany({});
  await prisma.user.deleteMany({});
  await prisma.tenant.deleteMany({});
  console.log('✅ Database cleaned successfully!\n');

  // ===== 1. CREATE TENANT =====
  console.log('📦 Step 1: Creating Tenant...');
  const tenant = await prisma.tenant.create({
    data: {
      name: "Weegol's Chicken Inato",
      slug: 'weegols',
      logo: '/logo.png',
      favicon: '/favicon.png',
      primaryColor: '#16a34a', // Green from logo
      secondaryColor: '#dc2626' // Red from logo
    }
  });
  console.log(`✅ Tenant Created: "${tenant.name}" (ID: ${tenant.id})\n`);

  // ===== 2. CREATE SUPERADMIN (no tenant) =====
  console.log('👑 Step 2: Creating SuperAdmin...');
  const superadminPass = await bcrypt.hash('superadmin123', 12);
  const superadmin = await prisma.user.create({
    data: {
      email: 'superadmin@elevatepos.com',
      password: superadminPass,
      name: 'Master SuperAdmin',
      role: 'superadmin',
      active: true,
      tenantId: null
    }
  });
  console.log(`✅ SuperAdmin Created: ${superadmin.email}\n`);

  // ===== 3. CREATE ADMIN USER FOR TENANT =====
  console.log('🔑 Step 3: Creating Admin for Weegols...');
  const adminPass = await bcrypt.hash('admin123', 12);
  const admin = await prisma.user.create({
    data: {
      tenantId: tenant.id,
      email: 'admin@weegols.com',
      password: adminPass,
      name: 'Store Manager',
      role: 'admin',
      active: true
    }
  });
  console.log(`✅ Admin Created: ${admin.email}\n`);

  // ===== 4. SEED WEEGOLS CATEGORIES & PRODUCTS =====
  console.log('🌱 Step 4: Seeding Chicken Inato Products...');
  const categoriesData = [
    {
      name: 'Chicken Inato Meals', icon: '🍗', description: 'Classic grilled chicken meals',
      products: [
        { name: 'Paa (Leg/Thigh) with Rice', price: 115, description: 'Grilled chicken leg and thigh piece with unlimited rice', stock: 999 },
        { name: 'Pecho (Breast/Wing) with Rice', price: 125, description: 'Grilled chicken breast and wing piece with unlimited rice', stock: 999 },
        { name: 'Half Chicken Meal', price: 210, description: 'Half grilled chicken inato with rice', stock: 999 }
      ]
    },
    {
      name: 'Sizzling & Extras', icon: '🔥', description: 'Sizzling plates and side dishes',
      products: [
        { name: 'Sizzling Sisig', price: 150, description: 'Classic pork sisig on a sizzling plate', stock: 50 },
        { name: 'Atchara (Papaya Relish)', price: 20, description: 'Sweet and sour pickled papaya', stock: 100 },
        { name: 'Extra Rice', price: 25, description: 'One cup of steamed rice', stock: 999 }
      ]
    },
    {
      name: 'Beverages', icon: '🥤', description: 'Refreshing drinks to pair with meals',
      products: [
        { name: 'Calamansi Juice', price: 45, description: 'Freshly squeezed calamansi juice', stock: 999 },
        { name: 'Iced Tea', price: 35, description: 'House blend iced tea', stock: 999 },
        { name: 'Softdrinks', price: 30, description: 'Assorted canned sodas', stock: 999 }
      ]
    }
  ];

  for (const catData of categoriesData) {
    const { products, ...catFields } = catData;
    const category = await prisma.category.create({
      data: {
        tenantId: tenant.id,
        ...catFields,
        active: true
      }
    });
    console.log(`   ✅ Category: ${category.name}`);

    for (const prodData of products) {
      await prisma.product.create({
        data: {
          tenantId: tenant.id,
          categoryId: category.id,
          ...prodData,
          available: true
        }
      });
      console.log(`      🔸 ${prodData.name} - ₱${prodData.price}`);
    }
  }

  // ===== 5. CREATE DEFAULT SYSTEM SETTINGS =====
  console.log('\n⚙️  Step 5: Creating System Settings...');
  const settings = [
    { key: 'points_rate', value: '500' },
    { key: 'store_hours', value: '10AM - 10PM' },
    { key: 'order_prefix', value: 'WG' } // Weegols
  ];
  for (const s of settings) {
    await prisma.systemSetting.create({
      data: { tenantId: tenant.id, ...s }
    });
  }
  console.log('   ✅ System settings created\n');

  // ===== DONE =====
  console.log('═══════════════════════════════════════════');
  console.log('🎉 WEEGOLS SETUP COMPLETE!');
  console.log('═══════════════════════════════════════════');
  console.log(`\n📧 SuperAdmin Login:`);
  console.log(`   Email:    superadmin@elevatepos.com`);
  console.log(`   Password: superadmin123`);
  console.log(`\n📧 Admin Login (Weegols):`);
  console.log(`   Email:    admin@weegols.com`);
  console.log(`   Password: admin123`);
  console.log('═══════════════════════════════════════════');
}

main()
  .catch((e) => {
    console.error('❌ Setup failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
