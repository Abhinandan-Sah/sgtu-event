/**
 * Stall Seeder - Production-Ready
 * 
 * @description Seeds stalls with auto-generated short QR tokens
 * @usage npm run seed
 * @category Seeder
 * @author SGTU Event Team
 * @version 2.0.0 (Production-Ready)
 * 
 * Features:
 * - Auto-generates short QR tokens (33 chars)
 * - Format: STALL_{number}_{timestamp}_{random_id}
 * - Production-safe with error handling
 * - No manual regeneration needed
 */

import { query } from '../config/db.js';
import crypto from 'crypto';

const stalls = [
  {
    stall_number: 'CS-001',
    stall_name: 'Computer Science Innovations',
    description: 'Showcasing AI, ML, and Web Development projects',
    location: 'Ground Floor, Block A'
  },
  {
    stall_number: 'ME-001',
    stall_name: 'Mechanical Engineering Projects',
    description: 'Robotics, Automation, and Manufacturing displays',
    location: 'Ground Floor, Block B'
  },
  {
    stall_number: 'BM-001',
    stall_name: 'Business Management Case Studies',
    description: 'Entrepreneurship and business innovation showcase',
    location: 'First Floor, Block A'
  },
  {
    stall_number: 'BT-001',
    stall_name: 'Biotechnology Research',
    description: 'Genetic research and biotech innovations',
    location: 'Second Floor, Block B'
  },
  {
    stall_number: 'CS-002',
    stall_name: 'AI & Machine Learning Lab',
    description: 'Deep Learning, Neural Networks, and AI applications',
    location: 'Ground Floor, Block A'
  },
  {
    stall_number: 'CE-001',
    stall_name: 'Civil Engineering Models',
    description: 'Sustainable construction and infrastructure projects',
    location: 'Ground Floor, Block B'
  }
];

export async function seedStalls(schools) {
  console.log('🏪 Seeding stalls...');
  
  if (!schools || schools.length === 0) {
    console.log('   ⏭  Skipped: No schools found\n');
    return;
  }

  let created = 0;
  let skipped = 0;

  for (let i = 0; i < stalls.length; i++) {
    const stall = stalls[i];
    // Assign schools in round-robin fashion
    const schoolIndex = i % schools.length;
    const school_id = schools[schoolIndex].id;

    try {
      // Generate production-ready short QR token (33 chars)
      // Format: STALL_{stall_number}_{timestamp}_{random_id}
      const timestamp = Date.now();
      const randomId = crypto.randomBytes(4).toString('base64').replace(/[^a-z0-9]/gi, '').toLowerCase().substring(0, 6);
      const qrToken = `STALL_${stall.stall_number}_${timestamp}_${randomId}`;
      
      // Validation: Ensure token is not too long
      if (qrToken.length > 50) {
        throw new Error(`Generated token too long: ${qrToken.length} chars`);
      }
      
      const insertQuery = `
        INSERT INTO stalls (
          stall_number, stall_name, school_id, description, 
          location, qr_code_token
        )
        VALUES ($1, $2, $3, $4, $5, $6)
        ON CONFLICT (stall_number) DO NOTHING
        RETURNING id, stall_number, stall_name
      `;
      
      const result = await query(insertQuery, [
        stall.stall_number,
        stall.stall_name,
        school_id,
        stall.description,
        stall.location,
        qrToken
      ]);
      
      if (result.length > 0) {
        console.log(`   ✓ Created: ${stall.stall_name} (${stall.stall_number})`);
        created++;
      } else {
        skipped++;
        console.log(`   ⏭  Skipped: ${stall.stall_number} (already exists)`);
      }
    } catch (error) {
      console.error(`   ✗ Failed: ${stall.stall_number} - ${error.message}`);
    }
  }

  console.log(`   ✅ Stalls: ${created} created, ${skipped} skipped\n`);
}

export default seedStalls;
