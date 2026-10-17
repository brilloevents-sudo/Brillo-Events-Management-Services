const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding Brillo Events Santa Operations Hub...');

  // 1. Users & Roles
  const users = [
    { email: 'admin@brilloevents.com', name: 'Executive Admin', role: 'ADMIN' },
    { email: 'sales@brilloevents.com', name: 'Sales Coordinator', role: 'SALES' },
    { email: 'operations@brilloevents.com', name: 'Operations Director', role: 'OPERATIONS' },
    { email: 'finance@brilloevents.com', name: 'Finance Officer', role: 'FINANCE' },
    { email: 'manager@brilloevents.com', name: 'Managing Partner (Read-Only)', role: 'READ_ONLY' },
  ];

  for (const u of users) {
    await prisma.user.upsert({
      where: { email: u.email },
      update: {},
      create: u
    });
  }
  console.log('Users seeded.');

  // 2. Canonical Talents
  const talentsData = [
    {
      canonicalId: 'TAL-BOB',
      sourceName: 'BOB HALMITON',
      displayName: 'Bob Hamilton',
      talentType: 'REAL_BEARD',
      status: 'ACTIVE',
      age: 62,
      height: '6ft',
      nationality: 'American',
      baseTalentFee: 13000,
      metroManilaRate: 19000,
      provincialRate: 24700,
      holidayRate: 23000,
      specialRateNote: 'Special Holiday rate ₱25,000 - ₱30,000. At least ₱8,000 target profit margin.',
      rateSourceNote: 'Santa Rate row 2',
      approvedForPublicDisplay: true,
      bio: 'Professional real-beard Santa with commanding stage presence, natural charisma, and extensive mall centerpiece tour experience.',
      aliases: ['BOB HALMITON', 'Bob', 'Santa Bob', 'Santa Rob', 'BOB -4K ADVANCE'],
      photos: [
        { fileName: 'bob_photo_1.jpg', publicUrl: '/talents/Bob/bob_photo_1.jpg', isPrimary: true, caption: 'Santa Bob Mall Portrait' },
        { fileName: 'bob_photo_2.png', publicUrl: '/talents/Bob/bob_photo_2.png', isPrimary: false, caption: 'Santa Bob Close-up' },
        { fileName: 'bob_photo_3.jpg', publicUrl: '/talents/Bob/bob_photo_3.jpg', isPrimary: false, caption: 'Santa Bob Event Action' },
      ]
    },
    {
      canonicalId: 'TAL-EDWIN',
      sourceName: 'EDWIN ',
      displayName: 'Edwin',
      talentType: 'REAL_BEARD',
      status: 'ACTIVE',
      age: 60,
      height: '6ft',
      nationality: 'Netherlands',
      baseTalentFee: 12000,
      metroManilaRate: 18000,
      provincialRate: 23400,
      holidayRate: 23000,
      specialRateNote: 'Dec 24/25 rate ₱21,000. Gas/transpo charged to client if requested.',
      rateSourceNote: 'Santa Rate row 3',
      approvedForPublicDisplay: true,
      bio: 'Authentic European real-beard Santa with warm, gentle presence ideal for luxury hotel lobbies and private family encounters.',
      aliases: ['EDWIN', 'EDWIN ', 'Edwin'],
      photos: [
        { fileName: 'edwin_photo_1.jpg', publicUrl: '/talents/Edwin/edwin_photo_1.jpg', isPrimary: true, caption: 'Santa Edwin Classic' },
        { fileName: 'edwin_photo_2.jpg', publicUrl: '/talents/Edwin/edwin_photo_2.jpg', isPrimary: false, caption: 'Santa Edwin Studio' },
      ]
    },
    {
      canonicalId: 'TAL-GIULIO',
      sourceName: 'GIULIO',
      displayName: 'Giulio',
      talentType: 'REAL_BEARD',
      status: 'ACTIVE',
      age: 64,
      height: '6’4',
      nationality: 'Italian',
      baseTalentFee: 12000,
      metroManilaRate: 18000,
      provincialRate: 23400,
      holidayRate: 21000,
      specialRateNote: 'CDO Downtown and SM Davao tour talent. Transpo allowance ₱2k.',
      rateSourceNote: 'Santa Rate row 7',
      approvedForPublicDisplay: true,
      bio: 'Statuesque 6’4 real-beard Santa with grand theatrical presence, featured prominently in regional SM Supermalls Christmas launches.',
      aliases: ['GIULIO', 'Guilio', 'Santa Guillo', 'Giulio'],
      photos: [
        { fileName: 'guilio_photo_1.jpg', publicUrl: '/talents/Guilio/guilio_photo_1.jpg', isPrimary: true, caption: 'Santa Giulio Grand Stature' }
      ]
    },
    {
      canonicalId: 'TAL-CEDRIC',
      sourceName: 'CEDRICK',
      displayName: 'Cedric',
      talentType: 'REAL_BEARD',
      status: 'ACTIVE',
      age: 58,
      height: '5’11',
      nationality: 'USA / American',
      baseTalentFee: 12000,
      metroManilaRate: 17000,
      provincialRate: 22100,
      holidayRate: 20000,
      specialRateNote: 'Confirmed for SM Bataan and SM Sucat Dec 25.',
      rateSourceNote: 'Santa Rate row 9',
      approvedForPublicDisplay: true,
      bio: 'Joyful American real-beard Santa renowned for high-energy crowd interactions, storytelling, and gift distribution.',
      aliases: ['CEDRICK', 'Cedric', 'SANTA CEDRIC'],
      photos: [
        { fileName: 'cedric_photo_1.jpg', publicUrl: '/talents/Cedric/cedric_photo_1.jpg', isPrimary: true, caption: 'Santa Cedric Smiling' },
        { fileName: 'cedric_photo_2.jpg', publicUrl: '/talents/Cedric/cedric_photo_2.jpg', isPrimary: false, caption: 'Santa Cedric Candid' },
      ]
    },
    {
      canonicalId: 'TAL-RANDY',
      sourceName: 'RANDY',
      displayName: 'Randy',
      talentType: 'REAL_BEARD',
      status: 'ACTIVE',
      age: 63,
      height: '6ft',
      nationality: 'USA / American',
      baseTalentFee: 12000,
      metroManilaRate: 18000,
      provincialRate: 23400,
      holidayRate: 21000,
      specialRateNote: 'Marquee ₱13,000, SM Mega ₱14,000 package rate notes.',
      rateSourceNote: 'Santa Rate row 6',
      approvedForPublicDisplay: true,
      bio: 'Distinguished real-beard Santa with commanding stage poise, preferred for high-volume flagship mall centerpieces.',
      aliases: ['RANDY', 'Santa Randy', 'Randy'],
      photos: [
        { fileName: 'randy_photo_1.jpg', publicUrl: '/talents/Randy/randy_photo_1.jpg', isPrimary: true, caption: 'Santa Randy Flagship Portrait' }
      ]
    },
    {
      canonicalId: 'TAL-VIC',
      sourceName: 'VIC',
      displayName: 'Vic',
      talentType: 'REAL_BEARD',
      status: 'ACTIVE',
      age: 65,
      height: '5’11',
      nationality: 'USA',
      baseTalentFee: 12000,
      metroManilaRate: 18000,
      provincialRate: 23400,
      holidayRate: 21000,
      specialRateNote: 'SM San Lazaro and SM Novaliches Dec 25 scheduled talent.',
      rateSourceNote: 'Santa Rate row 5',
      approvedForPublicDisplay: false,
      bio: 'Seasoned real-beard Santa with rich voice, deep holiday storytelling expertise, and excellent rapport with children.',
      aliases: ['VIC', 'Vic'],
      photos: [
        { fileName: 'vic_photo_1.jpg', publicUrl: '/talents/Vic/vic_photo_1.jpg', isPrimary: true, caption: 'Santa Vic Classic' }
      ]
    },
    {
      canonicalId: 'TAL-LIAM',
      sourceName: 'LIAM',
      displayName: 'Liam',
      talentType: 'REAL_BEARD',
      status: 'ACTIVE',
      age: 56,
      height: '5’11',
      nationality: 'Dutch',
      baseTalentFee: 12000,
      metroManilaRate: 17000,
      provincialRate: 22100,
      holidayRate: 20000,
      specialRateNote: 'Ever Gotesco & Clark Cityfront confirmed talent.',
      rateSourceNote: 'Santa Rate row 8',
      approvedForPublicDisplay: false,
      bio: 'Authentic Dutch real-beard Santa delivering a gentle, traditional holiday aura.',
      aliases: ['LIAM', 'Liam', 'Liam/ Alpha Bazaar'],
      photos: [
        { fileName: 'liam_photo_1.jpg', publicUrl: '/talents/Liam/liam_photo_1.jpg', isPrimary: true, caption: 'Santa Liam Portrait' }
      ]
    },
    {
      canonicalId: 'TAL-PERRY',
      sourceName: 'PERRY',
      displayName: 'Perry',
      talentType: 'REAL_BEARD',
      status: 'ACTIVE',
      age: 67,
      height: '5’11',
      nationality: 'Denmark',
      baseTalentFee: 12000,
      metroManilaRate: 17000,
      provincialRate: 22100,
      holidayRate: 20000,
      specialRateNote: 'Amanpulo VIP booking (Dec 24-25) & SM Tuguegarao/Baguio/Urdaneta.',
      rateSourceNote: 'Santa Rate row 10',
      approvedForPublicDisplay: true,
      bio: 'Danish real-beard Santa entrusted with ultra-exclusive luxury resort appearances including Amanpulo.',
      aliases: ['PERRY', 'Perry'],
      photos: [
        { fileName: 'perry_photo_1.jpg', publicUrl: '/talents/Perry/perry_photo_1.jpg', isPrimary: true, caption: 'Santa Perry Amanpulo Talent' }
      ]
    },
    {
      canonicalId: 'TAL-ROY',
      sourceName: 'ROY',
      displayName: 'Roy',
      talentType: 'REAL_BEARD',
      status: 'ACTIVE',
      age: 61,
      height: '6’2',
      nationality: 'USA / American',
      baseTalentFee: 12000,
      metroManilaRate: 17000,
      provincialRate: 22100,
      holidayRate: 20000,
      specialRateNote: 'One Ayala Dec 12 and SM Aura confirmed talent.',
      rateSourceNote: 'Santa Rate row 11',
      approvedForPublicDisplay: false,
      bio: 'Tall, majestic American real-beard Santa with deep laugh and vibrant, photogenic red suit.',
      aliases: ['ROY', 'Roy'],
      photos: [
        { fileName: 'roy_photo_1.jpg', publicUrl: '/talents/Roy/roy_photo_1.jpg', isPrimary: true, caption: 'Santa Roy One Ayala Portrait' }
      ]
    },
    {
      canonicalId: 'TAL-PETER',
      sourceName: 'PETER ',
      displayName: 'Peter',
      talentType: 'REAL_BEARD',
      status: 'PENDING_VERIFICATION',
      age: null,
      height: null,
      nationality: null,
      baseTalentFee: 12000,
      metroManilaRate: 18000,
      provincialRate: 23400,
      holidayRate: 21000,
      specialRateNote: 'Listed in rate sheet row 4 and multiple bookings (SM Sucat, SMOA, SM Aura). No docx profile found in Real Beard archive.',
      rateSourceNote: 'Santa Rate row 4',
      approvedForPublicDisplay: false,
      bio: 'Senior real-beard Santa appearing extensively across Metro Manila SM Mall schedules.',
      aliases: ['PETER ', 'Peter', 'SANTA PETER'],
      photos: []
    },
    {
      canonicalId: 'TAL-TERRY',
      sourceName: 'Terry.docx',
      displayName: 'Terry',
      talentType: 'REAL_BEARD',
      status: 'ACTIVE',
      age: 71,
      height: '5’11',
      nationality: 'USA',
      baseTalentFee: 12000,
      metroManilaRate: 18000,
      provincialRate: 22000,
      holidayRate: 22000,
      specialRateNote: 'SM Clark, SM Rosales, SM Pampanga, SM Southmall confirmed talent.',
      rateSourceNote: 'Real Beard DOCX archive + booking schedules',
      approvedForPublicDisplay: false,
      bio: 'Venerable 71-year-old American real-beard Santa with quintessential grandfatherly warmth.',
      aliases: ['Terry'],
      photos: [
        { fileName: 'terry_photo_1.jpg', publicUrl: '/talents/Terry/terry_photo_1.jpg', isPrimary: true, caption: 'Santa Terry Classic' }
      ]
    },
    {
      canonicalId: 'TAL-MICKEYVER',
      sourceName: 'Mickeyver.docx',
      displayName: 'Mickeyver',
      talentType: 'REAL_BEARD',
      status: 'ACTIVE',
      age: 59,
      height: '5’10',
      nationality: 'Filipino / International',
      baseTalentFee: 12000,
      metroManilaRate: 17000,
      provincialRate: 22000,
      holidayRate: 20000,
      specialRateNote: 'SM Center Shaw multi-day contract (Dec 12, 19, 20). ₱36,000 package TF.',
      rateSourceNote: 'Real Beard DOCX archive + Confirmed Booking row 14',
      approvedForPublicDisplay: false,
      bio: 'Enthusiastic and articulate Santa with exceptional interactive rapport for mall celebrations.',
      aliases: ['Mickeyver', 'SANTA MICKEYVER'],
      photos: [
        { fileName: 'mickeyver_photo_1.jpg', publicUrl: '/talents/Mickeyver/mickeyver_photo_1.jpg', isPrimary: true, caption: 'Santa Mickeyver' }
      ]
    },
    {
      canonicalId: 'TAL-BENITO',
      sourceName: 'Benito.docx',
      displayName: 'Benito',
      talentType: 'REAL_BEARD',
      status: 'ACTIVE',
      age: 62,
      height: '5’11',
      nationality: 'Italian',
      baseTalentFee: 12000,
      metroManilaRate: 18000,
      provincialRate: 23400,
      holidayRate: 21000,
      specialRateNote: 'Dec 19 (Grae) & Dec 25 (SM Sta. Mesa) scheduled talent.',
      rateSourceNote: 'Real Beard DOCX archive',
      approvedForPublicDisplay: false,
      bio: 'Distinguished Italian real-beard Santa renowned for theatrical presentation and authentic costume.',
      aliases: ['Benito'],
      photos: [
        { fileName: 'benito_photo_1.jpg', publicUrl: '/talents/Benito/benito_photo_1.jpg', isPrimary: true, caption: 'Santa Benito' }
      ]
    },
    {
      canonicalId: 'TAL-RICHARD',
      sourceName: 'Richard.docx',
      displayName: 'Richard',
      talentType: 'REAL_BEARD',
      status: 'ACTIVE',
      age: 60,
      height: '5’10',
      nationality: 'USA / American',
      baseTalentFee: 12000,
      metroManilaRate: 17000,
      provincialRate: 22000,
      holidayRate: 20000,
      specialRateNote: 'Dec 19 (Light) & Dec 25 (SM San Lazaro) scheduled talent.',
      rateSourceNote: 'Real Beard DOCX archive',
      approvedForPublicDisplay: false,
      bio: 'Warm and genial American real-beard Santa with rich background in festive hospitality.',
      aliases: ['Richard'],
      photos: [
        { fileName: 'richard_photo_1.jpg', publicUrl: '/talents/Richard/richard_photo_1.jpg', isPrimary: true, caption: 'Santa Richard' }
      ]
    }
  ];

  for (const t of talentsData) {
    const { aliases, photos, ...data } = t;
    const talent = await prisma.talent.upsert({
      where: { canonicalId: t.canonicalId },
      update: data,
      create: data
    });

    for (const a of aliases) {
      await prisma.talentAlias.create({
        data: {
          talentId: talent.id,
          alias: a,
          sourceSheet: t.rateSourceNote
        }
      });
    }

    for (const p of photos) {
      await prisma.talentImage.create({
        data: {
          talentId: talent.id,
          fileName: p.fileName,
          originalPath: p.publicUrl,
          publicUrl: p.publicUrl,
          isPrimary: p.isPrimary,
          caption: p.caption,
          approvedForClient: t.approvedForPublicDisplay
        }
      });
    }
  }
  console.log(`Seeded ${talentsData.length} canonical talents with real extracted photos.`);

  // 3. System Settings
  const settings = [
    { key: 'COMPANY_NAME', value: 'Brillo Events Management Service', description: 'Official registered entity name' },
    { key: 'COMPANY_PHONE', value: '0927 887 2343', description: 'Public reference contact (Verify before launch)' },
    { key: 'COMPANY_EMAIL', value: 'brilloevents@gmail.com', description: 'Shared mailbox & sender (Verify before launch)' },
    { key: 'MM_TARGET_RATE', value: '18000', description: 'Standard Metro Manila 4-hour package target' },
    { key: 'PROVINCIAL_MULTIPLIER', value: '1.30', description: 'Target provincial calculation factor (+30% = ₱23,400)' },
    { key: 'HOLIDAY_MIN_RATE', value: '23000', description: 'Dec 24/25 starting quotation guidance' },
    { key: 'HOLIDAY_MAX_RATE', value: '30000', description: 'Dec 24/25 ceiling quotation guidance' },
    { key: 'STANDARD_DEPOSIT_PCT', value: '50', description: 'Standard reservation downpayment percentage' },
    { key: 'HOLD_DURATION_HOURS', value: '24', description: 'Temporary soft hold expiration window' },
  ];

  for (const s of settings) {
    await prisma.systemSetting.upsert({
      where: { key: s.key },
      update: { value: s.value, description: s.description },
      create: s
    });
  }
  console.log('System settings seeded.');

  // 4. Email Templates
  const templates = [
    {
      triggerKey: 'INQUIRY_RECEIVED',
      name: 'Inquiry Acknowledgement',
      subject: 'We Received Your Santa Inquiry — Brillo Events Santa Operations Hub',
      bodyTemplate: 'Dear {{client_name}},\n\nThank you for reaching out to Brillo Events Management Service regarding your holiday appearance for {{event_name}} on {{event_date}} at {{venue_name}}.\n\nOur operations team is currently reviewing talent calendar availability for your requested block. You can monitor the real-time status of your request at any time using your private link:\n{{status_link}}\n\nPlease note: This inquiry is not a confirmed booking. Bookings are secured only after a signed agreement and verified reservation payment.\n\nWarm regards,\nBrillo Events Management Team'
    },
    {
      triggerKey: 'HOLD_CREATED',
      name: '24-Hour Temporary Hold Notice',
      subject: 'Temporary Hold Reserved (Expires in 24 Hours) — {{event_name}}',
      bodyTemplate: 'Dear {{client_name}},\n\nGood news! A 24-hour temporary soft hold has been placed on Santa {{talent_name}} for {{event_name}} on {{event_date}} at {{venue_name}}.\n\nIMPORTANT EXPIRY TIME: {{hold_expires_at}}\n\nTo secure this date before the hold automatically releases, please review your quote and sign the agreement:\n{{status_link}}\n\nWarm regards,\nBrillo Events Operations'
    },
    {
      triggerKey: 'PAYMENT_VERIFIED',
      name: 'Payment Verified & Booking Secured',
      subject: 'Booking Confirmed & Secured — {{event_name}} (Brillo Events)',
      bodyTemplate: 'Dear {{client_name}},\n\nWe are delighted to confirm that your downpayment of {{amount}} for {{event_name}} has been verified by our finance team.\n\nYour Santa appearance is now officially SECURED for {{event_date}} (Call Time: {{call_time}}, Event Time: {{start_time}} - {{end_time}}) at {{venue_name}}.\n\nView your executed agreement and booking details:\n{{status_link}}\n\nThank you for choosing Brillo Events!\nBrillo Events Management Service'
    }
  ];

  for (const t of templates) {
    await prisma.emailTemplate.upsert({
      where: { triggerKey: t.triggerKey },
      update: { name: t.name, subject: t.subject, bodyTemplate: t.bodyTemplate },
      create: t
    });
  }
  console.log('Email templates seeded.');

  console.log('Database seeding finished successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
