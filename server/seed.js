const mongoose = require('mongoose');
require('dotenv').config();

const User = require('./models/User');
const Company = require('./models/Company');
const Category = require('./models/Category');
const Product = require('./models/Product');
const RFQ = require('./models/RFQ');
const Message = require('./models/Message');
const Order = require('./models/Order');

const seedData = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/bulkconnect';
    await mongoose.connect(mongoUri);
    console.log('[Seed] Connected to MongoDB');

    // Clean existing data
    await Promise.all([
      User.deleteMany({}),
      Company.deleteMany({}),
      Category.deleteMany({}),
      Product.deleteMany({}),
      RFQ.deleteMany({}),
      Message.deleteMany({}),
      Order.deleteMany({}),
    ]);
    console.log('[Seed] Cleared old collections');

    // 1. Create Super Admin
    const adminUser = await User.create({
      name: 'Eleanor Vance (Platform SuperAdmin)',
      email: 'admin@bulkconnect.com',
      password: 'Admin@123',
      role: 'superadmin',
      phone: '+91 9811002233',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=250&q=80',
    });

    // 2. Create Verified Supplier 1 (Apex Industrial Corp)
    const supplier1User = await User.create({
      name: 'Rajesh Mehta',
      email: 'supplier@apexind.com',
      password: 'Supplier@123',
      role: 'supplier',
      phone: '+91 9822334455',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=250&q=80',
    });

    const companySupplier1 = await Company.create({
      name: 'Apex Industrial Tools & Machinery Corp',
      user: supplier1User._id,
      businessType: 'manufacturer',
      taxId: '27AABCA1234F1Z5',
      verificationStatus: 'approved',
      verifiedAt: new Date(),
      verifiedBy: adminUser._id,
      rating: 4.9,
      establishedYear: 2012,
      creditLimit: 2500000,
      contactEmail: 'orders@apexind.com',
      contactPhone: '+91 22 2847 9900',
      website: 'https://apexind-sample.com',
      address: {
        street: 'Plot 42, MIDC Industrial Estate, Andheri East',
        city: 'Mumbai',
        state: 'Maharashtra',
        country: 'India',
        zip: '400093',
      },
      documents: [
        {
          title: 'GST Registration Certificate - Apex Ind',
          url: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=400&q=80',
          documentType: 'gst_cert',
        },
      ],
    });
    supplier1User.company = companySupplier1._id;
    await supplier1User.save();

    // 3. Create Verified Supplier 2 (Vortex Electronics)
    const supplier2User = await User.create({
      name: 'Vikram Singhania',
      email: 'sales@vortexelec.com',
      password: 'Supplier@123',
      role: 'supplier',
      phone: '+91 9833445566',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=250&q=80',
    });

    const companySupplier2 = await Company.create({
      name: 'Vortex Semiconductor & Electronics Wholesale',
      user: supplier2User._id,
      businessType: 'wholesaler',
      taxId: '29AABCV5678J1Z9',
      verificationStatus: 'approved',
      verifiedAt: new Date(),
      verifiedBy: adminUser._id,
      rating: 4.8,
      establishedYear: 2016,
      creditLimit: 5000000,
      contactEmail: 'b2b@vortexelec.com',
      address: {
        street: 'Electronic City Phase 1, Hosur Road',
        city: 'Bengaluru',
        state: 'Karnataka',
        country: 'India',
        zip: '560100',
      },
      documents: [
        {
          title: 'Import/Export Code & GSTIN - Vortex',
          url: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=400&q=80',
          documentType: 'gst_cert',
        },
      ],
    });
    supplier2User.company = companySupplier2._id;
    await supplier2User.save();

    // 4. Create Pending Supplier 3 (In Admin Verification Queue)
    const supplier3User = await User.create({
      name: 'Sunita Sharma',
      email: 'info@zenithmfg.com',
      password: 'Supplier@123',
      role: 'supplier',
      phone: '+91 9844556677',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=250&q=80',
    });

    const companySupplier3 = await Company.create({
      name: 'Zenith Technical Garments & Protective Wear Ltd',
      user: supplier3User._id,
      businessType: 'manufacturer',
      taxId: '06AAACZ9876K1ZP',
      verificationStatus: 'pending',
      rating: 4.5,
      establishedYear: 2021,
      contactEmail: 'compliance@zenithmfg.com',
      address: {
        street: 'Udyog Vihar Phase IV',
        city: 'Gurugram',
        state: 'Haryana',
        country: 'India',
        zip: '122015',
      },
      documents: [
        {
          title: 'Haryana Trade License & GST Application',
          url: 'https://images.unsplash.com/photo-1450133064473-71024230f91b?auto=format&fit=crop&w=400&q=80',
          documentType: 'gst_cert',
          uploadedAt: new Date(Date.now() - 3600000 * 4), // 4 hours ago
        },
      ],
    });
    supplier3User.company = companySupplier3._id;
    await supplier3User.save();

    // 5. Create Verified Buyer 1 (Metro Retail Mart Ltd)
    const buyer1User = await User.create({
      name: 'Ananya Deshmukh',
      email: 'purchasing@metroretail.com',
      password: 'Buyer@123',
      role: 'buyer',
      phone: '+91 9877665544',
      avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=250&q=80',
    });

    const companyBuyer1 = await Company.create({
      name: 'Metro Retail Mart Chain India Pvt Ltd',
      user: buyer1User._id,
      businessType: 'enterprise_buyer',
      taxId: '27AABCM8899L1ZU',
      verificationStatus: 'approved',
      verifiedAt: new Date(),
      verifiedBy: adminUser._id,
      creditLimit: 3000000,
      rating: 4.9,
      address: {
        street: 'Tower C, Business Bay, Senapati Bapat Marg, Lower Parel',
        city: 'Mumbai',
        state: 'Maharashtra',
        country: 'India',
        zip: '400013',
      },
      documents: [
        {
          title: 'Enterprise Incorporation Certificate - Metro Retail',
          url: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=400&q=80',
          documentType: 'incorporation_cert',
        },
      ],
    });
    buyer1User.company = companyBuyer1._id;
    await buyer1User.save();

    // 6. Categories
    const categories = await Category.create([
      {
        name: 'Industrial Machinery & Tools',
        slug: 'industrial-machinery-tools',
        description: 'CNC machines, heavy pneumatics, precision drill bits & hand tools.',
        icon: 'Wrench',
        commissionRate: 3.0,
      },
      {
        name: 'Electronics & Semiconductors',
        slug: 'electronics-semiconductors',
        description: 'Microcontrollers, industrial sensors, power modules & IC chips.',
        icon: 'Cpu',
        commissionRate: 2.5,
      },
      {
        name: 'Packaging & Raw Materials',
        slug: 'packaging-raw-materials',
        description: 'Corrugated cartons, bubble wraps, pallets & polymer granules.',
        icon: 'Package',
        commissionRate: 4.0,
      },
      {
        name: 'Apparel & Protective Workwear',
        slug: 'apparel-protective-workwear',
        description: 'Hi-vis safety vests, flame-retardant coveralls & industrial boots.',
        icon: 'Shield',
        commissionRate: 5.0,
      },
    ]);

    const [catIndustrial, catElectronics, catPackaging, catApparel] = categories;

    // 7. Products with Tiered Pricing & MOQs
    const product1 = await Product.create({
      name: 'Industrial Grade Heavy-Duty Rotary Hammer Drill (1200W)',
      sku: 'APX-HD-ROT-1200',
      description: 'Engineered for high-volume construction drilling and concrete channelling. Dual mode rotation, vibration dampening handle, and brushless motor with 3-year commercial manufacturer warranty.',
      category: catIndustrial._id,
      supplier: supplier1User._id,
      company: companySupplier1._id,
      brand: 'ApexPro Tooling',
      images: [
        'https://images.unsplash.com/photo-1504148455328-c376907d081c?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80',
      ],
      specifications: [
        { key: 'Power Input', value: '1200 Watts' },
        { key: 'Impact Energy', value: '4.5 Joules' },
        { key: 'Chuck Type', value: 'SDS-Plus Quick Release' },
        { key: 'No-Load Speed', value: '0 - 950 RPM' },
      ],
      moq: 10,
      stock: 450,
      unit: 'pieces',
      tieredPricing: [
        { minQuantity: 10, maxQuantity: 49, pricePerUnit: 4200 },
        { minQuantity: 50, maxQuantity: 199, pricePerUnit: 3600 },
        { minQuantity: 200, maxQuantity: null, pricePerUnit: 3100 },
      ],
      leadTimeDays: 4,
      hsnCode: '84672100',
      taxPercent: 18,
      status: 'active',
      rating: 4.9,
    });

    const product2 = await Product.create({
      name: 'Precision High-Tensile Carbide End Mill Bit Set (20 pcs)',
      sku: 'APX-CARB-SET-20',
      description: 'Solid carbide titanium-coated 4-flute CNC milling cutter bits. Extremely durable for hardened steel, aluminium alloy, and aerospace fabrication.',
      category: catIndustrial._id,
      supplier: supplier1User._id,
      company: companySupplier1._id,
      brand: 'ApexPro Tooling',
      images: [
        'https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=800&q=80',
      ],
      specifications: [
        { key: 'Flute Count', value: '4 Flutes Solid Carbide' },
        { key: 'Coating', value: 'AlTiN Heat-Resistant' },
        { key: 'Hardness', value: 'HRC 65' },
      ],
      moq: 25,
      stock: 1200,
      unit: 'sets',
      tieredPricing: [
        { minQuantity: 25, maxQuantity: 99, pricePerUnit: 1850 },
        { minQuantity: 100, maxQuantity: 499, pricePerUnit: 1450 },
        { minQuantity: 500, maxQuantity: null, pricePerUnit: 1150 },
      ],
      leadTimeDays: 3,
      hsnCode: '82077010',
      taxPercent: 18,
      status: 'active',
      rating: 4.8,
    });

    const product3 = await Product.create({
      name: 'IoT Wireless Industrial Sensor Module (ESP32-S3 Pro)',
      sku: 'VTX-ESP32-IND-01',
      description: 'Custom IoT telemetry board equipped with dual-core 240MHz microcontroller, LoRaWAN, RS485 Modbus, and hardware cryptographic engine for factory smart metering.',
      category: catElectronics._id,
      supplier: supplier2User._id,
      company: companySupplier2._id,
      brand: 'VortexCore',
      images: [
        'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1588508065123-287b28e013da?auto=format&fit=crop&w=800&q=80',
      ],
      specifications: [
        { key: 'Processor', value: 'Dual-core Xtensa 32-bit LX7' },
        { key: 'Connectivity', value: 'WiFi 802.11 b/g/n, BLE 5.0, RS485' },
        { key: 'Operating Temp', value: '-40°C to +85°C Industrial' },
      ],
      moq: 50,
      stock: 3500,
      unit: 'pieces',
      tieredPricing: [
        { minQuantity: 50, maxQuantity: 199, pricePerUnit: 980 },
        { minQuantity: 200, maxQuantity: 999, pricePerUnit: 780 },
        { minQuantity: 1000, maxQuantity: null, pricePerUnit: 620 },
      ],
      leadTimeDays: 7,
      hsnCode: '85423100',
      taxPercent: 18,
      status: 'active',
      rating: 4.9,
    });

    const product4 = await Product.create({
      name: 'High-Density 5-Ply Heavy Duty Corrugated Master Cartons (Pack of 50)',
      sku: 'PKG-CARTON-5PLY-L',
      description: 'Export-grade ECT-44 heavy duty Kraft corrugated boxes designed for shock absorption and container stacking. 100% recyclable, moisture resistant barrier.',
      category: catPackaging._id,
      supplier: supplier1User._id,
      company: companySupplier1._id,
      brand: 'PackShield B2B',
      images: [
        'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=800&q=80',
      ],
      specifications: [
        { key: 'Dimensions', value: '600mm x 400mm x 400mm' },
        { key: 'Board Strength', value: '5-Ply 180 GSM Fluted Kraft' },
        { key: 'Load Capacity', value: 'Up to 45 kg per carton' },
      ],
      moq: 20,
      stock: 800,
      unit: 'boxes',
      tieredPricing: [
        { minQuantity: 20, maxQuantity: 99, pricePerUnit: 850 },
        { minQuantity: 100, maxQuantity: 299, pricePerUnit: 720 },
        { minQuantity: 300, maxQuantity: null, pricePerUnit: 580 },
      ],
      leadTimeDays: 2,
      hsnCode: '48191010',
      taxPercent: 12,
      status: 'active',
      rating: 4.7,
    });

    // 8. Sample RFQ with live negotiation history
    const sampleRfq = await RFQ.create({
      buyer: buyer1User._id,
      buyerCompany: companyBuyer1._id,
      supplier: supplier1User._id,
      supplierCompany: companySupplier1._id,
      product: product1._id,
      quantity: 150,
      targetPricePerUnit: 3200, // Buyer wanted 3200 (standard tier is 3600)
      currentOfferedPrice: 3350, // Countered down to 3350
      lastOfferedBy: supplier1User._id,
      status: 'countered',
      deliveryLocation: 'Metro Central Warehouse, Bhiwandi, Maharashtra',
      targetDeliveryDate: new Date(Date.now() + 14 * 86400000),
      counterOffers: [
        {
          offeredBy: buyer1User._id,
          role: 'buyer',
          pricePerUnit: 3200,
          quantity: 150,
          notes: 'Looking for prompt delivery of 150 units for our retail chain store rollout.',
          createdAt: new Date(Date.now() - 86400000),
        },
        {
          offeredBy: supplier1User._id,
          role: 'supplier',
          pricePerUnit: 3350,
          quantity: 150,
          leadTimeDays: 5,
          notes: 'We can accommodate ₹3,350/unit with express dispatch within 5 business days and free spare carbon brushes.',
          createdAt: new Date(Date.now() - 3600000 * 6),
        },
      ],
    });

    // Messages for this RFQ
    await Message.create([
      {
        rfq: sampleRfq._id,
        sender: buyer1User._id,
        receiver: supplier1User._id,
        message: 'Hello Rajesh, we have a nationwide project needing 150 rotary hammers. Can you quote ₹3,200 per piece?',
        offerDetails: {
          isCounterOffer: true,
          pricePerUnit: 3200,
          quantity: 150,
          status: 'pending',
        },
        createdAt: new Date(Date.now() - 86400000),
      },
      {
        rfq: sampleRfq._id,
        sender: supplier1User._id,
        receiver: buyer1User._id,
        message: 'Hi Ananya! Since you are ordering 150 units, our standard tier is ₹3,600. Best wholesale rate we can offer is ₹3,350 with expedited dispatch and warranty backing.',
        offerDetails: {
          isCounterOffer: true,
          pricePerUnit: 3350,
          quantity: 150,
          leadTimeDays: 5,
          status: 'pending',
        },
        createdAt: new Date(Date.now() - 3600000 * 6),
      },
    ]);

    // 9. Sample Past Order with Shipment Tracking
    const pastOrder = await Order.create({
      buyer: buyer1User._id,
      buyerCompany: companyBuyer1._id,
      supplier: supplier2User._id,
      supplierCompany: companySupplier2._id,
      items: [
        {
          product: product3._id,
          name: product3.name,
          sku: product3.sku,
          image: product3.images[0],
          unit: product3.unit,
          quantity: 250,
          unitPrice: 780, // 200-999 tier rate
          totalPrice: 195000,
          isRfqNegotiated: false,
        },
      ],
      subtotal: 195000,
      taxAmount: 35100, // 18% GST
      shippingFee: 0,
      platformCommission: 6825, // 3.5%
      totalAmount: 230100,
      paymentMethod: 'b2b_credit_terms',
      paymentStatus: 'credit_approved',
      orderStatus: 'shipped',
      shippingAddress: {
        contactName: 'Ananya Deshmukh',
        companyName: 'Metro Retail Mart Chain India Pvt Ltd',
        street: 'Tower C, Business Bay, Senapati Bapat Marg',
        city: 'Mumbai',
        state: 'Maharashtra',
        country: 'India',
        zip: '400013',
        phone: '+91 9877665544',
        gstNumber: '27AABCM8899L1ZU',
      },
      shipment: {
        trackingId: 'BLUEDART-B2B-984210',
        carrier: 'Blue Dart Surface Express',
        shippedAt: new Date(Date.now() - 86400000),
        estimatedDelivery: new Date(Date.now() + 2 * 86400000),
        courierNotes: 'In transit from Bangalore Hub. Driver dispatch scheduled.',
      },
      creditTerms: {
        termDays: 30,
        dueDate: new Date(Date.now() + 25 * 86400000),
        creditApprovedAt: new Date(Date.now() - 86400000 * 2),
      },
    });

    console.log('[Seed] Database populated successfully!');
    console.log('------------------------------------------------------------');
    console.log('Credentials Summary:');
    console.log('1. Super Admin: admin@bulkconnect.com / Admin@123');
    console.log('2. Verified Supplier 1: supplier@apexind.com / Supplier@123');
    console.log('3. Verified Supplier 2: sales@vortexelec.com / Supplier@123');
    console.log('4. Pending Supplier 3: info@zenithmfg.com / Supplier@123 (In Admin verification queue)');
    console.log('5. Verified Buyer 1: purchasing@metroretail.com / Buyer@123');
    console.log('------------------------------------------------------------');

    process.exit(0);
  } catch (error) {
    console.error('[Seed Error]', error);
    process.exit(1);
  }
};

seedData();
