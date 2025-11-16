// Student Seeder - Seeds demo students with proper structure
import { query } from '../config/db.js';
import bcrypt from 'bcryptjs';

const students = [
  {
    full_name: 'Rahul Sharma',
    email: 'rahul.sharma@sgtu.ac.in',
    registration_no: '2024SGTU10001',
    phone: '9876543210'
  },
  {
    full_name: 'Priya Patel',
    email: 'priya.patel@sgtu.ac.in',
    registration_no: '2024SGTU10002',
    phone: '9876543211'
  },
  {
    full_name: 'Amit Kumar',
    email: 'amit.kumar@sgtu.ac.in',
    registration_no: '2024SGTU20001',
    phone: '9876543212'
  },
  {
    full_name: 'Sneha Gupta',
    email: 'sneha.gupta@sgtu.ac.in',
    registration_no: '2024SGTU20002',
    phone: '9876543213'
  },
  {
    full_name: 'Vikram Singh',
    email: 'vikram.singh@sgtu.ac.in',
    registration_no: '2024SGTU30001',
    phone: '9876543214'
  },
  {
    full_name: 'Anjali Verma',
    email: 'anjali.verma@sgtu.ac.in',
    registration_no: '2024SGTU30002',
    phone: '9876543215'
  },
  {
    full_name: 'Rohan Mehta',
    email: 'rohan.mehta@sgtu.ac.in',
    registration_no: '2024SGTU40001',
    phone: '9876543216'
  },
  {
    full_name: 'Kavya Reddy',
    email: 'kavya.reddy@sgtu.ac.in',
    registration_no: '2024SGTU40002',
    phone: '9876543217'
  },
  {
    full_name: 'Test Student',
    email: 'test@sgtu.ac.in',
    registration_no: '2024SGTU99999',
    phone: '9999999999'
  },
  {
    full_name: 'Demo User',
    email: 'demo@sgtu.ac.in',
    registration_no: '2024SGTU00000',
    phone: '0000000000'
  }
];

export async function seedStudents(schools) {
  console.log('👨‍🎓 Seeding students...');
  
  if (!schools || schools.length === 0) {
    console.log('   ⏭  Skipped: No schools found\n');
    return;
  }

  const password = 'student123';
  const hashedPassword = await bcrypt.hash(password, 12);
  
  let created = 0;
  let skipped = 0;

  for (let i = 0; i < students.length; i++) {
    const student = students[i];
    // Assign schools in round-robin fashion
    const schoolIndex = i % schools.length;
    const school_id = schools[schoolIndex].id;

    try {
      const insertQuery = `
        INSERT INTO students (
          registration_no, email, password_hash, full_name, 
          school_id, phone
        )
        VALUES ($1, $2, $3, $4, $5, $6)
        ON CONFLICT (registration_no) DO NOTHING
        RETURNING id, email, registration_no
      `;
      
      const result = await query(insertQuery, [
        student.registration_no,
        student.email,
        hashedPassword,
        student.full_name,
        school_id,
        student.phone
      ]);
      
      if (result.length > 0) {
        console.log(`   ✓ Created: ${student.full_name} (${student.registration_no})`);
        created++;
      } else {
        skipped++;
        console.log(`   ⏭  Skipped: ${student.registration_no} (already exists)`);
      }
    } catch (error) {
      console.error(`   ✗ Failed: ${student.email} - ${error.message}`);
    }
  }

  console.log(`   ✅ Students: ${created} created, ${skipped} skipped\n`);
}

export default seedStudents;
