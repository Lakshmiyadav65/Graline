/**
 * Grainline seed.
 * Run with: npm run db:seed
 *
 * Populates 8 villages, 12 farmers, 18 listings, 20 days of mandi prices,
 * 1 admin user, 3 customers with prior orders.
 *
 * Idempotent — wipes child rows in FK-safe order before re-creating.
 * Money is integer paise.
 */

import { PrismaClient, Prisma } from "@prisma/client";

const prisma = new PrismaClient();

const PHOTO = (seed: string) =>
  `https://res.cloudinary.com/demo/image/upload/v1/grainline/seed/${seed}.jpg`;

const DEFAULT_PACKS = (basePaise: number) => [
  { kg: 1,  price_per_kg_paise: basePaise + 300 },  // 1kg pays a small premium
  { kg: 5,  price_per_kg_paise: basePaise + 100 },
  { kg: 10, price_per_kg_paise: basePaise        },
  { kg: 25, price_per_kg_paise: basePaise - 200 },  // bulk discount
];

const RETAIL_BASELINE_PAISE: Record<string, number> = {
  sona_masuri:        8500,
  bpt_5204:           7500,
  basmati:           17500,
  jeera_samba:       12000,
  red_rice:          14000,
  hand_pounded_sona:  9500,
};

async function main() {
  console.log("Wiping existing data (FK-safe order)…");
  await prisma.whatsAppMessage.deleteMany();
  await prisma.sampleRequest.deleteMany();
  await prisma.qCLog.deleteMany();
  await prisma.payout.deleteMany();
  await prisma.order.deleteMany();
  await prisma.routePlan.deleteMany();
  await prisma.mandiPrice.deleteMany();
  await prisma.adminUser.deleteMany();
  await prisma.listing.deleteMany();
  await prisma.farmer.deleteMany();
  await prisma.customer.deleteMany();
  await prisma.village.deleteMany();

  // ============================================================
  // VILLAGES
  // ============================================================
  console.log("Creating 8 villages…");
  const villages = await Promise.all([
    prisma.village.create({
      data: {
        name: "Konaipalli", slug: "konaipalli",
        district: "Karimnagar", state: "Telangana",
        lat: 18.4386, lng: 79.1288,
        head_name: "Madhav Reddy",   head_phone: "+919876500001",
        story: "Black-cotton soil and bore-well irrigation. Three generations of paddy.",
        photo_url: PHOTO("konaipalli"),
        hub_address: "Old school building, near Hanuman temple, Konaipalli, 505186",
        status: "verified", verified_at: new Date(),
      },
    }),
    prisma.village.create({
      data: {
        name: "Pochampalli", slug: "pochampalli",
        district: "Yadadri", state: "Telangana",
        lat: 17.3526, lng: 78.8232,
        head_name: "Lakshmi Reddy",  head_phone: "+919876500002",
        story: "Famous for ikat weaving, but the rice is just as careful.",
        photo_url: PHOTO("pochampalli"),
        hub_address: "Cooperative society building, Bus stand road, Pochampalli, 508284",
        status: "verified", verified_at: new Date(),
      },
    }),
    prisma.village.create({
      data: {
        name: "Bhupalpalli", slug: "bhupalpalli",
        district: "Bhupalpalli", state: "Telangana",
        lat: 18.4302, lng: 79.8741,
        head_name: "Venkatesh Goud",   head_phone: "+919876500003",
        story: "Tank-fed paddy on red loam. Long-grain basmati specialists.",
        photo_url: PHOTO("bhupalpalli"),
        hub_address: "MPDO office, Main road, Bhupalpalli, 506169",
        status: "verified", verified_at: new Date(),
      },
    }),
    prisma.village.create({
      data: {
        name: "Choutuppal", slug: "choutuppal",
        district: "Yadadri", state: "Telangana",
        lat: 17.2696, lng: 78.8638,
        head_name: "Pratap Reddy",     head_phone: "+919876500004",
        story: "Aromatic Jeera Samba grown at the edge of the deccan plateau.",
        photo_url: PHOTO("choutuppal"),
        hub_address: "Gram panchayat office, Choutuppal, 508252",
        status: "verified", verified_at: new Date(),
      },
    }),
    prisma.village.create({
      data: {
        name: "Manthani", slug: "manthani",
        district: "Peddapalli", state: "Telangana",
        lat: 18.6515, lng: 79.6708,
        head_name: "Bhupathi Sharma",   head_phone: "+919876500005",
        story: "On the banks of the Godavari. Hand-pounded rice still done here.",
        photo_url: PHOTO("manthani"),
        hub_address: "Old market square, Manthani, 505184",
        status: "verified", verified_at: new Date(),
      },
    }),
    prisma.village.create({
      data: {
        name: "Yadagiri", slug: "yadagiri",
        district: "Yadadri", state: "Telangana",
        lat: 17.5950, lng: 78.9450,
        head_name: "Sridhar Yadav",    head_phone: "+919876500006",
        story: "Hill-fed streams give a slightly mineral character to the rice.",
        photo_url: PHOTO("yadagiri"),
        hub_address: "Near Yadagirigutta temple road, Yadagiri, 508115",
        status: "verified", verified_at: new Date(),
      },
    }),
    prisma.village.create({
      data: {
        name: "Bhongir", slug: "bhongir",
        district: "Yadadri", state: "Telangana",
        lat: 17.5145, lng: 78.8835,
        head_name: "Anantha Reddy",    head_phone: "+919876500007",
        story: "Granite hill villages with deep wells and disciplined sowing.",
        photo_url: PHOTO("bhongir"),
        hub_address: "Tehsil office, Fort road, Bhongir, 508116",
        status: "verified", verified_at: new Date(),
      },
    }),
    prisma.village.create({
      data: {
        name: "Husnabad", slug: "husnabad",
        district: "Siddipet", state: "Telangana",
        lat: 18.0833, lng: 78.9833,
        head_name: "Yusuf Khan",       head_phone: "+919876500008",
        story: "Mixed-cropping village where paddy follows pulses every season.",
        photo_url: PHOTO("husnabad"),
        hub_address: "Anjaiah colony hall, Husnabad, 505467",
        status: "verified", verified_at: new Date(),
      },
    }),
  ]);
  const vBy = (slug: string) => villages.find((v) => v.slug === slug)!;

  // ============================================================
  // FARMERS
  // ============================================================
  console.log("Creating 12 farmers…");
  const farmers = await Promise.all([
    prisma.farmer.create({ data: {
      village_id: vBy("konaipalli").id, phone: "+919876511111",
      name: "Ramesh Varma", upi_id: "ramesh.varma@upi", aadhaar_last4: "4521",
      land_acres: 3.2, story: "Family land for three generations. Bore-well irrigation, mostly natural inputs.",
      farming_since_year: 2008, photo_url: PHOTO("farmer-ramesh"),
      status: "active", verified_at: new Date(),
    }}),
    prisma.farmer.create({ data: {
      village_id: vBy("pochampalli").id, phone: "+919876522222",
      name: "Saritha Reddy", upi_id: "saritha@upi", aadhaar_last4: "8870",
      land_acres: 2.5, story: "Switched to direct sales last year. Daughter helps with WhatsApp orders.",
      farming_since_year: 2012, photo_url: PHOTO("farmer-saritha"),
      status: "active", verified_at: new Date(),
    }}),
    prisma.farmer.create({ data: {
      village_id: vBy("bhupalpalli").id, phone: "+919876533333",
      name: "Nageshwar Rao", upi_id: "nageshwar@upi", aadhaar_last4: "1145",
      land_acres: 6.0, story: "Specialist in long-grain basmati. Ages rice for two seasons before sale.",
      farming_since_year: 2002, photo_url: PHOTO("farmer-nageshwar"),
      status: "active", verified_at: new Date(),
    }}),
    prisma.farmer.create({ data: {
      village_id: vBy("pochampalli").id, phone: "+919876544444",
      name: "Lakshmi Devi", upi_id: "lakshmi.devi@upi", aadhaar_last4: "9921",
      land_acres: 1.8, story: "Heirloom red rice grown on family land for 40+ years.",
      farming_since_year: 2010, photo_url: PHOTO("farmer-lakshmi"),
      status: "active", verified_at: new Date(),
    }}),
    prisma.farmer.create({ data: {
      village_id: vBy("choutuppal").id, phone: "+919876555555",
      name: "Vikram Singh", upi_id: "vikram@upi", aadhaar_last4: "3340",
      land_acres: 4.5, story: "Aromatic Jeera Samba farmer. Mills in single pass for fragrance.",
      farming_since_year: 2015, photo_url: PHOTO("farmer-vikram"),
      status: "active", verified_at: new Date(),
    }}),
    prisma.farmer.create({ data: {
      village_id: vBy("manthani").id, phone: "+919876566666",
      name: "Yadagiri", upi_id: "yadagiri@upi", aadhaar_last4: "5588",
      land_acres: 2.2, story: "Still hand-pounds rice the way his grandfather did.",
      farming_since_year: 2005, photo_url: PHOTO("farmer-yadagiri"),
      status: "active", verified_at: new Date(),
    }}),
    prisma.farmer.create({ data: {
      village_id: vBy("konaipalli").id, phone: "+919876577777",
      name: "Praveen Kumar", upi_id: "praveen.k@upi", aadhaar_last4: "6614",
      land_acres: 5.0, story: "Practices system of rice intensification (SRI) since 2018.",
      farming_since_year: 2014, photo_url: PHOTO("farmer-praveen"),
      status: "active", verified_at: new Date(),
    }}),
    prisma.farmer.create({ data: {
      village_id: vBy("yadagiri").id, phone: "+919876588888",
      name: "Anjali Sharma", upi_id: "anjali@upi", aadhaar_last4: "7720",
      land_acres: 3.0, story: "First-generation woman-led farm. Certified organic since 2022.",
      farming_since_year: 2019, photo_url: PHOTO("farmer-anjali"),
      status: "active", verified_at: new Date(),
    }}),
    prisma.farmer.create({ data: {
      village_id: vBy("bhongir").id, phone: "+919876599999",
      name: "Srinivas Rao", upi_id: "srinivas.rao@upi", aadhaar_last4: "1190",
      land_acres: 7.5, story: "Old hand at BPT 5204. Supplies hostels and home kitchens.",
      farming_since_year: 1998, photo_url: PHOTO("farmer-srinivas"),
      status: "active", verified_at: new Date(),
    }}),
    prisma.farmer.create({ data: {
      village_id: vBy("husnabad").id, phone: "+919876600001",
      name: "Suresh Babu", upi_id: "suresh.babu@upi", aadhaar_last4: "3392",
      land_acres: 4.0, story: "Crop-rotation enthusiast. Paddy after green gram for soil health.",
      farming_since_year: 2011, photo_url: PHOTO("farmer-suresh"),
      status: "active", verified_at: new Date(),
    }}),
    prisma.farmer.create({ data: {
      village_id: vBy("bhongir").id, phone: "+919876600002",
      name: "Kavitha Reddy", upi_id: "kavitha.reddy@upi", aadhaar_last4: "7783",
      land_acres: 2.0, story: "Brown rice and unpolished varieties. Health-focused buyers.",
      farming_since_year: 2017, photo_url: PHOTO("farmer-kavitha"),
      status: "active", verified_at: new Date(),
    }}),
    prisma.farmer.create({ data: {
      village_id: vBy("choutuppal").id, phone: "+919876600003",
      name: "Manohar", upi_id: "manohar@upi", aadhaar_last4: "2247",
      land_acres: 3.5, story: "Half-acre experiment plot for revival of local short-grain varieties.",
      farming_since_year: 2009, photo_url: PHOTO("farmer-manohar"),
      status: "active", verified_at: new Date(),
    }}),
  ]);
  const fBy = (phone: string) => farmers.find((f) => f.phone === phone)!;

  // ============================================================
  // LISTINGS
  // ============================================================
  console.log("Creating 18 listings…");
  type ListingInput = {
    farmer: ReturnType<typeof fBy>;
    variety: Prisma.ListingCreateInput["variety"];
    type: Prisma.ListingCreateInput["type"];
    is_organic?: boolean;
    available_kg: number;
    price_per_kg_paise: number;
    harvest_year?: number;
    harvest_season?: Prisma.ListingCreateInput["harvest_season"];
    description: string;
    photo_seed: string;
  };

  const listingSeeds: ListingInput[] = [
    // Sona Masuri x6
    { farmer: fBy("+919876511111"), variety: "sona_masuri", type: "raw", is_organic: false,
      available_kg: 320, price_per_kg_paise: 5200, harvest_year: 2025, harvest_season: "rabi",
      description: "Slow-aged six months for a softer cook and a fuller fragrance. Single-pass milled, lightly polished, 0% broken grains. Best for everyday meals — biryani, pulao, plain rice.",
      photo_seed: "sona-ramesh" },
    { farmer: fBy("+919876577777"), variety: "sona_masuri", type: "raw", is_organic: true,
      available_kg: 180, price_per_kg_paise: 5400, harvest_year: 2025, harvest_season: "rabi",
      description: "SRI-grown Sona Masuri, pesticide-free, milled within 7 days of order. Soft cook, fluffy texture.",
      photo_seed: "sona-praveen" },
    { farmer: fBy("+919876600001"), variety: "sona_masuri", type: "raw", is_organic: false,
      available_kg: 250, price_per_kg_paise: 5100, harvest_year: 2024, harvest_season: "kharif",
      description: "Year-old Sona Masuri, aged in jute sacks. Drier grain that holds shape in pulao.",
      photo_seed: "sona-suresh" },
    { farmer: fBy("+919876522222"), variety: "sona_masuri", type: "raw", is_organic: false,
      available_kg: 140, price_per_kg_paise: 5300, harvest_year: 2025, harvest_season: "rabi",
      description: "Ikat-village Sona Masuri. Family land, well-water irrigation.",
      photo_seed: "sona-saritha" },
    { farmer: fBy("+919876600002"), variety: "sona_masuri", type: "boiled", is_organic: false,
      available_kg: 95, price_per_kg_paise: 5000, harvest_year: 2025, harvest_season: "rabi",
      description: "Parboiled Sona Masuri — stays separate, lower glycemic. Good for diabetic households.",
      photo_seed: "sona-kavitha" },
    { farmer: fBy("+919876588888"), variety: "sona_masuri", type: "raw", is_organic: true,
      available_kg: 60, price_per_kg_paise: 5800, harvest_year: 2025, harvest_season: "rabi",
      description: "Certified-organic Sona Masuri from Anjali's hill plot. Limited stock.",
      photo_seed: "sona-anjali" },

    // BPT 5204 x4
    { farmer: fBy("+919876522222"), variety: "bpt_5204", type: "raw", is_organic: false,
      available_kg: 180, price_per_kg_paise: 4800, harvest_year: 2025, harvest_season: "rabi",
      description: "Fresh harvest BPT 5204, slim grain that softens beautifully. Daily-meals workhorse.",
      photo_seed: "bpt-saritha" },
    { farmer: fBy("+919876599999"), variety: "bpt_5204", type: "raw", is_organic: false,
      available_kg: 420, price_per_kg_paise: 4700, harvest_year: 2025, harvest_season: "rabi",
      description: "BPT 5204 from a 25-year farmer. Bulk-friendly pricing, consistent quality.",
      photo_seed: "bpt-srinivas" },
    { farmer: fBy("+919876600003"), variety: "bpt_5204", type: "raw", is_organic: false,
      available_kg: 110, price_per_kg_paise: 4900, harvest_year: 2024, harvest_season: "kharif",
      description: "Aged BPT 5204. A familiar everyday rice with a clean finish.",
      photo_seed: "bpt-manohar" },
    { farmer: fBy("+919876511111"), variety: "bpt_5204", type: "boiled", is_organic: false,
      available_kg: 75, price_per_kg_paise: 4900, harvest_year: 2025, harvest_season: "rabi",
      description: "Parboiled BPT 5204 — stays firm, ideal for curd-rice and biryani.",
      photo_seed: "bpt-ramesh" },

    // Basmati x2
    { farmer: fBy("+919876533333"), variety: "basmati", type: "raw", is_organic: false,
      available_kg: 90, price_per_kg_paise: 11800, harvest_year: 2023, harvest_season: "kharif",
      description: "Aged 2 years in Bhupalpalli. Long, fragrant grain — special-occasion biryani.",
      photo_seed: "basmati-nageshwar" },
    { farmer: fBy("+919876533333"), variety: "basmati", type: "raw", is_organic: false,
      available_kg: 60, price_per_kg_paise: 11500, harvest_year: 2024, harvest_season: "kharif",
      description: "1-year aged Basmati. Slightly milder fragrance, gentler price.",
      photo_seed: "basmati-nageshwar-2" },

    // Jeera Samba x2
    { farmer: fBy("+919876555555"), variety: "jeera_samba", type: "raw", is_organic: false,
      available_kg: 140, price_per_kg_paise: 7800, harvest_year: 2025, harvest_season: "kharif",
      description: "Aromatic short-grain. The traditional rice for Tamil-style biryani and pongal.",
      photo_seed: "jeera-vikram" },
    { farmer: fBy("+919876600003"), variety: "jeera_samba", type: "raw", is_organic: false,
      available_kg: 80, price_per_kg_paise: 7600, harvest_year: 2025, harvest_season: "kharif",
      description: "Choutuppal Jeera Samba, milled fresh. Fragrant when steamed.",
      photo_seed: "jeera-manohar" },

    // Red Rice x2
    { farmer: fBy("+919876544444"), variety: "red_rice", type: "raw", is_organic: false,
      available_kg: 60, price_per_kg_paise: 9000, harvest_year: 2025, harvest_season: "rabi",
      description: "Heirloom red rice with a nutty bite. High-fiber, high-iron — a complete grain.",
      photo_seed: "red-lakshmi" },
    { farmer: fBy("+919876588888"), variety: "red_rice", type: "raw", is_organic: true,
      available_kg: 40, price_per_kg_paise: 9500, harvest_year: 2025, harvest_season: "rabi",
      description: "Certified-organic red rice from Yadagiri's hill streams.",
      photo_seed: "red-anjali" },

    // Hand-pounded Sona x2
    { farmer: fBy("+919876566666"), variety: "hand_pounded_sona", type: "hand_pounded", is_organic: false,
      available_kg: 75, price_per_kg_paise: 6200, harvest_year: 2025, harvest_season: "rabi",
      description: "Wood-mortar hand-pounded Sona. Bran lightly retained — earthy, nutty, slightly off-white.",
      photo_seed: "handsona-yadagiri" },
    { farmer: fBy("+919876566666"), variety: "hand_pounded_sona", type: "hand_pounded", is_organic: false,
      available_kg: 30, price_per_kg_paise: 6500, harvest_year: 2024, harvest_season: "rabi",
      description: "Last of last-season's hand-pounded stock. Aged on jute, fuller flavour.",
      photo_seed: "handsona-yadagiri-2" },
  ];

  for (const seed of listingSeeds) {
    await prisma.listing.create({
      data: {
        farmer_id: seed.farmer.id,
        variety: seed.variety,
        type: seed.type,
        is_organic: seed.is_organic ?? false,
        organic_certification: seed.is_organic ? "Indian Organic (NPOP)" : null,
        available_kg: seed.available_kg,
        price_per_kg: seed.price_per_kg_paise,
        pack_sizes: DEFAULT_PACKS(seed.price_per_kg_paise),
        harvest_year: seed.harvest_year,
        harvest_season: seed.harvest_season,
        is_milled: true,
        milled_on: new Date(),
        photos: [PHOTO(seed.photo_seed), PHOTO(seed.photo_seed + "-2"), PHOTO(seed.photo_seed + "-3")],
        description: seed.description,
        status: "active",
      },
    });
  }

  // ============================================================
  // MANDI PRICES — 20 days, multiple commodities
  // ============================================================
  console.log("Creating 20 days of mandi prices…");
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);

  for (let dayOffset = 0; dayOffset < 20; dayOffset++) {
    const date = new Date(today);
    date.setUTCDate(date.getUTCDate() - dayOffset);

    // Paddy mandi rate (modal ~ ₹22/kg = 2200 paise) with small daily wobble
    const paddyModal = 2200 + Math.round(Math.sin(dayOffset / 3) * 80);
    await prisma.mandiPrice.create({
      data: {
        commodity: "rice_paddy",
        market: "Karimnagar APMC",
        state: "Telangana",
        min_price: paddyModal - 200,
        max_price: paddyModal + 250,
        modal_price: paddyModal,
        date,
      },
    });

    // Retail baselines per variety
    for (const [variety, basePaise] of Object.entries(RETAIL_BASELINE_PAISE)) {
      const wobble = Math.round(Math.cos(dayOffset / 4) * 200);
      await prisma.mandiPrice.create({
        data: {
          commodity: `retail_${variety}`,
          market: "Hyderabad retail (avg)",
          state: "Telangana",
          min_price: basePaise - 500,
          max_price: basePaise + 1500,
          modal_price: basePaise + wobble,
          date,
        },
      });
    }
  }

  // ============================================================
  // ADMIN
  // ============================================================
  console.log("Creating admin user…");
  await prisma.adminUser.create({
    data: {
      phone: "+919999999999",
      name: "Admin",
      role: "super_admin",
    },
  });

  // ============================================================
  // CUSTOMERS + PRIOR ORDERS
  // ============================================================
  console.log("Creating 3 customers + prior orders…");

  const priya = await prisma.customer.create({
    data: {
      phone: "+919000000001",
      name: "Priya M.",
      email: "priya@example.com",
      addresses: [
        {
          label: "Home",
          line1: "Flat 304, Aspen Heights",
          line2: "Gachibowli",
          city: "Hyderabad",
          pincode: "500032",
        },
      ],
    },
  });

  const arjun = await prisma.customer.create({
    data: {
      phone: "+919000000002",
      name: "Arjun K.",
      addresses: [
        {
          label: "Home",
          line1: "12-3-45, Banjara Hills Road No. 7",
          city: "Hyderabad",
          pincode: "500034",
        },
      ],
    },
  });

  const sneha = await prisma.customer.create({
    data: {
      phone: "+919000000003",
      name: "Sneha R.",
      addresses: [
        {
          label: "Home",
          line1: "5-7-22, Trimulgherry",
          city: "Secunderabad",
          pincode: "500015",
        },
      ],
    },
  });

  // Prior orders matching DESIGN.html dashboard prototype.
  const ramesh = fBy("+919876511111");
  const lakshmi = fBy("+919876544444");
  const allListings = await prisma.listing.findMany({ where: { status: "active" } });
  const sonaListing = allListings.find((l) => l.farmer_id === ramesh.id && l.variety === "sona_masuri")!;
  const redRiceListing = allListings.find((l) => l.farmer_id === lakshmi.id && l.variety === "red_rice")!;

  const nextSat = (() => {
    const d = new Date();
    d.setUTCDate(d.getUTCDate() + ((6 - d.getUTCDay() + 7) % 7 || 7));
    d.setUTCHours(6, 30, 0, 0);
    return d;
  })();

  // Priya — confirmed order (from DESIGN.html: GL-1284 Priya pending, but seed as confirmed for variety)
  await prisma.order.create({
    data: {
      order_number: "GL-1284",
      customer_id: priya.id,
      items: [
        {
          listing_id: sonaListing.id,
          farmer_id: ramesh.id,
          variety: "sona_masuri",
          pack_kg: 10,
          qty: 1,
          price_per_kg_paise: 5200,
          subtotal_paise: 52000,
        },
      ],
      fulfillment_type: "home_delivery",
      delivery_address: {
        label: "Home",
        line1: "Flat 304, Aspen Heights",
        city: "Hyderabad",
        pincode: "500032",
      },
      delivery_date: nextSat,
      subtotal: 52000,
      delivery_fee: 0, // free over ₹2000? subtotal ₹520 → fee should be 12000. Hmm, simple seed: free.
      total: 52000,
      commission_amount: 5200,
      farmer_payouts: [{ farmer_id: ramesh.id, amount_paise: 46800 }],
      payment_method: "upi",
      payment_status: "paid",
      razorpay_order_id: "order_seed_priya_1284",
      razorpay_payment_id: "pay_seed_priya_1284",
      status: "placed",
      status_history: [
        { status: "placed", at: new Date().toISOString(), by: "system" },
      ],
    },
  });

  // Arjun — confirmed bigger order (from DESIGN.html: GL-1281)
  await prisma.order.create({
    data: {
      order_number: "GL-1281",
      customer_id: arjun.id,
      items: [
        {
          listing_id: sonaListing.id,
          farmer_id: ramesh.id,
          variety: "sona_masuri",
          pack_kg: 25,
          qty: 1,
          price_per_kg_paise: 5000,
          subtotal_paise: 125000,
        },
      ],
      fulfillment_type: "home_delivery",
      delivery_address: {
        label: "Home",
        line1: "12-3-45, Banjara Hills Road No. 7",
        city: "Hyderabad",
        pincode: "500034",
      },
      delivery_date: nextSat,
      subtotal: 125000,
      delivery_fee: 0,
      total: 125000,
      commission_amount: 12500,
      farmer_payouts: [{ farmer_id: ramesh.id, amount_paise: 112500 }],
      payment_method: "upi",
      payment_status: "paid",
      razorpay_order_id: "order_seed_arjun_1281",
      razorpay_payment_id: "pay_seed_arjun_1281",
      status: "confirmed",
      confirmed_at: new Date(),
      status_history: [
        { status: "placed",    at: new Date(Date.now() - 2 * 86_400_000).toISOString(), by: "system" },
        { status: "confirmed", at: new Date().toISOString(), by: ramesh.id },
      ],
    },
  });

  // Sneha — ready order, multiple items including red rice (from DESIGN.html: GL-1278 + cart prototype)
  await prisma.order.create({
    data: {
      order_number: "GL-1278",
      customer_id: sneha.id,
      items: [
        {
          listing_id: sonaListing.id,
          farmer_id: ramesh.id,
          variety: "sona_masuri",
          pack_kg: 10,
          qty: 1,
          price_per_kg_paise: 5200,
          subtotal_paise: 52000,
        },
        {
          listing_id: redRiceListing.id,
          farmer_id: lakshmi.id,
          variety: "red_rice",
          pack_kg: 5,
          qty: 1,
          price_per_kg_paise: 9000,
          subtotal_paise: 45000,
        },
      ],
      fulfillment_type: "home_delivery",
      delivery_address: {
        label: "Home",
        line1: "5-7-22, Trimulgherry",
        city: "Secunderabad",
        pincode: "500015",
      },
      delivery_date: nextSat,
      subtotal: 97000,
      delivery_fee: 12000, // ₹120
      total: 109000,
      commission_amount: 9700,
      farmer_payouts: [
        { farmer_id: ramesh.id,  amount_paise: 46800 },
        { farmer_id: lakshmi.id, amount_paise: 40500 },
      ],
      payment_method: "upi",
      payment_status: "paid",
      razorpay_order_id: "order_seed_sneha_1278",
      razorpay_payment_id: "pay_seed_sneha_1278",
      status: "ready",
      confirmed_at: new Date(Date.now() - 1 * 86_400_000),
      status_history: [
        { status: "placed",    at: new Date(Date.now() - 3 * 86_400_000).toISOString(), by: "system" },
        { status: "confirmed", at: new Date(Date.now() - 2 * 86_400_000).toISOString(), by: ramesh.id },
        { status: "milling",   at: new Date(Date.now() - 1 * 86_400_000).toISOString(), by: ramesh.id },
        { status: "ready",     at: new Date().toISOString(), by: ramesh.id },
      ],
    },
  });

  console.log("✓ Seed complete.");
  console.log("  • 8 villages, 12 farmers, 18 listings");
  console.log("  • 20 days × 7 mandi-price commodities");
  console.log("  • 1 admin (+919999999999)");
  console.log("  • 3 customers, 3 prior orders (GL-1278, GL-1281, GL-1284)");
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
