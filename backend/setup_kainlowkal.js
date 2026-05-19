const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function main() {
  console.log('🚀 Wiping database and setting up KAINLOWKAL (Healthy & Low-Cal POS)...\n');

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
      name: 'Kainlowkal',
      slug: 'kainlowkal',
      primaryColor: '#10b981', // Emerald green (matches healthy & fresh theme)
      secondaryColor: '#34d399' // Mint green
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
  console.log('🔑 Step 3: Creating Admin for Kainlowkal...');
  const adminPass = await bcrypt.hash('admin123', 12);
  const admin = await prisma.user.create({
    data: {
      tenantId: tenant.id,
      email: 'admin@kainlowkal.com',
      password: adminPass,
      name: 'Store Manager',
      role: 'admin',
      active: true
    }
  });
  console.log(`✅ Admin Created: ${admin.email}\n`);

  // ===== 4. SEED KAINLOWKAL CATEGORIES & PRODUCTS =====
  console.log('🌱 Step 4: Seeding Low-Cal & Keto Products...');
  const categoriesData = [
    {
      name: 'Keto & Low-Carb Bowls', icon: '🥗', description: 'Premium high-protein & grain-free options',
      products: [
        { name: 'Keto Beef Salpicao Bowl', price: 245, description: 'Tender beef cubes sauteed in olive oil & garlic, served with cauliflower rice (Keto-Friendly)', stock: 999 },
        { name: 'High-Protein Chicken Pesto Bowl', price: 210, description: 'Grilled chicken breast, mixed greens, cherry tomatoes, and house-made walnut pesto (Low Cal)', stock: 999 },
        { name: 'Vegan Tofu Quinoa Bowl', price: 195, description: 'Pan-seared organic tofu, protein-rich quinoa, roasted carrots, avocado, and tahini dressing (Vegan)', stock: 999 }
      ]
    },
    {
      name: 'Keto Pastries & Snacks', icon: '🥐', description: 'Guilt-free sugar-free treats',
      products: [
        { name: 'Sugar-Free Almond Croissant', price: 115, description: 'Flaky low-carb pastry made with almond flour and organic sweetener', stock: 24 },
        { name: 'Keto Chocolate Avocado Brownie', price: 95, description: 'Decadent, rich fudgy brownie sweetened with stevia (Gluten-Free)', stock: 20 },
        { name: 'Low-Cal Chia Seed Pudding', price: 85, description: 'Organic chia seeds soaked in unsweetened coconut milk, topped with fresh berries (Vegan)', stock: 30 }
      ]
    },
    {
      name: 'Detox & Sugar-Free Drinks', icon: '🥤', description: 'Freshly pressed organic beverages',
      products: [
        { name: 'Green Detox Juice', price: 135, description: 'Freshly pressed cucumber, celery, green apple, ginger, and organic lemon', stock: 999 },
        { name: 'Keto Avocado Cream Smoothie', price: 165, description: 'Rich blended fresh avocado, unsweetened almond milk, and erythritol', stock: 999 },
        { name: 'Organic Hibiscus Iced Tea', price: 95, description: 'Cold-brewed organic hibiscus tea, lightly sweetened with stevia (Zero Calorie)', stock: 999 }
      ]
    },
    {
      name: 'Guilt-Free Cafe Classics', icon: '☕', description: 'Zero-sugar & dairy-free energy boosters',
      products: [
        { name: 'Bulletproof Keto Coffee', price: 145, description: 'Fresh espresso blended with grass-fed butter and MCT oil for sustained energy', stock: 999 },
        { name: 'Almond Milk Cafe Latte', price: 135, description: 'Double shot espresso with steamed unsweetened almond milk (Dairy-Free)', stock: 999 },
        { name: 'Sugar-Free Matcha Latte', price: 155, description: 'Ceremonial grade matcha whisked with oat milk and organic stevia', stock: 999 }
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
    { key: 'store_hours', value: '7AM - 9PM' },
    { key: 'order_prefix', value: 'KL' } // KainLowkal
  ];
  for (const s of settings) {
    await prisma.systemSetting.create({
      data: { tenantId: tenant.id, ...s }
    });
  }
  console.log('   ✅ System settings created\n');

  // ===== DONE =====
  console.log('═══════════════════════════════════════════');
  console.log('🎉 KAINLOWKAL SETUP COMPLETE!');
  console.log('═══════════════════════════════════════════');
  console.log(`\n📧 SuperAdmin Login:`);
  console.log(`   Email:    superadmin@elevatepos.com`);
  console.log(`   Password: superadmin123`);
  console.log(`\n📧 Admin Login (Kainlowkal):`);
  console.log(`   Email:    admin@kainlowkal.com`);
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
