const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkBlockingDocuments() {
  try {
    console.log('=== CHECKING BLOCKING DOCUMENTS FOR LOCATION 61 ===\n');
    
    const location_id = 61;
    const date = '2025-07-30';
    
    console.log(`Checking location ${location_id} for date ${date}`);
    
    // Check for posted operations after this date
    const checkDate = new Date(date);
    checkDate.setUTCHours(23, 59, 59, 999);
    
    const postedDocuments = await prisma.documents.findMany({
      where: {
        location_id: location_id,
        date_time: { gt: checkDate },
        date_time_posted: { not: null }
      },
      include: {
        doctype: true,
        itemtransactions: {
          include: {
            itembatches: {
              include: { items: true }
            }
          }
        }
      },
      orderBy: { date_time: 'asc' }
    });
    
    console.log(`Found ${postedDocuments.length} posted documents that block operations:`);
    
    if (postedDocuments.length > 0) {
      postedDocuments.forEach((doc, index) => {
        console.log(`\n${index + 1}. Document ID: ${doc.id}`);
        console.log(`   Type: ${doc.doctype?.name} (ID: ${doc.doc_type_id})`);
        console.log(`   Date: ${doc.date_time}`);
        console.log(`   Posted: ${doc.date_time_posted}`);
        console.log(`   Executed by: ${doc.executed_by}`);
        console.log(`   Comments: ${doc.comments || 'None'}`);
        console.log(`   Transactions: ${doc.itemtransactions.length}`);
        
        if (doc.itemtransactions.length > 0) {
          console.log('   Transaction details:');
          doc.itemtransactions.forEach((tran, tIndex) => {
            console.log(`     ${tIndex + 1}. ID: ${tran.id}, Location: ${tran.location_id}, Quantity: ${tran.quantity}, Item: ${tran.itembatches?.items?.name || 'Unknown'}`);
          });
        }
      });
    }
    
    // Also check for any documents on the specific date
    console.log('\n=== CHECKING DOCUMENTS ON THE SPECIFIC DATE ===');
    
    const startOfDay = new Date(date + 'T00:00:00.000Z');
    const endOfDay = new Date(date + 'T23:59:59.999Z');
    
    const documentsOnDate = await prisma.documents.findMany({
      where: {
        location_id: location_id,
        date_time: {
          gte: startOfDay,
          lte: endOfDay
        }
      },
      include: {
        doctype: true,
        itemtransactions: true
      },
      orderBy: { date_time: 'asc' }
    });
    
    console.log(`\nDocuments on ${date}:`);
    
    if (documentsOnDate.length > 0) {
      documentsOnDate.forEach((doc, index) => {
        console.log(`  ${index + 1}. ID: ${doc.id}, Type: ${doc.doctype?.name}, Time: ${doc.date_time.toTimeString().split(' ')[0]}, Posted: ${doc.date_time_posted ? 'Yes' : 'No'}`);
      });
    } else {
      console.log('  No documents found on this date');
    }
    
  } catch (error) {
    console.error('❌ Error checking blocking documents:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkBlockingDocuments();
