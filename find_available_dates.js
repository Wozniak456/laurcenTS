const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function findAvailableDates() {
  try {
    console.log('=== FINDING AVAILABLE DATES FOR FEEDING LOCATION 61 ===\n');
    
    const location_id = 61;
    
    // Check the last 30 days for available dates
    const today = new Date();
    const availableDates = [];
    
    for (let i = 0; i < 30; i++) {
      const checkDate = new Date(today);
      checkDate.setDate(today.getDate() - i);
      const dateStr = checkDate.toISOString().split('T')[0];
      
      // Check for posted operations after this date
      const checkDateTime = new Date(dateStr);
      checkDateTime.setUTCHours(23, 59, 59, 999);
      
      const postedDocuments = await prisma.documents.findMany({
        where: {
          location_id: location_id,
          date_time: { gt: checkDateTime },
          date_time_posted: { not: null }
        },
        take: 1
      });
      
      if (postedDocuments.length === 0) {
        availableDates.push(dateStr);
      }
    }
    
    console.log(`Found ${availableDates.length} available dates for feeding:`);
    availableDates.forEach((date, index) => {
      console.log(`  ${index + 1}. ${date}`);
    });
    
    if (availableDates.length > 0) {
      console.log(`\n✅ Recommended date for feeding: ${availableDates[0]}`);
      return availableDates[0];
    } else {
      console.log('\n❌ No available dates found in the last 30 days');
      return null;
    }
    
  } catch (error) {
    console.error('❌ Error finding available dates:', error);
    return null;
  } finally {
    await prisma.$disconnect();
  }
}

findAvailableDates();
