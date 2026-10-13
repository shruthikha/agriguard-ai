const mongoose = require('./node_modules/mongoose');
const dotenv = require('./node_modules/dotenv');
dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/agriguard';

async function viewDatabase() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('\n========================================================');
    console.log(`🌾 MongoDB Database: ${mongoose.connection.name}`);
    console.log(`🔗 Connected URI   : ${MONGO_URI}`);
    console.log('========================================================\n');

    const db = mongoose.connection.db;
    const collections = await db.listCollections().toArray();

    for (const col of collections) {
      const name = col.name;
      const count = await db.collection(name).countDocuments();
      console.log(`📂 Collection: [${name}] (${count} documents)`);

      // Show sample records
      const sample = await db.collection(name).find({}).limit(2).toArray();
      sample.forEach((doc, i) => {
        // Truncate large fields for clean terminal view
        const cleanDoc = { ...doc };
        if (cleanDoc.password) cleanDoc.password = '[HASHED_PASSWORD]';
        if (cleanDoc.diseaseDetails && cleanDoc.diseaseDetails.symptoms) {
          cleanDoc.diseaseDetails.symptoms = cleanDoc.diseaseDetails.symptoms.slice(0, 2);
        }
        console.log(`   #${i + 1}:`, JSON.stringify(cleanDoc, null, 2).split('\n').map(l => '     ' + l).join('\n'));
      });
      console.log('--------------------------------------------------------\n');
    }

    await mongoose.disconnect();
    console.log('✅ Done inspection.\n');
  } catch (err) {
    console.error('❌ Error viewing MongoDB:', err.message);
  }
}

viewDatabase();
