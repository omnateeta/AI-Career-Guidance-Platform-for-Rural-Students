/**
 * Seed script to populate database with competitive exams
 * Run: node scripts/seedExams.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const Exam = require('../models/Exam');
const examScraper = require('../services/examScraper');
const logger = require('../config/logger');

async function seedExams() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/career-guidance');
    console.log('✅ Connected to MongoDB');

    console.log('📚 Seeding competitive exams...');
    
    // Get baseline exams from scraper
    const baselineExams = examScraper.getBaselineExams();
    console.log(`📝 Found ${baselineExams.length} baseline exams`);

    // Insert or update exams
    let inserted = 0;
    let updated = 0;

    for (const exam of baselineExams) {
      const existing = await Exam.findOne({ 
        externalId: exam.externalId,
        apiSource: exam.apiSource 
      });

      if (existing) {
        // Update existing exam
        await Exam.findByIdAndUpdate(existing._id, { $set: exam });
        updated++;
        console.log(`  ✏️  Updated: ${exam.name}`);
      } else {
        // Insert new exam
        await Exam.create(exam);
        inserted++;
        console.log(`  ✅ Added: ${exam.name}`);
      }
    }

    console.log('\n✅ Seeding completed!');
    console.log(`📊 Results: ${inserted} new exams, ${updated} updated exams`);
    console.log(`📈 Total exams in database: ${await Exam.countDocuments()}`);

    // Display summary by category
    const categories = await Exam.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    console.log('\n📂 Exams by Category:');
    categories.forEach(cat => {
      console.log(`  ${cat._id}: ${cat.count} exams`);
    });

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding exams:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

seedExams();
