// Ranking Model - Student rankings for stalls (Category 2 - One-time top 3)
class RankingModel {
  constructor(data) {
    this.id = data.id;
    this.student_id = data.student_id;
    this.stall_id = data.stall_id;
    this.rank = data.rank;
    this.submitted_at = data.submitted_at;
    // Join fields
    this.student_name = data.student_name;
    this.registration_no = data.registration_no;
    this.stall_name = data.stall_name;
    this.stall_number = data.stall_number;
    this.school_name = data.school_name;
  }

  static async create(data, sql) {
    const query = `
      INSERT INTO rankings (student_id, stall_id, rank, submitted_at)
      VALUES ($1, $2, $3, NOW())
      RETURNING *
    `;
    const results = await sql(query, [
      data.student_id,
      data.stall_id,
      data.rank
    ]);
    return new RankingModel(results[0]);
  }

  // Bulk create rankings (student submits all 3 at once)
  static async bulkCreate(rankings, sql) {
    if (!rankings || rankings.length !== 3) {
      throw new Error('Must provide exactly 3 rankings');
    }

    const values = [];
    const placeholders = [];
    
    for (let i = 0; i < rankings.length; i++) {
      const offset = i * 3;
      placeholders.push(`($${offset + 1}, $${offset + 2}, $${offset + 3})`);
      values.push(
        rankings[i].student_id,
        rankings[i].stall_id,
        rankings[i].rank
      );
    }

    const query = `
      INSERT INTO rankings (student_id, stall_id, rank)
      VALUES ${placeholders.join(', ')}
      RETURNING *
    `;
    
    const results = await sql(query, values);
    return results.map(row => new RankingModel(row));
  }

  // Get student's rankings
  static async findByStudent(studentId, sql) {
    const query = `
      SELECT r.*,
        st.stall_name,
        st.stall_number,
        sc.school_name
      FROM rankings r
      LEFT JOIN stalls st ON r.stall_id = st.id
      LEFT JOIN schools sc ON st.school_id = sc.id
      WHERE r.student_id = $1
      ORDER BY r.rank ASC
    `;
    const results = await sql(query, [studentId]);
    return results.map(row => new RankingModel(row));
  }

  // Check if student has completed ranking
  static async hasStudentRanked(studentId, sql) {
    const query = `
      SELECT COUNT(*) as count FROM rankings WHERE student_id = $1
    `;
    const results = await sql(query, [studentId]);
    return parseInt(results[0]?.count || 0) === 3;
  }

  // Get all rankings for a stall
  static async findByStall(stallId, sql) {
    const query = `
      SELECT r.*,
        s.full_name as student_name,
        s.registration_no,
        sc.school_name as student_school
      FROM rankings r
      LEFT JOIN students s ON r.student_id = s.id
      LEFT JOIN schools sc ON s.school_id = sc.id
      WHERE r.stall_id = $1
      ORDER BY r.rank ASC, r.submitted_at ASC
    `;
    const results = await sql(query, [stallId]);
    return results.map(row => new RankingModel(row));
  }

  // Get stall ranking statistics
  static async getStallStats(stallId, sql) {
    const query = `
      SELECT 
        COUNT(*) FILTER (WHERE rank = 1) as rank_1_count,
        COUNT(*) FILTER (WHERE rank = 2) as rank_2_count,
        COUNT(*) FILTER (WHERE rank = 3) as rank_3_count,
        (COUNT(*) FILTER (WHERE rank = 1) * 3 +
         COUNT(*) FILTER (WHERE rank = 2) * 2 +
         COUNT(*) FILTER (WHERE rank = 3) * 1) as weighted_score
      FROM rankings
      WHERE stall_id = $1
    `;
    const results = await sql(query, [stallId]);
    return results[0];
  }

  // Global ranking statistics
  static async getGlobalStats(sql) {
    const query = `
      SELECT 
        COUNT(DISTINCT student_id) as students_who_ranked,
        COUNT(*) as total_rankings
      FROM rankings
    `;
    const results = await sql(query);
    return results[0];
  }
}

export default RankingModel;
