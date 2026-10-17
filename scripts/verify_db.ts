import prisma from "../lib/prisma";

async function verify() {
  const [bCount, tCount, cCount, eCount, pCount, uCount] = await Promise.all([
    prisma.booking.count(),
    prisma.talent.count(),
    prisma.dataConflict.count(),
    prisma.expense.count(),
    prisma.payment.count(),
    prisma.user.count(),
  ]);

  console.log("=== PERSISTED DATABASE COUNTS ===");
  console.log(`Users: ${uCount}`);
  console.log(`Talents: ${tCount}`);
  console.log(`Bookings: ${bCount}`);
  console.log(`Expenses: ${eCount}`);
  console.log(`Data Conflicts in Review Queue: ${cCount}`);
  console.log(`Payments: ${pCount}`);

  const sampleBookings = await prisma.booking.findMany({
    take: 5,
    include: {
      client: true,
      talentAssignments: { include: { talent: true } },
    },
    orderBy: { eventDate: "asc" },
  });

  console.log("\n=== SAMPLE IMPORTED BOOKINGS ===");
  sampleBookings.forEach((b) => {
    const talent = b.talentAssignments[0]?.talent;
    console.log(
      `[${b.bookingNumber}] ${b.eventDate.toISOString().slice(0, 10)} | ${b.mallOrVenue.padEnd(20)} | Client: ${(b.client?.companyName || b.eventName || "Unknown").padEnd(25)} | Santa: ${talent ? talent.displayName : "Unassigned"}`
    );
  });

  const sampleConflicts = await prisma.dataConflict.findMany({
    take: 5,
  });

  console.log("\n=== SAMPLE ENQUEUED CONFLICTS ===");
  sampleConflicts.forEach((c) => {
    console.log(`[${c.category}] at ${c.sourceCoordinates}: ${c.description}`);
  });
}

verify()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
