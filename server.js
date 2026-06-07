import express from 'express';
import pg from 'pg';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json({ limit: '10mb' }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Create PostgreSQL connection pool
const encodedPassword = encodeURIComponent(process.env.DB_PASSWORD || '76TQGdB8QET$/Mb');
const connectionString = process.env.DATABASE_URL || 
  `postgres://${process.env.DB_USER || 'postgres'}:${encodedPassword}@${process.env.DB_HOST || 'aws-1-us-east-2.pooler.supabase.com'}:${process.env.DB_PORT || '5432'}/${process.env.DB_NAME || 'postgres'}`;

const sslEnabled = process.env.DB_SSL !== 'false';

const pgPool = new pg.Pool({
  connectionString,
  ssl: sslEnabled ? { rejectUnauthorized: false } : false,
  max: 10
});

// A helper to convert MySQL query to PostgreSQL query (replacing ? with $1, $2...)
function mysqlToPostgresQuery(sql, params = []) {
  let postgresSql = '';
  let inSingleQuote = false;
  let inDoubleQuote = false;
  let inBacktick = false;
  let paramIndex = 1;

  for (let i = 0; i < sql.length; i++) {
    const char = sql[i];
    if (char === "'" && sql[i - 1] !== '\\') {
      if (!inDoubleQuote && !inBacktick) {
        inSingleQuote = !inSingleQuote;
      }
      postgresSql += char;
    } else if (char === '"' && sql[i - 1] !== '\\') {
      if (!inSingleQuote && !inBacktick) {
        inDoubleQuote = !inDoubleQuote;
      }
      postgresSql += char;
    } else if (char === '`' && sql[i - 1] !== '\\') {
      if (!inSingleQuote && !inDoubleQuote) {
        inBacktick = !inBacktick;
      }
      postgresSql += char;
    } else if (char === '?' && !inSingleQuote && !inDoubleQuote && !inBacktick) {
      postgresSql += `$${paramIndex++}`;
    } else {
      postgresSql += char;
    }
  }

  // If it's an INSERT, append RETURNING id
  const trimmed = postgresSql.trim();
  const isInsert = trimmed.match(/^insert\s+into/i);
  if (isInsert && !trimmed.match(/returning/i)) {
    postgresSql = `${trimmed} RETURNING id`;
  }
  
  return { query: postgresSql, values: params };
}

// Wrapper to mimic mysql2/promise Pool behavior
const pool = {
  async query(sql, params) {
    const { query, values } = mysqlToPostgresQuery(sql, params);
    try {
      const res = await pgPool.query(query, values);
      let resultMeta = { affectedRows: res.rowCount };
      if (res.rows && res.rows.length > 0 && res.rows[0].id !== undefined) {
        resultMeta.insertId = res.rows[0].id;
      }
      const isInsert = sql.trim().match(/^insert\s+into/i);
      return [isInsert ? resultMeta : res.rows, res.fields];
    } catch (err) {
      console.error('Database query error:', err.message, '\nSQL:', query);
      throw err;
    }
  },
  async getConnection() {
    const client = await pgPool.connect();
    return {
      async query(sql, params) {
        const { query, values } = mysqlToPostgresQuery(sql, params);
        try {
          const res = await client.query(query, values);
          let resultMeta = { affectedRows: res.rowCount };
          if (res.rows && res.rows.length > 0 && res.rows[0].id !== undefined) {
            resultMeta.insertId = res.rows[0].id;
          }
          const isInsert = sql.trim().match(/^insert\s+into/i);
          return [isInsert ? resultMeta : res.rows, res.fields];
        } catch (err) {
          console.error('Database transaction query error:', err.message, '\nSQL:', query);
          throw err;
        }
      },
      release() {
        client.release();
      }
    };
  }
};

// Helper to log activities
async function logActivity(type, description, userId = null) {
  try {
    const timestamp = 'Just now';
    await pool.query(
      'INSERT INTO activities (type, description, timestamp, user_id) VALUES (?, ?, ?, ?)',
      [type, description, timestamp, userId]
    );
  } catch (err) {
    console.error('Failed to log activity:', err);
  }
}

async function saveBase64File(base64Str, prefix = 'doc') {
  if (!base64Str || !base64Str.startsWith('data:')) {
    return base64Str; // Return as-is if it's already a URL or empty
  }

  try {
    const matches = base64Str.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
    if (!matches || matches.length !== 3) {
      return null;
    }

    const mimeType = matches[1]; // e.g. "image/png" or "application/pdf"
    let extension = mimeType.split('/')[1] || 'bin';
    if (extension.includes('+')) extension = extension.split('+')[0];
    if (extension.includes('jpeg') || extension.includes('jpg')) {
      extension = 'jpg';
    } else if (extension.includes('png')) {
      extension = 'png';
    }

    const base64Data = matches[2];
    const buffer = Buffer.from(base64Data, 'base64');

    const filename = `${prefix}_${Date.now()}_${Math.floor(Math.random() * 100000)}.${extension}`;
    
    const projectRef = 'tfiuayzwivtlnswgklhf';
    const anonKey = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRmaXVheXp3aXZ0bG5zd2drbGhmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA3OTkzNjgsImV4cCI6MjA5NjM3NTM2OH0.PM9XWV1wfDhC93S7ZW6TVqECrIQEO9KkV_XkWrNB1wU';

    const uploadUrl = `https://${projectRef}.supabase.co/storage/v1/object/adina/${filename}`;

    const response = await fetch(uploadUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${anonKey}`,
        'apikey': anonKey,
        'Content-Type': mimeType
      },
      body: buffer
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error('Failed to upload file to Supabase Storage:', response.status, errText);
      return null;
    }

    const publicUrl = `https://${projectRef}.supabase.co/storage/v1/object/public/adina/${filename}`;
    return publicUrl;
  } catch (err) {
    console.error('Failed to save base64 file:', err);
    return null;
  }
}

// Helper to save base64 image and return URL path
async function saveBase64Image(base64Str) {
  return saveBase64File(base64Str, 'pet');
}

// Check database connection on startup
(async () => {
  try {
    const conn = await pool.getConnection();
    console.log('Successfully connected to Supabase PostgreSQL Database.');
    
    // Check if the database is initialized
    const [tables] = await conn.query(
      "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'users'"
    );
    if (tables.length === 0) {
      console.log('Database tables not found. Initializing schema from schema_postgres.sql...');
      const sqlPath = path.join(__dirname, 'schema_postgres.sql');
      if (fs.existsSync(sqlPath)) {
        const sql = fs.readFileSync(sqlPath, 'utf8');
        await conn.query(sql);
        console.log('Database schema successfully initialized and seeded.');
      } else {
        console.warn('schema_postgres.sql not found at ' + sqlPath);
      }
    }
    
    // Auto-migrate applications table to add pet_photo column if not present
    const [columns] = await conn.query(
      "SELECT column_name FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'applications' AND column_name = 'pet_photo'"
    );
    if (columns.length === 0) {
      await conn.query("ALTER TABLE applications ADD COLUMN pet_photo VARCHAR(500)");
      console.log("Added pet_photo column to applications table.");
    }

    // Auto-migrate animals table to add doc_attestation, doc_certificate, doc_id, and doc_other columns
    const [docAttCols] = await conn.query(
      "SELECT column_name FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'animals' AND column_name = 'doc_attestation'"
    );
    if (docAttCols.length === 0) {
      await conn.query("ALTER TABLE animals ADD COLUMN doc_attestation VARCHAR(500)");
      console.log("Added doc_attestation column to animals table.");
    }
    const [docCertCols] = await conn.query(
      "SELECT column_name FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'animals' AND column_name = 'doc_certificate'"
    );
    if (docCertCols.length === 0) {
      await conn.query("ALTER TABLE animals ADD COLUMN doc_certificate VARCHAR(500)");
      console.log("Added doc_certificate column to animals table.");
    }
    const [docIdCols] = await conn.query(
      "SELECT column_name FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'animals' AND column_name = 'doc_id'"
    );
    if (docIdCols.length === 0) {
      await conn.query("ALTER TABLE animals ADD COLUMN doc_id VARCHAR(500)");
      console.log("Added doc_id column to animals table.");
    }
    const [docOtherCols] = await conn.query(
      "SELECT column_name FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'animals' AND column_name = 'doc_other'"
    );
    if (docOtherCols.length === 0) {
      await conn.query("ALTER TABLE animals ADD COLUMN doc_other VARCHAR(500)");
      console.log("Added doc_other column to animals table.");
    }

    // Auto-migrate users table to add id_type, id_last4, id_doc columns
    const [idTypeCols] = await conn.query(
      "SELECT column_name FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'users' AND column_name = 'id_type'"
    );
    if (idTypeCols.length === 0) {
      await conn.query("ALTER TABLE users ADD COLUMN id_type VARCHAR(50)");
      console.log("Added id_type column to users table.");
    }
    const [idLast4Cols] = await conn.query(
      "SELECT column_name FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'users' AND column_name = 'id_last4'"
    );
    if (idLast4Cols.length === 0) {
      await conn.query("ALTER TABLE users ADD COLUMN id_last4 VARCHAR(4)");
      console.log("Added id_last4 column to users table.");
    }
    const [idDocCols] = await conn.query(
      "SELECT column_name FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'users' AND column_name = 'id_doc'"
    );
    if (idDocCols.length === 0) {
      await conn.query("ALTER TABLE users ADD COLUMN id_doc VARCHAR(500)");
      console.log("Added id_doc column to users table.");
    }
    
    // Create members table if not exists
    await conn.query(`
      CREATE TABLE IF NOT EXISTS members (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        registry_id VARCHAR(50) NOT NULL UNIQUE,
        region VARCHAR(100),
        country VARCHAR(100),
        status VARCHAR(50) DEFAULT 'Active',
        contact VARCHAR(255),
        phone VARCHAR(100),
        last_audit VARCHAR(100),
        img VARCHAR(500),
        website VARCHAR(255),
        assistance_dog_type VARCHAR(255),
        facility_type VARCHAR(100),
        disabilities_serviced VARCHAR(500),
        demographic_served VARCHAR(500),
        geographical_area VARCHAR(100),
        other_info TEXT,
        address TEXT
      )
    `);

    // Check and add address column to members table if not exists
    const [addressCols] = await conn.query(
      "SELECT column_name FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'members' AND column_name = 'address'"
    );
    if (addressCols.length === 0) {
      await conn.query("ALTER TABLE members ADD COLUMN address TEXT");
      console.log("Added address column to members table.");
    }

    // Alter demographic_served size to support long strings
    await conn.query("ALTER TABLE members ALTER COLUMN demographic_served TYPE VARCHAR(500)");
    
    const [countRes] = await conn.query("SELECT COUNT(*) as count FROM members");
    if (parseInt(countRes[0].count || '0', 10) === 0) {
      await conn.query(`
        INSERT INTO members (name, registry_id, region, country, status, contact, phone, last_audit, img, website, assistance_dog_type, facility_type, disabilities_serviced, demographic_served, geographical_area, other_info, address) VALUES
        ('Assistance Dogs Australia', 'ADI-20932', 'Asia Pacific', 'Australia', 'Active', 'Sarah Jennings', '+61 2 9876 5432', 'Oct 12, 2023', 'https://images.unsplash.com/photo-1544568100-847a948585b9?auto=format&fit=crop&q=80&w=100', 'https://www.assistancedogsaustralia.org.au', 'Service, Hearing, Autism', 'Non-Profit', 'Visual, Hearing, Mobility, Autism', 'All Age', 'National', 'Assistance Dogs Australia trains and places unique dogs with people who have disabilities to provide physical and emotional support.', '123 Innovation Way, Sydney, NSW, Australia'),
        ('Autism Assistance Dogs Ireland', 'ADI-11842', 'Europe', 'Ireland', 'Under Review', 'Liam O''Connor', '+353 21 432 1098', 'Jan 05, 2024', 'https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&q=80&w=100', 'https://www.autismassistancedogsireland.ie', 'Service, Autism', 'Non-Profit', 'Autism', 'Children', 'National', 'AADI trains dogs to provide safety, independence and companionship to children with autism and their families.', '45 Cork St, Cork, Ireland'),
        ('Canine Companions', 'ADI-44091', 'North America', 'USA', 'Active', 'David Miller', '+1 707-577-1700', 'Nov 22, 2023', 'https://images.unsplash.com/photo-1537151608828-ea2b11777ee8?auto=format&fit=crop&q=80&w=100', 'https://canine.org', 'Service, Hearing, Facility', 'Non-Profit', 'Hearing, Mobility, Autism', 'All Age', 'National', 'Canine Companions is a non-profit organization that provides service dogs free of charge to adults, children and veterans with disabilities.', '244 California Ave, Santa Rosa, CA, USA')
      `);
      console.log("Seed members inserted.");
    }
    
    conn.release();
  } catch (err) {
    console.error('Database connection failed on startup:', err);
  }
})();

// ==========================================
// 1. PUBLIC API ENDPOINTS
// ==========================================

app.get('/api/test-db-connection', async (req, res) => {
  try {
    const conn = await pool.getConnection();
    const [rows] = await conn.query('SELECT 1 + 1 AS result');
    conn.release();
    return res.json({ 
      success: true, 
      message: 'Successfully connected to database!', 
      result: rows[0].result,
      config: {
        host: dbConfig.host,
        port: dbConfig.port,
        user: dbConfig.user,
        database: dbConfig.database,
        hasPassword: !!dbConfig.password
      }
    });
  } catch (err) {
    return res.status(500).json({ 
      success: false, 
      error: err.message,
      code: err.code,
      errno: err.errno,
      sqlState: err.sqlState,
      config: {
        host: dbConfig.host,
        port: dbConfig.port,
        user: dbConfig.user,
        database: dbConfig.database,
        hasPassword: !!dbConfig.password
      }
    });
  }
});

// Verify Service Animal by Microchip
app.get('/api/verify/:microchip', async (req, res) => {
  const { microchip } = req.params;
  try {
    const [animals] = await pool.query('SELECT * FROM animals WHERE microchip = ?', [microchip]);
    if (animals.length === 0) {
      return res.status(404).json({ success: false, error: 'No certified record found for this microchip number.' });
    }

    const animal = animals[0];
    let owner = null;

    if (animal.handler_id) {
      const [users] = await pool.query('SELECT name, img, member_since, registry_id, status, residential_country, phone, id_last4 FROM users WHERE id = ?', [animal.handler_id]);
      if (users.length > 0) {
        owner = users[0];
      }
    }

    // Look up the training facility from the members program list
    let facilityMember = null;
    if (animal.facility_name) {
      const [members] = await pool.query('SELECT name, country, phone, website, contact, region FROM members WHERE name = ? LIMIT 1', [animal.facility_name]);
      if (members.length > 0) {
        facilityMember = members[0];
      }
    }

    // Determine rabies status
    let rabiesStatus = 'Unknown';
    if (animal.rabies_expiration) {
      const exp = new Date(animal.rabies_expiration);
      rabiesStatus = exp > new Date() ? 'Up to Date' : 'Expired';
    }

    res.json({
      success: true,
      data: {
        pet: {
          name: animal.name,
          breed: animal.breed,
          photo: animal.img || 'https://images.unsplash.com/photo-1541888946425-d81bb19480c5?auto=format&fit=crop&q=80&w=200',
          microchip: animal.microchip,
          registryId: animal.registry_id,
          type: animal.trained_task || 'Assistance Dog',
          status: animal.status === 'Certified' ? 'Active Certification' : animal.status === 'Pending' ? 'Pending Verification' : 'Expired Certification',
          gender: animal.gender || 'N/A',
          weight: animal.weight || 'N/A',
          color: animal.color || 'N/A',
          rabiesStatus,
          rabiesExpiration: animal.rabies_expiration ? new Date(animal.rabies_expiration).toLocaleDateString() : 'N/A',
          rabiesSerial: animal.rabies_serial || 'N/A',
          rabiesBrand: animal.rabies_brand || 'N/A',
          rabiesType: animal.rabies_type || 'N/A'
        },
        owner: owner ? {
          name: owner.name,
          photo: owner.img || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=100',
          status: owner.status === 'Active' ? 'Verified Registry Member' : 'Pending Verification',
          accountStatus: owner.status || 'N/A',
          country: owner.residential_country || 'N/A',
          memberSince: owner.member_since,
          registryNumber: owner.registry_id,
          idLast4: owner.id_last4 || 'N/A'
        } : {
          name: 'Unknown Handler',
          photo: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=100',
          status: 'Not Registered',
          accountStatus: 'N/A',
          country: 'N/A',
          memberSince: 'N/A',
          registryNumber: 'N/A'
        },
        facility: {
          name: animal.facility_name || 'Accredited Training Center',
          accreditation: 'ADI Global Member Accreditation',
          location: facilityMember ? facilityMember.country : (owner ? owner.residential_country : 'N/A'),
          contact: facilityMember ? facilityMember.phone : (owner ? owner.phone : 'N/A'),
          trainer: animal.trainer_name || 'Certified Trainer',
          trainedTask: animal.trained_task || 'Assistance Dog',
          completionDate: animal.completion_date ? new Date(animal.completion_date).toLocaleDateString() : 'N/A',
          website: facilityMember ? facilityMember.website : 'N/A'
        },
        verificationId: `VER-${animal.registry_id}-${Math.floor(100 + Math.random() * 900)}`,
        dateVerified: new Date().toLocaleDateString()
      }
    });
  } catch (err) {
    console.error('Verify certificate error:', err);
    res.status(500).json({ success: false, error: 'Database query failed.' });
  }
});

// Submit Application (Apply Now)
app.post('/api/applications', async (req, res) => {
  const data = req.body;
  try {
    const petPhotoUrl = await saveBase64Image(data.pet_photo);

    const [result] = await pool.query(
      `INSERT INTO applications (
        handler_name, phone, email, country, address, id_type, id_last4,
        pet_name, pet_breed, pet_gender, pet_weight, pet_microchip, pet_dob, pet_color,
        rabies_expiration, rabies_serial, rabies_brand, rabies_type,
        facility_name, trainer_name, trained_task, completion_date, status, pet_photo
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Pending', ?)`,
      [
        data.handler_name, data.phone, data.email, data.country, data.address, data.id_type || 'Passport', data.id_last4,
        data.pet_name, data.pet_breed, data.pet_gender || 'Male', data.pet_weight, data.pet_microchip, data.pet_dob || null, data.pet_color,
        data.rabies_expiration || null, data.rabies_serial, data.rabies_brand, data.rabies_type || '3-Year Vaccine',
        data.facility_name, data.trainer_name, data.trained_task, data.completion_date || null,
        petPhotoUrl
      ]
    );

    await logActivity('application', `New application submitted for pet ${data.pet_name} by ${data.handler_name}`);

    res.json({ success: true, id: result.insertId });
  } catch (err) {
    console.error('Submit application error:', err);
    res.status(500).json({ success: false, error: 'Failed to submit application.' });
  }
});

// ==========================================
// 2. AUTHENTICATION ENDPOINT
// ==========================================

app.post('/api/auth/login', async (req, res) => {
  const { email, password, role } = req.body;
  try {
    const [users] = await pool.query(
      'SELECT * FROM users WHERE LOWER(email) = LOWER(?) AND password = ? AND role = ?',
      [email, password, role]
    );

    if (users.length === 0) {
      return res.status(401).json({ success: false, error: 'Invalid email, password or portal selection.' });
    }

    const user = users[0];
    delete user.password; // Do not return password to frontend

    await logActivity('auth', `${user.name} logged in successfully`, user.id);

    res.json({ success: true, user });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ success: false, error: 'Authentication database check failed.' });
  }
});

// ==========================================
// 3. OWNER DASHBOARD ENDPOINTS
// ==========================================

// Owner Stats
app.get('/api/owner/stats/:ownerId', async (req, res) => {
  const { ownerId } = req.params;
  const parsedOwnerId = parseInt(ownerId, 10);
  try {
    const [[animalsCount]] = await pool.query('SELECT COUNT(*) AS total FROM animals WHERE handler_id = ?', [parsedOwnerId]);
    const [[activeRequests]] = await pool.query("SELECT COUNT(*) AS total FROM travel_requests WHERE owner_id = ? AND status = 'Pending'", [parsedOwnerId]);
    const [[certifiedCount]] = await pool.query("SELECT COUNT(*) AS total FROM animals WHERE handler_id = ? AND status = 'Certified'", [parsedOwnerId]);
    const [[completedTrips]] = await pool.query("SELECT COUNT(*) AS total FROM travel_requests WHERE owner_id = ? AND status = 'Approved'", [parsedOwnerId]);

    res.json({
      success: true,
      stats: {
        registeredAnimals: String(animalsCount.total).padStart(2, '0'),
        activeRequests: String(activeRequests.total).padStart(2, '0'),
        certifications: String(certifiedCount.total).padStart(2, '0'),
        tripsCompleted: String(completedTrips.total).padStart(2, '0')
      }
    });
  } catch (err) {
    console.error('Get owner stats error:', err);
    res.status(500).json({ success: false, error: 'Failed to fetch owner statistics.' });
  }
});

// Owner's Registered Animals
app.get('/api/owner/animals/:ownerId', async (req, res) => {
  const { ownerId } = req.params;
  try {
    const [animals] = await pool.query('SELECT * FROM animals WHERE handler_id = ? ORDER BY id DESC', [parseInt(ownerId, 10)]);
    res.json({ success: true, animals });
  } catch (err) {
    console.error('Get owner animals error:', err);
    res.status(500).json({ success: false, error: 'Failed to fetch registered animals.' });
  }
});

// Link Animal by Microchip
app.post('/api/owner/animals/link', async (req, res) => {
  const { ownerId, microchip } = req.body;
  const parsedOwnerId = parseInt(ownerId, 10);
  try {
    const [animals] = await pool.query('SELECT * FROM animals WHERE microchip = ?', [microchip]);
    if (animals.length === 0) {
      return res.status(404).json({ success: false, error: 'No certified record found for this microchip number.' });
    }

    const animal = animals[0];
    if (animal.handler_id) {
      if (animal.handler_id == parsedOwnerId) {
        return res.status(400).json({ success: false, error: 'This animal is already linked to your profile.' });
      }
      return res.status(400).json({ success: false, error: 'This animal is already registered to another handler.' });
    }

    await pool.query('UPDATE animals SET handler_id = ? WHERE id = ?', [parsedOwnerId, animal.id]);
    await logActivity('animal_link', `Linked animal ${animal.name} (Microchip: ${microchip}) to owner ID ${parsedOwnerId}`, parsedOwnerId);

    const [updatedAnimal] = await pool.query('SELECT * FROM animals WHERE id = ?', [animal.id]);
    res.json({ success: true, animal: updatedAnimal[0] });
  } catch (err) {
    console.error('Link animal error:', err);
    res.status(500).json({ success: false, error: 'Failed to link animal.' });
  }
});

// Owner's Travel Requests
app.get('/api/owner/travel/:ownerId', async (req, res) => {
  const { ownerId } = req.params;
  try {
    const [requests] = await pool.query(
      `SELECT t.*, a.name AS animalName, TO_CHAR(t.travel_date, 'YYYY-MM-DD') AS travelDate, TO_CHAR(t.submitted_at, 'Mon DD, YYYY') AS submittedAt 
       FROM travel_requests t 
       JOIN animals a ON t.animal_id = a.id 
       WHERE t.owner_id = ? 
       ORDER BY t.id DESC`,
      [ownerId]
    );
    res.json({ success: true, requests });
  } catch (err) {
    console.error('Get owner travel requests error:', err);
    res.status(500).json({ success: false, error: 'Failed to fetch travel requests.' });
  }
});

// Submit Travel Request
app.post('/api/owner/travel', async (req, res) => {
  const { ownerId, animalId, travelDate, flightNumber, confirmationNumber, route } = req.body;
  try {
    const [result] = await pool.query(
      `INSERT INTO travel_requests (owner_id, animal_id, travel_date, flight_number, confirmation_number, route, status) 
       VALUES (?, ?, ?, ?, ?, ?, 'Pending')`,
      [ownerId, animalId, travelDate, flightNumber, confirmationNumber, route]
    );

    const [animals] = await pool.query('SELECT name FROM animals WHERE id = ?', [animalId]);
    const animalName = animals.length > 0 ? animals[0].name : 'Unknown';

    await logActivity('travel_request', `Submitted travel request REQ-${result.insertId} for ${animalName}`, ownerId);

    res.json({
      success: true,
      request: {
        id: `REQ-${result.insertId}`,
        travelDate,
        flightNumber,
        confirmationNumber,
        route,
        animalId: animalName,
        status: 'Pending',
        submittedAt: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
      }
    });
  } catch (err) {
    console.error('Submit travel request error:', err);
    res.status(500).json({ success: false, error: 'Failed to submit travel request.' });
  }
});

// Update Profile
app.put('/api/owner/profile/:ownerId', async (req, res) => {
  const { ownerId } = req.params;
  const parsedOwnerId = parseInt(ownerId, 10);
  const { name, phone, residential_country, address } = req.body;
  try {
    await pool.query(
      'UPDATE users SET name = ?, phone = ?, residential_country = ?, address = ? WHERE id = ?',
      [name, phone, residential_country, address, parsedOwnerId]
    );
    
    await logActivity('profile_update', `Updated profile information for user ID ${parsedOwnerId}`, parsedOwnerId);

    const [updated] = await pool.query('SELECT * FROM users WHERE id = ?', [parsedOwnerId]);
    res.json({ success: true, user: updated[0] });
  } catch (err) {
    console.error('Update profile error:', err);
    res.status(500).json({ success: false, error: 'Failed to update profile.' });
  }
});

// Update Password
app.put('/api/owner/password/:ownerId', async (req, res) => {
  const { ownerId } = req.params;
  const parsedOwnerId = parseInt(ownerId, 10);
  const { currentPassword, newPassword } = req.body;
  try {
    const [users] = await pool.query('SELECT * FROM users WHERE id = ?', [parsedOwnerId]);
    if (users.length === 0) {
      return res.status(404).json({ success: false, error: 'User not found.' });
    }
    const user = users[0];
    if (user.password !== currentPassword) {
      return res.status(400).json({ success: false, error: 'Incorrect current password.' });
    }

    await pool.query('UPDATE users SET password = ? WHERE id = ?', [newPassword, parsedOwnerId]);
    await logActivity('password_change', `Changed password for user ID ${ownerId}`, ownerId);

    res.json({ success: true });
  } catch (err) {
    console.error('Update password error:', err);
    res.status(500).json({ success: false, error: 'Failed to update password.' });
  }
});

// ==========================================
// 4. ADMIN DASHBOARD ENDPOINTS
// ==========================================

// Admin stats
app.get('/api/admin/stats', async (req, res) => {
  try {
    const [[activeRegistrations]] = await pool.query("SELECT COUNT(*) AS total FROM animals WHERE status = 'Certified'");
    const [[newApplications]] = await pool.query("SELECT COUNT(*) AS total FROM applications WHERE status = 'Pending'");
    const [[certificationsIssued]] = await pool.query("SELECT COUNT(*) AS total FROM animals WHERE status = 'Certified'");
    const [[auditLogs]] = await pool.query("SELECT COUNT(*) AS total FROM activities");

    res.json({
      success: true,
      stats: {
        activeRegistrations: activeRegistrations.total.toLocaleString(),
        newApplications: String(newApplications.total),
        certificationsIssued: String(certificationsIssued.total),
        auditLogs: auditLogs.total > 1000 ? `${(auditLogs.total / 1000).toFixed(0)}k` : String(auditLogs.total)
      }
    });
  } catch (err) {
    console.error('Get admin stats error:', err);
    res.status(500).json({ success: false, error: 'Failed to fetch admin stats.' });
  }
});

// ==========================================
// MEMBER PROGRAMS ENDPOINTS
// ==========================================

// Get all member programs
app.get('/api/admin/members', async (req, res) => {
  try {
    const [members] = await pool.query('SELECT * FROM members ORDER BY id DESC');
    res.json({ success: true, members });
  } catch (err) {
    console.error('Get members error:', err);
    res.status(500).json({ success: false, error: 'Failed to fetch member programs.' });
  }
});

// Add new member program
app.post('/api/admin/members', async (req, res) => {
  const data = req.body;
  try {
    const registry_id = `ADI-${Math.floor(10000 + Math.random() * 90000)}`;
    const last_audit = new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });
    const img = data.img || '';
    
    const [result] = await pool.query(
      `INSERT INTO members (
        name, registry_id, region, country, status, contact, phone, last_audit, img,
        website, assistance_dog_type, facility_type, disabilities_serviced,
        demographic_served, geographical_area, other_info, address
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        data.name, registry_id, data.region || 'North America', data.country, data.status || 'Active',
        data.contact || 'Primary Contact', data.phone || '', last_audit, img,
        data.website || '', data.assistance_dog_type || '', data.facility_type || 'Non-Profit',
        data.disabilities_serviced || '', data.demographic_served || 'All Age',
        data.geographical_area || 'National', data.other_info || '', data.address || ''
      ]
    );
    
    await logActivity('member_addition', `New Member Program '${data.name}' (${registry_id}) was registered.`);
    res.json({ success: true, memberId: result.insertId });
  } catch (err) {
    console.error('Add member error:', err);
    res.status(500).json({ success: false, error: 'Failed to create member program.' });
  }
});

// Edit member program
app.put('/api/admin/members/:id', async (req, res) => {
  const { id } = req.params;
  const data = req.body;
  try {
    await pool.query(
      `UPDATE members SET 
        name = ?, region = ?, country = ?, status = ?, contact = ?, phone = ?, 
        website = ?, assistance_dog_type = ?, facility_type = ?, disabilities_serviced = ?, 
        demographic_served = ?, geographical_area = ?, other_info = ?, address = ?, img = ?
      WHERE id = ?`,
      [
        data.name, data.region, data.country, data.status, data.contact, data.phone,
        data.website, data.assistance_dog_type, data.facility_type, data.disabilities_serviced,
        data.demographic_served, data.geographical_area, data.other_info, data.address, data.img || null,
        parseInt(id, 10)
      ]
    );
    
    await logActivity('member_update', `Member Program '${data.name}' details were updated.`);
    res.json({ success: true });
  } catch (err) {
    console.error('Edit member error:', err);
    res.status(500).json({ success: false, error: 'Failed to update member program.' });
  }
});

// Bulk import member programs
app.post('/api/admin/members/import', async (req, res) => {
  const { members } = req.body;
  if (!Array.isArray(members)) {
    return res.status(400).json({ success: false, error: 'Invalid members list.' });
  }
  try {
    const last_audit = new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });
    const img = 'https://images.unsplash.com/photo-1544568100-847a948585b9?auto=format&fit=crop&q=80&w=100';

    for (const member of members) {
      if (!member.name) continue;
      const registry_id = `ADI-${Math.floor(10000 + Math.random() * 90000)}`;
      await pool.query(
        `INSERT INTO members (
          name, registry_id, region, country, status, contact, phone, last_audit, img,
          website, assistance_dog_type, facility_type, disabilities_serviced,
          demographic_served, geographical_area, other_info, address
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          member.name, registry_id, member.region || 'North America', member.country || '', 'Active',
          member.contact || 'Primary Contact', member.phone || '', last_audit, img,
          member.website || '', member.assistance_dog_type || '', member.facility_type || 'Non-Profit',
          member.disabilities_serviced || '', member.demographic_served || 'All Age',
          member.geographical_area || 'National', member.other_info || '', member.address || ''
        ]
      );
    }

    await logActivity('member_import', `Imported ${members.length} member programs via CSV.`);
    res.json({ success: true });
  } catch (err) {
    console.error('Import members error:', err);
    res.status(500).json({ success: false, error: 'Failed to import member programs.' });
  }
});

// Public list of member programs
app.get('/api/members', async (req, res) => {
  try {
    const [members] = await pool.query('SELECT * FROM members ORDER BY id DESC');
    res.json({ success: true, members });
  } catch (err) {
    console.error('Get public members error:', err);
    res.status(500).json({ success: false, error: 'Failed to fetch member programs.' });
  }
});

// Delete member program
app.delete('/api/admin/members/:id', async (req, res) => {
  const { id } = req.params;
  const parsedId = parseInt(id, 10);
  try {
    const [members] = await pool.query('SELECT name FROM members WHERE id = ?', [parsedId]);
    if (members.length > 0) {
      await pool.query('DELETE FROM members WHERE id = ?', [parsedId]);
      await logActivity('member_deletion', `Member Program '${members[0].name}' was removed from registry.`);
    }
    res.json({ success: true });
  } catch (err) {
    console.error('Delete member error:', err);
    res.status(500).json({ success: false, error: 'Failed to delete member program.' });
  }
});

// Admin list animals
app.get('/api/admin/animals', async (req, res) => {
  try {
    const [animals] = await pool.query(`
      SELECT a.*, u.name AS handler, a.id AS db_id, a.registry_id AS id
      FROM animals a 
      LEFT JOIN users u ON a.handler_id = u.id 
      ORDER BY a.id DESC
    `);
    res.json({ success: true, animals });
  } catch (err) {
    console.error('Get admin animals list error:', err);
    res.status(500).json({ success: false, error: 'Failed to fetch animals.' });
  }
});

// Admin register service animal directly
app.post('/api/admin/animals', async (req, res) => {
  const data = req.body;
  try {
    const petPhotoUrl = await saveBase64Image(data.img);
    const docAttestationUrl = await saveBase64File(data.doc_attestation, 'attestation');
    const docCertificateUrl = await saveBase64File(data.doc_certificate, 'certificate');
    const docIdUrl = await saveBase64File(data.doc_id, 'id_doc');
    const docOtherUrl = await saveBase64File(data.doc_other, 'other_doc');
    const registry_id = `SAR-${Math.floor(1000 + Math.random() * 9000)}`;

    const [result] = await pool.query(
      `INSERT INTO animals (
        registry_id, name, breed, gender, weight, microchip, date_of_birth, color,
        rabies_expiration, rabies_serial, rabies_brand, rabies_type,
        facility_name, trainer_name, trained_task, completion_date, handler_id, status, img,
        doc_attestation, doc_certificate, doc_id, doc_other
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        registry_id, data.name, data.breed, data.gender, data.weight, data.microchip, data.date_of_birth || null, data.color,
        data.rabies_expiration || null, data.rabies_serial, data.rabies_brand, data.rabies_type,
        data.facility_name, data.trainer_name, data.trained_task, data.completion_date || null, data.handler_id || null, data.status || 'Certified',
        petPhotoUrl || 'https://images.unsplash.com/photo-1541888946425-d81bb19480c5?auto=format&fit=crop&q=80&w=100',
        docAttestationUrl || null, docCertificateUrl || null, docIdUrl || null, docOtherUrl || null
      ]
    );

    await logActivity('animal_registration', `Admin registered service animal ${data.name} (Registry ID: ${registry_id})`);

    res.json({ success: true, animalId: result.insertId, registryId: registry_id });
  } catch (err) {
    console.error('Admin create animal error:', err);
    res.status(500).json({ success: false, error: 'Failed to register animal.' });
  }
});

// Admin edit service animal
app.put('/api/admin/animals/:db_id', async (req, res) => {
  const { db_id } = req.params;
  const parsedDbId = parseInt(db_id, 10);
  const data = req.body;
  try {
    const petPhotoUrl = await saveBase64Image(data.img);
    const docAttestationUrl = await saveBase64File(data.doc_attestation, 'attestation');
    const docCertificateUrl = await saveBase64File(data.doc_certificate, 'certificate');
    const docIdUrl = await saveBase64File(data.doc_id, 'id_doc');
    const docOtherUrl = await saveBase64File(data.doc_other, 'other_doc');

    const [existing] = await pool.query('SELECT img, doc_attestation, doc_certificate, doc_id, doc_other FROM animals WHERE id = ?', [parsedDbId]);
    const finalPhotoUrl = petPhotoUrl || (existing.length > 0 ? existing[0].img : null);
    const finalAttestationUrl = docAttestationUrl || (existing.length > 0 ? existing[0].doc_attestation : null);
    const finalCertificateUrl = docCertificateUrl || (existing.length > 0 ? existing[0].doc_certificate : null);
    const finalIdUrl = docIdUrl || (existing.length > 0 ? existing[0].doc_id : null);
    const finalOtherUrl = docOtherUrl || (existing.length > 0 ? existing[0].doc_other : null);

    await pool.query(
      `UPDATE animals SET 
        name = ?, breed = ?, gender = ?, weight = ?, microchip = ?, date_of_birth = ?, color = ?,
        rabies_expiration = ?, rabies_serial = ?, rabies_brand = ?, rabies_type = ?,
        facility_name = ?, trainer_name = ?, trained_task = ?, completion_date = ?, handler_id = ?, status = ?, img = ?,
        doc_attestation = ?, doc_certificate = ?, doc_id = ?, doc_other = ?
      WHERE id = ?`,
      [
        data.name, data.breed, data.gender, data.weight, data.microchip, data.date_of_birth || null, data.color,
        data.rabies_expiration || null, data.rabies_serial, data.rabies_brand, data.rabies_type,
        data.facility_name, data.trainer_name, data.trained_task, data.completion_date || null, data.handler_id || null, data.status,
        finalPhotoUrl, finalAttestationUrl, finalCertificateUrl, finalIdUrl, finalOtherUrl,
        parsedDbId
      ]
    );

    await logActivity('animal_update', `Admin updated service animal ${data.name} (DB ID: ${db_id})`);

    res.json({ success: true });
  } catch (err) {
    console.error('Admin edit animal error:', err);
    res.status(500).json({ success: false, error: 'Failed to update animal details.' });
  }
});

// Admin delete service animal
app.delete('/api/admin/animals/:db_id', async (req, res) => {
  const { db_id } = req.params;
  const parsedDbId = parseInt(db_id, 10);
  try {
    // Get animal name first for logging
    const [animals] = await pool.query('SELECT name FROM animals WHERE id = ?', [parsedDbId]);
    const name = animals.length > 0 ? animals[0].name : 'Unknown';

    await pool.query('DELETE FROM animals WHERE id = ?', [parsedDbId]);

    await logActivity('animal_deletion', `Admin deleted service animal ${name} (DB ID: ${db_id})`);

    res.json({ success: true });
  } catch (err) {
    console.error('Admin delete animal error:', err);
    res.status(500).json({ success: false, error: 'Failed to delete animal.' });
  }
});

// Admin list owners
app.get('/api/admin/owners', async (req, res) => {
  try {
    const [owners] = await pool.query(`
      SELECT u.id, u.name, u.registry_id, u.email, u.phone, u.status, u.img, u.member_since, u.residential_country, u.address,
             u.id_type, u.id_last4, u.id_doc,
             COUNT(a.id) AS animal_count, 'Just now' AS lastLogin, '127.0.0.1' AS ip
      FROM users u
      LEFT JOIN animals a ON u.id = a.handler_id
      WHERE u.role = 'owner'
      GROUP BY u.id
      ORDER BY u.id DESC
    `);
    res.json({ success: true, owners });
  } catch (err) {
    console.error('Get admin owners list error:', err);
    res.status(500).json({ success: false, error: 'Failed to fetch owners.' });
  }
});

// Admin onboard owner/issue credentials
app.post('/api/admin/owners', async (req, res) => {
  const { name, email, phone, residential_country, address, password } = req.body;
  try {
    const registry_id = `REG-${Math.floor(1000 + Math.random() * 9000)}`;
    const member_since = new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    const img = 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=100';

    const [result] = await pool.query(
      `INSERT INTO users (email, password, name, phone, residential_country, address, role, registry_id, member_since, status, img)
       VALUES (?, ?, ?, ?, ?, ?, 'owner', ?, ?, 'Active', ?)`,
      [email, password, name, phone, residential_country, address, registry_id, member_since, img]
    );

    await logActivity('user_onboarding', `Onboarded new owner ${name} (Registry ID: ${registry_id})`);

    res.json({ success: true, userId: result.insertId, registryId: registry_id });
  } catch (err) {
    console.error('Admin create owner error:', err);
    res.status(500).json({ success: false, error: 'Failed to onboarding handler.' });
  }
});

// Admin edit owner details
app.put('/api/admin/owners/:id', async (req, res) => {
  const { id } = req.params;
  const parsedId = parseInt(id, 10);
  const { name, email, phone, residential_country, address, status, id_type, id_last4, id_doc } = req.body;
  try {
    // Save base64 ID document if provided
    const idDocUrl = id_doc && id_doc.startsWith('data:') ? await saveBase64File(id_doc, 'id_doc') : (id_doc || null);

    await pool.query(
      `UPDATE users SET 
        name = ?, email = ?, phone = ?, residential_country = ?, address = ?, status = ?,
        id_type = ?, id_last4 = ?, id_doc = COALESCE(?, id_doc)
      WHERE id = ? AND role = 'owner'`,
      [name, email, phone, residential_country, address, status, id_type || null, id_last4 || null, idDocUrl, parsedId]
    );

    await logActivity('user_update', `Admin updated owner ${name} (User ID: ${id})`);

    res.json({ success: true });
  } catch (err) {
    console.error('Admin edit owner error:', err);
    res.status(500).json({ success: false, error: 'Failed to update owner details.' });
  }
});

// Admin issue credentials/update password for existing owner
app.put('/api/admin/owners/:id/credentials', async (req, res) => {
  const { id } = req.params;
  const parsedId = parseInt(id, 10);
  const { password } = req.body;
  try {
    if (!password || password.length < 6) {
      return res.status(400).json({ success: false, error: 'Password must be at least 6 characters long.' });
    }

    await pool.query("UPDATE users SET password = ? WHERE id = ? AND role = 'owner'", [password, parsedId]);

    const [[owner]] = await pool.query('SELECT name FROM users WHERE id = ?', [parsedId]);
    await logActivity('user_onboarding', `Issued new credentials/password for owner ${owner ? owner.name : 'ID ' + id}`);

    res.json({ success: true });
  } catch (err) {
    console.error('Error issuing owner credentials:', err);
    res.status(500).json({ success: false, error: 'Failed to issue owner credentials.' });
  }
});

// Admin delete owner
app.delete('/api/admin/owners/:id', async (req, res) => {
  const { id } = req.params;
  const parsedId = parseInt(id, 10);
  try {
    // Get owner name first for logging
    const [users] = await pool.query("SELECT name FROM users WHERE id = ? AND role = 'owner'", [parsedId]);
    if (users.length === 0) {
      return res.status(404).json({ success: false, error: 'Owner not found.' });
    }
    const name = users[0].name;

    await pool.query("DELETE FROM users WHERE id = ? AND role = 'owner'", [parsedId]);

    await logActivity('user_deletion', `Admin deleted owner ${name} (User ID: ${id})`);

    res.json({ success: true });
  } catch (err) {
    console.error('Admin delete owner error:', err);
    res.status(500).json({ success: false, error: 'Failed to delete owner.' });
  }
});

// Admin get owner animals
app.get('/api/admin/owners/:id/animals', async (req, res) => {
  const { id } = req.params;
  try {
    const [animals] = await pool.query("SELECT * FROM animals WHERE handler_id = ? ORDER BY id DESC", [parseInt(id, 10)]);
    res.json({ success: true, animals });
  } catch (err) {
    console.error('Get owner animals error:', err);
    res.status(500).json({ success: false, error: 'Failed to fetch owner animals.' });
  }
});

// Admin get applications
app.get('/api/admin/applications', async (req, res) => {
  try {
    const [applications] = await pool.query("SELECT * FROM applications ORDER BY id DESC");
    res.json({ success: true, applications });
  } catch (err) {
    console.error('Get admin applications error:', err);
    res.status(500).json({ success: false, error: 'Failed to fetch applications.' });
  }
});

// Admin get travel requests
app.get('/api/admin/travel', async (req, res) => {
  try {
    const [requests] = await pool.query(`
      SELECT t.*, u.name AS handler, u.email AS email, a.name AS pet_name, a.breed AS pet_breed,
             TO_CHAR(t.travel_date, 'Mon DD, YYYY') AS departureDate,
             TO_CHAR(t.submitted_at, 'Mon DD, YYYY') AS date,
             t.flight_number AS flight, t.confirmation_number AS ticketNumber,
             t.route AS detail, t.status AS status, t.id AS id
      FROM travel_requests t
      JOIN users u ON t.owner_id = u.id
      JOIN animals a ON t.animal_id = a.id
      ORDER BY t.id DESC
    `);
    
    // Map database properties to what the frontend expects
    const formatted = requests.map(t => ({
      id: `AIR-${t.id}`,
      applicant: t.handler,
      email: t.email,
      detail: `${t.detail} (Flight #${t.flight})`,
      ticketNumber: t.ticketNumber,
      departureDate: t.departureDate,
      date: t.date,
      status: t.status === 'Pending' ? 'Pending' : t.status === 'Approved' ? 'Verified' : 'Rejected'
    }));
    
    res.json({ success: true, requests: formatted });
  } catch (err) {
    console.error('Get admin travel requests error:', err);
    res.status(500).json({ success: false, error: 'Failed to fetch travel requests.' });
  }
});

// Admin approve/reject travel request
app.put('/api/admin/travel/:id', async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  // Parse numeric ID out of "AIR-X"
  const cleanId = parseInt(id.replace('AIR-', ''), 10);
  try {
    const mappedStatus = status === 'Verified' ? 'Approved' : 'Rejected';
    await pool.query('UPDATE travel_requests SET status = ? WHERE id = ?', [mappedStatus, cleanId]);
    
    const [reqs] = await pool.query('SELECT owner_id FROM travel_requests WHERE id = ?', [cleanId]);
    const ownerId = reqs.length > 0 ? reqs[0].owner_id : null;
    
    await logActivity('travel_update', `Travel request AIR-${cleanId} was marked ${status}`, ownerId);
    res.json({ success: true });
  } catch (err) {
    console.error('Update travel request error:', err);
    res.status(500).json({ success: false, error: 'Failed to update travel request.' });
  }
});

// Admin approve/reject application
app.put('/api/admin/applications/:id', async (req, res) => {
  const { id } = req.params;
  const parsedId = parseInt(id, 10);
  const { status } = req.body;
  try {
    await pool.query('UPDATE applications SET status = ? WHERE id = ?', [status, parsedId]);
    
    // Retrieve application info to onboarding owner and register pet on approval
    const [apps] = await pool.query('SELECT * FROM applications WHERE id = ?', [parsedId]);
    if (apps.length > 0) {
      const appData = apps[0];
      await logActivity('application_update', `Application ID ${id} for ${appData.pet_name} was ${status}`);

      if (status === 'Approved') {
        // Check if owner user exists
        let ownerId;
        const [users] = await pool.query("SELECT id FROM users WHERE email = ? AND role = 'owner'", [appData.email]);
        
        if (users.length > 0) {
          ownerId = users[0].id;
        } else {
          // Onboard new owner
          const registry_id = `REG-${Math.floor(1000 + Math.random() * 9000)}`;
          const member_since = new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
          const [result] = await pool.query(
            `INSERT INTO users (email, password, name, phone, residential_country, address, role, registry_id, member_since, status, img, id_type, id_last4)
             VALUES (?, 'S3rv1c3!Auth2024', ?, ?, ?, ?, 'owner', ?, ?, 'Active', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=100', ?, ?)`,
            [appData.email, appData.handler_name, appData.phone, appData.country, appData.address, registry_id, member_since, appData.id_type || null, appData.id_last4 || null]
          );
          ownerId = result.insertId;
          await logActivity('user_onboarding', `Auto-onboarded owner ${appData.handler_name} via Approved application`);
        }

        // Register pet
        const animal_registry_id = `SAR-${Math.floor(1000 + Math.random() * 9000)}`;
        await pool.query(
          `INSERT INTO animals (
            registry_id, name, breed, gender, weight, microchip, date_of_birth, color,
            rabies_expiration, rabies_serial, rabies_brand, rabies_type,
            facility_name, trainer_name, trained_task, completion_date, handler_id, status, img
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Certified', ?)`,
          [
            animal_registry_id, appData.pet_name, appData.pet_breed, appData.pet_gender, appData.pet_weight, appData.pet_microchip, appData.pet_dob, appData.pet_color,
            appData.rabies_expiration, appData.rabies_serial, appData.rabies_brand, appData.rabies_type,
            appData.facility_name, appData.trainer_name, appData.trained_task, appData.completion_date, ownerId,
            appData.pet_photo || 'https://images.unsplash.com/photo-1541888946425-d81bb19480c5?auto=format&fit=crop&q=80&w=100'
          ]
        );
        await logActivity('animal_registration', `Auto-registered animal ${appData.pet_name} (Registry ID: ${animal_registry_id}) via Approved application`);
      }
    }

    res.json({ success: true });
  } catch (err) {
    console.error('Approve application error:', err);
    res.status(500).json({ success: false, error: 'Failed to update application status.' });
  }
});

// Admin Audit Logs (Recent Activities)
app.get('/api/admin/activities', async (req, res) => {
  try {
    const [activities] = await pool.query(
      `SELECT a.*, a.type AS action, a.description AS details, TO_CHAR(a.created_at, 'Mon DD, YYYY HH12:MI AM') as formatted_date
       FROM activities a 
       ORDER BY a.id DESC 
       LIMIT 50`
    );
    res.json({ success: true, activities });
  } catch (err) {
    console.error('Get admin audit logs error:', err);
    res.status(500).json({ success: false, error: 'Failed to fetch logs.' });
  }
});

// Admin get combined pending notifications
app.get('/api/admin/notifications', async (req, res) => {
  try {
    const [apps] = await pool.query("SELECT id, handler_name AS title, 'general' AS type, created_at FROM applications WHERE status = 'Pending' ORDER BY id DESC");
    const [travel] = await pool.query(`
      SELECT t.id, u.name AS title, 'airline' AS type, t.submitted_at AS created_at 
      FROM travel_requests t 
      JOIN users u ON t.owner_id = u.id 
      WHERE t.status = 'Pending' 
      ORDER BY t.id DESC
    `);
    const combined = [
      ...apps.map(a => ({ ...a, label: `New general app from ${a.title}`, rawId: a.id })),
      ...travel.map(t => ({ ...t, id: `AIR-${t.id}`, label: `New travel request from ${t.title}`, rawId: t.id }))
    ].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    res.json({ success: true, notifications: combined });
  } catch (err) {
    console.error('Get admin notifications error:', err);
    res.status(500).json({ success: false, error: 'Failed to fetch notifications.' });
  }
});

// Get single application by ID
app.get('/api/admin/applications/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const [apps] = await pool.query("SELECT * FROM applications WHERE id = ?", [parseInt(id, 10)]);
    if (apps.length === 0) {
      return res.status(404).json({ success: false, error: 'Application not found.' });
    }
    res.json({ success: true, application: apps[0] });
  } catch (err) {
    console.error('Get single application error:', err);
    res.status(500).json({ success: false, error: 'Failed to fetch application details.' });
  }
});

// Get single travel request by ID
app.get('/api/admin/travel/:id', async (req, res) => {
  const { id } = req.params;
  const cleanId = parseInt(id.replace('AIR-', ''), 10);
  try {
    const [requests] = await pool.query(`
      SELECT t.*, u.name AS handler, u.email AS email, a.name AS pet_name, a.breed AS pet_breed,
             TO_CHAR(t.travel_date, 'Mon DD, YYYY') AS departureDate,
             TO_CHAR(t.submitted_at, 'Mon DD, YYYY') AS date,
             t.flight_number AS flight, t.confirmation_number AS ticketNumber,
             t.route AS detail, t.status AS status, t.id AS id
      FROM travel_requests t
      JOIN users u ON t.owner_id = u.id
      JOIN animals a ON t.animal_id = a.id
      WHERE t.id = ?
    `, [cleanId]);
    
    if (requests.length === 0) {
      return res.status(404).json({ success: false, error: 'Travel request not found.' });
    }
    
    const t = requests[0];
    const formatted = {
      id: `AIR-${t.id}`,
      applicant: t.handler,
      email: t.email,
      detail: `${t.detail} (Flight #${t.flight})`,
      flight: t.flight,
      ticketNumber: t.ticketNumber,
      departureDate: t.departureDate,
      route: t.detail,
      date: t.date,
      status: t.status === 'Pending' ? 'Pending' : t.status === 'Approved' ? 'Verified' : 'Rejected'
    };
    
    res.json({ success: true, request: formatted });
  } catch (err) {
    console.error('Get single travel request error:', err);
    res.status(500).json({ success: false, error: 'Failed to fetch travel request details.' });
  }
});

// Update Admin Password
app.put('/api/admin/password/:userId', async (req, res) => {
  const { userId } = req.params;
  const parsedUserId = parseInt(userId, 10);
  const { currentPassword, newPassword } = req.body;
  try {
    const [users] = await pool.query('SELECT * FROM users WHERE id = ? AND role = ?', [parsedUserId, 'admin']);
    if (users.length === 0) {
      return res.status(404).json({ success: false, error: 'Admin user not found.' });
    }
    const user = users[0];
    if (user.password !== currentPassword) {
      return res.status(400).json({ success: false, error: 'Incorrect current password.' });
    }
    await pool.query('UPDATE users SET password = ? WHERE id = ?', [newPassword, userId]);
    await logActivity('password_change', `Admin updated password`, userId);
    res.json({ success: true });
  } catch (err) {
    console.error('Admin change password error:', err);
    res.status(500).json({ success: false, error: 'Failed to update admin password.' });
  }
});

// ==========================================
// 5. PRODUCTION ASSETS SERVICE
// ==========================================
// Serve the frontend app
app.use(express.static(path.join(__dirname, 'dist')));
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// Start Server
const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`Backend server is running on port ${PORT}`);
});

export default app;
