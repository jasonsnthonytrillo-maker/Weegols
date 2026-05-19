const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function main() {
  console.log('🚀 Setting up fresh database...\n');

  // ===== 1. CREATE TENANT =====
  console.log('📦 Step 1: Creating Tenant...');
  const tenant = await prisma.tenant.create({
    data: {
      name: 'Hometown Brew',
      slug: 'hometownbrew',
      primaryColor: '#f97316',
      secondaryColor: '#fbbf24'
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
  console.log('🔑 Step 3: Creating Admin for Hometown Brew...');
  const adminPass = await bcrypt.hash('admin123', 12);
  const admin = await prisma.user.create({
    data: {
      tenantId: tenant.id,
      email: 'admin@hometownbrew.com',
      password: adminPass,
      name: 'Store Manager',
      role: 'admin',
      active: true
    }
  });
  console.log(`✅ Admin Created: ${admin.email}\n`);

  // ===== 4. SEED CATEGORIES & PRODUCTS =====
  console.log('🌱 Step 4: Seeding Products...');
  const categoriesData = [
    {
      name: 'Coffee Classics', icon: '☕', description: 'Freshly brewed espresso-based drinks',
      products: [
        { name: 'Espresso', price: 85, description: 'Pure, concentrated coffee shot', stock: 999 },
        { name: 'Americano', price: 120, description: 'Espresso with hot water', stock: 999 },
        { name: 'Cafe Latte', price: 145, description: 'Espresso with steamed milk and thin foam', stock: 999 },
        { name: 'Cappuccino', price: 145, description: 'Espresso with balanced steamed milk and foam', stock: 999 },
        { name: 'Caramel Macchiato', price: 165, description: 'Vanilla-flavored milk marked with espresso and caramel', stock: 999 }
      ]
    },
    {
      name: 'Iced Specialties', icon: '🧊', description: 'Refreshing cold coffee and more',
      products: [
        { name: 'Iced Americano', price: 130, description: 'Espresso over ice', stock: 999 },
        { name: 'Iced Cafe Latte', price: 155, description: 'Chilled espresso and milk over ice', stock: 999 },
        { name: 'Cold Brew', price: 140, description: 'Slow-steeped for 18 hours for maximum smoothness', stock: 999 },
        { name: 'Matcha Latte', price: 170, description: 'Ceremonial grade matcha with creamy milk', stock: 999 }
      ]
    },
    {
      name: 'Bakery & Pastries', icon: '🥐', description: 'Handcrafted daily baked goods',
      products: [
        { name: 'Butter Croissant', price: 95, description: 'Flaky, buttery French classic', stock: 24 },
        { name: 'Pain au Chocolat', price: 110, description: 'Croissant dough with dark chocolate batons', stock: 20 },
        { name: 'Blueberry Muffin', price: 85, description: 'Soft muffin bursting with fresh blueberries', stock: 15 },
        { name: 'Chocolate Chip Cookie', price: 65, description: 'Chewy cookie with premium chocolate chunks', stock: 30 }
      ]
    },
    {
      name: 'Sandwiches & Savory', icon: '🥪', description: 'Hot and delicious bites',
      products: [
        { name: 'Ham & Cheese Croissant', price: 185, description: 'Savory ham and melted emmental in a croissant', stock: 12 },
        { name: 'Tuna Melt', price: 195, description: 'Warm tuna salad with melted cheddar on sourdough', stock: 10 },
        { name: 'Chicken Pesto Sandwich', price: 210, description: 'Grilled chicken with basil pesto and mozzarella', stock: 8 }
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
    { key: 'store_hours', value: '8AM - 10PM' },
    { key: 'order_prefix', value: 'HB' }
  ];
  for (const s of settings) {
    await prisma.systemSetting.create({
      data: { tenantId: tenant.id, ...s }
    });
  }
  console.log('   ✅ System settings created\n');

  // ===== DONE =====
  console.log('═══════════════════════════════════════════');
  console.log('🎉 DATABASE SETUP COMPLETE!');
  console.log('═══════════════════════════════════════════');
  console.log(`\n📧 SuperAdmin Login:`);
  console.log(`   Email:    superadmin@elevatepos.com`);
  console.log(`   Password: superadmin123`);
  console.log(`\n📧 Admin Login (Hometown Brew):`);
  console.log(`   Email:    admin@hometownbrew.com`);
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
