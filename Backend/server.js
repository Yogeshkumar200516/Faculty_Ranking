const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');

const { sendEmail } = require('./emailService.jsx');
const app = express();
app.use(bodyParser.json());

const SECRET_KEY = '3f102fd66ccbca0aadeed03cd0d31278c85503b5a4a708818a6db3420d8ba5973';

const db = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: 'Yogesh@200516',
    database: 'faculty_project'
});

const corsOptions = {
    origin: 'http://localhost:5173',
    methods: 'GET,POST,PUT,DELETE',
    allowedHeaders: 'Content-Type,Authorization',
    credentials: true,
};

app.use(cors(corsOptions));

function authenticateToken(req, res, next) {
    const token = req.headers['authorization']?.split(' ')[1]; 

    if (!token) return res.sendStatus(401); 

    jwt.verify(token, SECRET_KEY, (err, user) => {
        if (err) return res.sendStatus(403); 
        req.user = user;
        next();
    });
}

app.post('/login', async (req, res) => {
    const { email } = req.body;

    try {
        const [result] = await db.query(`
            SELECT id, role, vertical_coe, vertical_academics, vertical_iqac, vertical_skillteam, vertical_speciallab, department
            FROM faculty_frs
            WHERE email = ?
        `, [email]);

        if (result.length > 0) {
            const { id, role, department, ...verticals } = result[0];
            const token = jwt.sign({ id, role }, SECRET_KEY, { expiresIn: '1h' });
            return res.json({ token, user: { id, role, department, verticals } });
        } else {
            return res.status(404).send('User not found');
        }
    } catch (err) {
        console.error('Database query error:', err);
        return res.status(500).send('Server error');
    }
});

app.post('/api/verify-token', (req, res) => {
    const { token } = req.body;

    if (!token) {
        return res.status(400).json({ isValid: false, message: 'Token is required' });
    }

    jwt.verify(token, SECRET_KEY, (err, user) => {
        if (err) {
            return res.status(403).json({ isValid: false, message: 'Invalid token' });
        }

        res.json({ isValid: true, user });
    });
});

app.get('/secure-endpoint', authenticateToken, (req, res) => {
    res.json({ message: 'Secure data', user: req.user });
});

app.post('/verticalhead', authenticateToken, async (req, res) => {
    const { id, email, frs_update, reason, reason_info, verticalHeadId, vertical } = req.body;

    try {
        const [results] = await db.query('SELECT department FROM faculty_frs WHERE id = ?', [id]);

        if (results.length === 0) {
            return res.status(404).json({ error: 'Faculty not found' });
        }

        const department = results[0].department;

        const [insertResults] = await db.query(`
            INSERT INTO frs_history (faculty_id, email, verticalhead_id, vertical, frs_updated, reason, reason_info, department)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `, [id, email, verticalHeadId, vertical, frs_update, reason, reason_info, department]);

        res.status(200).json({ message: 'Form submitted successfully', data: insertResults });
    } catch (err) {
        console.error('Error processing request:', err);
        res.status(500).json({ error: 'Failed to submit form data' });
    }
});

app.get('/verticalvisefrs/:id', authenticateToken, async (req, res) => {
  const userId = req.params.id;

  // Get the current date to determine the default semester and academic year
  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const year = now.getFullYear();
  
  // Determine the current academic year
  const academicYear = (currentMonth >= 7) ? `${year}-${year + 1}` : `${year - 1}-${year}`;
  // Determine the current semester
  const semester = (currentMonth >= 7 && currentMonth <= 12) ? 'odd' : 'even';

  const query = `
      SELECT 
          vertical, 
          COALESCE(SUM(CAST(frs_updated AS DECIMAL(10,2))), 0) AS total_frs_points
      FROM 
          frs_history
      WHERE 
          faculty_id = ? AND
          academic_year = ? AND
          semester = ?
      GROUP BY 
          vertical;
  `;

  try {
      const [results] = await db.query(query, [userId, academicYear, semester]);
      res.json(results);
  } catch (error) {
      console.error('Error executing query:', error);
      res.status(500).json({ error: 'Internal Server Error' });
  }
});


app.get('/frssummary/:id', authenticateToken, async (req, res) => {
  const userId = req.params.id;
  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const year = now.getFullYear();
  const academicYear = (currentMonth >= 7) ? `${year}-${year + 1}` : `${year - 1}-${year}`;
  const semester = (currentMonth >= 7 && currentMonth <= 12) ? 'odd' : 'even';
  const query = `
      SELECT 
          COALESCE(SUM(CAST(frs_updated AS DECIMAL(10,2))), 0) AS total,
          COALESCE(SUM(CASE WHEN frs_updated > 0 THEN CAST(frs_updated AS DECIMAL(10,2)) ELSE 0 END), 0) AS gained,
          COALESCE(SUM(CASE WHEN frs_updated < 0 THEN CAST(frs_updated AS DECIMAL(10,2)) ELSE 0 END), 0) AS lost
      FROM 
          frs_history
      WHERE 
          faculty_id = ? AND
          academic_year = ? AND
          semester = ?
  `;

  try {
      const [results] = await db.query(query, [userId, academicYear, semester]);

      if (!results || results.length === 0) {
          return res.status(404).json({ error: 'User not found' });
      }

      res.json(results[0]);
  } catch (error) {
      console.error('Error executing query:', error);
      res.status(500).json({ error: 'Internal Server Error' });
  }
});


app.get('/recentfrs/:faculty_id', authenticateToken, async (req, res) => {
    const facultyId = req.params.faculty_id;
    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const year = now.getFullYear();
    const academicYear = (currentMonth >= 7) ? `${year}-${year + 1}` : `${year - 1}-${year}`;
    const semester = (currentMonth >= 7 && currentMonth <= 12) ? 'odd' : 'even';
    const query = `
        SELECT 
            DATE_FORMAT(created_at, '%d-%m-%Y') AS date,
            vertical AS verticalName,
            reason,
            reason_info,
            frs_updated AS frsUpdate
        FROM frs_history
        WHERE faculty_id = ? AND 
          academic_year = ? AND
          semester = ?
        ORDER BY created_at DESC
        LIMIT 5;
    `;

    try {
        const [results] = await db.query(query, [facultyId,academicYear,semester]);
        res.status(200).json(results);
    } catch (err) {
        console.error('Error fetching recent FRS data:', err);
        res.status(500).json({ error: 'Failed to fetch recent FRS data' });
    }
});

app.get('/facultyfrsgraph/:faculty_id/:vertical', authenticateToken, async (req, res) => {
    const { faculty_id, vertical } = req.params;

    if (!faculty_id) {
        return res.status(400).json({ error: 'Faculty ID is required' });
        
    }

    const query = `
        SELECT
            DATE_FORMAT(created_at, '%Y-%m') AS month,
            SUM(CAST(frs_updated AS DECIMAL(30,2))) AS totalFRS
        FROM
            frs_history
        WHERE
            faculty_id = ?
            
            AND (vertical = ? OR ? = 'All')
        GROUP BY
            month
        ORDER BY
            month;
    `;

    try {
        const [results] = await db.query(query, [faculty_id, vertical, vertical]);
        res.json(results);
    } catch (err) {
        console.error('Error executing query:', err);
        res.status(500).json({ error: 'Database query failed' });
    }
});

app.get('/frshistory/:faculty_id', authenticateToken, async (req, res) => {
    const facultyId = req.params.faculty_id;

    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const year = now.getFullYear();
    const academicYear = (currentMonth >= 7) ? `${year}-${year + 1}` : `${year - 1}-${year}`;
    const semester = (currentMonth >= 7 && currentMonth <= 12) ? 'odd' : 'even';
    const query = `
        SELECT 
            DATE_FORMAT(created_at, '%d-%m-%Y') AS date,
            vertical AS verticalName,
            reason,
            reason_info,
            frs_updated AS frsUpdate
        FROM frs_history
        WHERE faculty_id = ?
         AND 
          academic_year = ? AND
          semester = ?
        ORDER BY created_at DESC;
    `;

    try {
        const [results] = await db.query(query, [facultyId,academicYear,semester]);
        res.status(200).json(results);
    } catch (err) {
        console.error('Error fetching data:', err);
        res.status(500).json({ error: 'Error fetching data' });
    }
});

app.get('/verticals/frs', authenticateToken, async (req, res) => {
  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const year = now.getFullYear();
  const academicYear = (currentMonth >= 7) ? `${year}-${year + 1}` : `${year - 1}-${year}`;
  const semester = (currentMonth >= 7 && currentMonth <= 12) ? 'odd' : 'even';

  const query = `
      SELECT 
          vertical,
          SUM(CASE WHEN frs_updated > 0 THEN frs_updated ELSE 0 END) AS positiveScore,
          SUM(CASE WHEN frs_updated < 0 THEN frs_updated ELSE 0 END) AS negativeScore
      FROM frs_history
      WHERE 
          academic_year = ? AND
          semester = ?
      GROUP BY vertical;
  `;

  try {
      const [results] = await db.query(query, [academicYear, semester]);
      res.json(results);
  } catch (err) {
      console.error('Error executing query:', err);
      res.status(500).send('Internal server error');
  }
});


app.get('/admin/frs/monthly', authenticateToken, async (req, res) => {
  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const year = now.getFullYear();
  const academicYear = (currentMonth >= 7) ? `${year}-${year + 1}` : `${year - 1}-${year}`;
  const semester = (currentMonth >= 7 && currentMonth <= 12) ? 'odd' : 'even';

  try {
    const [rows] = await db.query(
      `
      SELECT 
        DATE_FORMAT(created_at, '%Y-%m') AS month,
        SUM(CASE WHEN frs_updated > 0 THEN CAST(frs_updated AS DECIMAL) ELSE 0 END) AS total_gained,
        SUM(CASE WHEN frs_updated < 0 THEN CAST(frs_updated AS DECIMAL) ELSE 0 END) AS total_lost
      FROM 
        frs_history
      WHERE
        academic_year = ? AND
        semester = ?
      GROUP BY 
        month
      ORDER BY 
        month;
    `,
      [academicYear, semester]
    );

    res.json({ frsSummary: rows });
  } catch (error) {
    console.error('Error fetching data:', error);
    res.status(500).send('Internal Server Error');
  }
});




app.get('/admin/frs/verticals', authenticateToken, async (req, res) => {
  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const year = now.getFullYear();
  const academicYear = (currentMonth >= 7) ? `${year}-${year + 1}` : `${year - 1}-${year}`;
  const semester = (currentMonth >= 7 && currentMonth <= 12) ? 'odd' : 'even';

  try {
    const query = `
      SELECT 
        vertical, 
        SUM(CASE WHEN frs_updated > 0 THEN CAST(frs_updated AS DECIMAL(8, 2)) ELSE 0 END) AS total_provided
      FROM 
        frs_history
      WHERE 
        academic_year = ? AND
        semester = ?
      GROUP BY 
        vertical;
    `;
    const [rows] = await db.query(query, [academicYear, semester]);
    res.json(rows);
  } catch (error) {
    console.error('Error fetching data:', error);
    res.status(500).send('Internal Server Error');
  }
});
app.get('/api/negativedata', async (req, res) => {
  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const year = now.getFullYear();
  const academicYear = (currentMonth >= 7) ? `${year}-${year + 1}` : `${year - 1}-${year}`;
  const semester = (currentMonth >= 7 && currentMonth <= 12) ? 'odd' : 'even';
  const query = `
    SELECT 
      ff.id AS id,  -- Rename this to 'id'
      ff.name AS facultyName,
      ff.department,
      ff.designation,
      COALESCE(SUM(CASE WHEN fh.frs_updated < 0 THEN 1 ELSE 0 END), 0) AS totalNegativeUpdates
    FROM 
      faculty_frs ff
    LEFT JOIN 
      frs_history fh ON ff.id = fh.faculty_id
    WHERE
      ff.role = 'user' AND academic_year = ? AND
        semester = ?
    GROUP BY 
      ff.id, ff.name, ff.department, ff.designation;
  `;

  try {
    const [rows] = await db.query(query,[academicYear, semester]);
    res.json(rows);
  } catch (error) {
    console.error('Error executing query:', error);
    res.status(500).json({ error: error.message });
  }
});


  app.get('/api/verticalhead/frs-summary/:id', authenticateToken, async (req, res) => {
    const verticalHeadId = req.params.id;

    try {
        // Fetch the vertical head's verticals
        const [verticalHeadRows] = await db.query(`
            SELECT vertical_coe, vertical_academics, vertical_iqac, vertical_skillteam, vertical_speciallab 
            FROM faculty_frs 
            WHERE id = ? AND role = 'vertical_head'
        `, [verticalHeadId]);

        if (verticalHeadRows.length === 0) {
            return res.status(404).json({ message: 'Vertical head not found' });
        }

        const verticals = verticalHeadRows[0];
        const vertical = Object.keys(verticals).find(key => verticals[key] === 1);

        if (!vertical) {
            return res.status(404).json({ message: 'No vertical assigned to this vertical head' });
        }

        // Map the column name to the actual vertical name in uppercase
        const verticalMap = {
            vertical_coe: 'COE',
            vertical_academics: 'Academics',
            vertical_iqac: 'IQAC',
            vertical_skillteam: 'Skill Team',
            vertical_speciallab: 'Special Lab'
        };

        const verticalName = verticalMap[vertical];
        const now = new Date();
        const currentMonth = now.getMonth() + 1;
        const year = now.getFullYear();
        const academicYear = (currentMonth >= 7) ? `${year}-${year + 1}` : `${year - 1}-${year}`;
        const semester = (currentMonth >= 7 && currentMonth <= 12) ? 'odd' : 'even';

        // Fetch the FRS summary
        const [summaryRows] = await db.query(`
            SELECT 
                COALESCE(SUM(CASE WHEN frs_updated > 0 THEN frs_updated ELSE 0 END), 0) AS frsProvided,
                COALESCE(SUM(CASE WHEN frs_updated < 0 THEN frs_updated ELSE 0 END), 0) AS frsTaken
            FROM frs_history
            WHERE vertical = ?
            AND academic_year = ?
            AND semester = ?
        `, [verticalName, academicYear, semester]);

        const { frsProvided, frsTaken } = summaryRows[0];

        res.json({ vertical: verticalName, frsProvided, frsTaken });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Internal server error' });
    }
});

app.get('/api/verticalhead/record-summary/:id', authenticateToken, async (req, res) => {
  const verticalHeadId = req.params.id;

  try {
      // Fetch the vertical(s) for the vertical head
      const [verticalRows] = await db.query(`
          SELECT vertical_coe, vertical_academics, vertical_iqac, vertical_skillteam, vertical_speciallab 
          FROM faculty_frs 
          WHERE id = ? AND role = 'vertical_head'
      `, [verticalHeadId]);

      if (verticalRows.length === 0) {
          return res.status(404).json({ message: 'Vertical head not found' });
      }

      const verticals = verticalRows[0];
      const assignedVerticals = Object.keys(verticals).filter(key => verticals[key] === 1);

      if (assignedVerticals.length === 0) {
          return res.status(404).json({ message: 'No verticals assigned to this vertical head' });
      }

      // Convert vertical names to be used in the query
      const verticalNames = {
          vertical_coe: 'COE',
          vertical_academics: 'Academics',
          vertical_iqac: 'IQAC',
          vertical_skillteam: 'Skill Team',
          vertical_speciallab: 'Special Lab'
      };

      const verticalNameList = assignedVerticals.map(v => verticalNames[v]);

      // Determine the current academic year and semester
      const now = new Date();
      const currentMonth = now.getMonth() + 1;
      const year = now.getFullYear();
      const academicYear = (currentMonth >= 7) ? `${year}-${year + 1}` : `${year - 1}-${year}`;
      const semester = (currentMonth >= 7 && currentMonth <= 12) ? 'odd' : 'even';

      // Query the FRS history based on the vertical(s)
      const [updateRows] = await db.query(`
          SELECT 
              COUNT(*) AS totalUpdates,
              SUM(CASE WHEN frs_updated > 0 THEN 1 ELSE 0 END) AS positiveUpdates,
              SUM(CASE WHEN frs_updated < 0 THEN 1 ELSE 0 END) AS negativeUpdates
          FROM frs_history
          WHERE vertical IN (?) 
          AND academic_year = ?
          AND semester = ?
      `, [verticalNameList, academicYear, semester]);

      const { totalUpdates, positiveUpdates, negativeUpdates } = updateRows[0];

      res.json({ totalUpdates, positiveUpdates, negativeUpdates });
  } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Internal server error' });
  }
});

app.get('/api/verticalhead/:id/frs-summary', authenticateToken, async (req, res) => {
    const verticalHeadId = req.params.id;

    try {
        // Query to get vertical details for the specified vertical head
        const [verticalRows] = await db.query(`
            SELECT vertical_coe, vertical_academics, vertical_iqac, vertical_skillteam, vertical_speciallab
            FROM faculty_frs
            WHERE id = ? AND role = 'vertical_head'
        `, [verticalHeadId]);

        if (verticalRows.length === 0) {
            return res.status(404).json({ message: 'Vertical head not found or no vertical assigned' });
        }

        // Extract verticals from the result
        const verticals = verticalRows[0];
        const assignedVertical = Object.keys(verticals).find(key => verticals[key] === 1);

        if (!assignedVertical) {
            return res.status(404).json({ message: 'No vertical assigned to this vertical head' });
        }

        // Map column name to vertical name
        const verticalMap = {
            vertical_coe: 'COE',
            vertical_academics: 'Academics',
            vertical_iqac: 'IQAC',
            vertical_skillteam: 'Skill Team',
            vertical_speciallab: 'Special Lab'
        };

        const verticalName = verticalMap[assignedVertical];

        // Query to get FRS data for each semester
        const [rows] = await db.query(`
            SELECT 
                DATE_FORMAT(created_at, '%Y-%m') AS month,
                SUM(CASE WHEN frs_updated > 0 THEN CAST(frs_updated AS DECIMAL) ELSE 0 END) AS total_gained,
                SUM(CASE WHEN frs_updated < 0 THEN CAST(frs_updated AS DECIMAL) ELSE 0 END) AS total_lost
            FROM frs_history where vertical = ? 
            GROUP BY month
            ORDER BY month;
          `,[verticalName]);
        

        // Combine vertical name and FRS summary
        res.json({ vertical: verticalName, frsSummary: rows });
    } catch (error) {
        console.error('Error fetching data:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});
app.get('/api/verticalhead/:id/VerticalFrs', authenticateToken, async (req, res) => {
    const verticalHeadId = req.params.id;
  
    try {
      const [verticalRows] = await db.query(`
        SELECT vertical_coe, vertical_academics, vertical_iqac, vertical_skillteam, vertical_speciallab
        FROM faculty_frs
        WHERE id = ? AND role = 'vertical_head'
      `, [verticalHeadId]);
  
      if (verticalRows.length === 0) {
        return res.status(404).json({ message: 'Vertical head not found or no vertical assigned' });
      }
  
      const verticals = verticalRows[0];
      const assignedVertical = Object.keys(verticals).find(key => verticals[key] === 1);
  
      if (!assignedVertical) {
        return res.status(404).json({ message: 'No vertical assigned to this vertical head' });
      }
  
      const verticalMap = {
        vertical_coe: 'COE',
        vertical_academics: 'Academics',
        vertical_iqac: 'IQAC',
        vertical_skillteam: 'Skill Team',
        vertical_speciallab: 'Special Lab'
      };
  
      const verticalName = verticalMap[assignedVertical];

      const now = new Date();
      const currentMonth = now.getMonth() + 1;
      const year = now.getFullYear();
      const academicYear = (currentMonth >= 7) ? `${year}-${year + 1}` : `${year - 1}-${year}`;
      const semester = (currentMonth >= 7 && currentMonth <= 12) ? 'odd' : 'even';

  
      const [frshistory] = await db.query(`
        SELECT 
          fh.faculty_id AS facultyId,
          fh.frs_updated AS frsScore,
          fh.reason,
          fh.semester,
          fh.academic_year,
          fh.created_at,
          ff.name AS facultyName
        FROM 
          frs_history fh
        INNER JOIN 
          faculty_frs ff 
        ON 
          fh.faculty_id = ff.id
        WHERE 
          fh.vertical = ?
            AND academic_year = ?
            AND semester = ?
      `, [verticalName, academicYear, semester]);
  
      res.json({ vertical: verticalName, frsSummary: frshistory });
    } catch (error) {
      console.error('Error fetching data:', error);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  });
// Fetch all users from the faculty_frs table
app.get('/api/faculty_frs', async (req, res) => {
    try {
      const [rows] = await db.query('SELECT id, name, department FROM faculty_frs where role="user"');
      res.json({ users: rows });
    } catch (error) {
      console.error('Error fetching users:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });
  // Update FRS values for multiple users
  app.get('/api/department', async (req, res) => {
    try {
      const [rows] = await db.query('SELECT DISTINCT department FROM faculty_frs');
      const departments = rows.map(row => row.department); // Ensure to map rows to department names
      res.json({ departments });
    } catch (error) {
      console.error('Error fetching departments:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });
  app.get('/api/faculty/list',async(req,res)=>{
    try{
        const [rows] = await db.query('SELECT id, name, department FROM faculty_frs WHERE role="user"');
        res.json({ users: rows });
    }
    catch(error){
        console.error('Error fetching users:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
  });
  app.get('/api/faculty/list',async(req,res)=>{
    try{
        const [rows] = await db.query('SELECT id, name, department FROM faculty_frs WHERE role="user"');
        res.json({ users: rows });
    }
    catch(error){
        console.error('Error fetching users:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
  });
  app.post('/api/frs/add', async (req, res) => {
    const { facultyData } = req.body;
  
    if (!facultyData || !Array.isArray(facultyData) || facultyData.length === 0) {
      return res.status(400).json({ message: 'No valid faculty data provided' });
    }
  
    try {
      for (const faculty of facultyData) {
        const { facultyID, facultyName, frs, reasonTitle, reason, verticalheadsid, vertical } = faculty;
  
        // Fetch the faculty's email and department
        const [result] = await db.query('SELECT email, department FROM faculty_frs WHERE id = ?', [facultyID]);
  
        if (result.length === 0) {
          console.error(`Faculty not found for ID: ${facultyID}`);
          continue;
        }
  
        const { email, department } = result[0];
  
        // Determine academic year and semester
        const now = new Date();
        const year = now.getFullYear();
        const month = now.getMonth() + 1;
  
        let academic_year;
        let semester;
  
        if (month >= 7 && month <= 12) {
          academic_year = `${year}-${year + 1}`;
          semester = 'odd';
        } else {
          academic_year = `${year - 1}-${year}`;
          semester = 'even';
        }
  
        // Insert the FRS record into history
        await db.query(`
          INSERT INTO frs_history (faculty_id, email, frs_updated, reason_info, verticalhead_id, vertical, reason, created_at, department, academic_year, semester)
          VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), ?, ?, ?)
        `, [facultyID, email, frs, reasonTitle, verticalheadsid, vertical, reason, department, academic_year, semester]);
  
        await sendEmail(
          email,
          'FRS Updated',
          `Dear ${facultyName},\n\nYour FRS record has been updated.\n\nUpdated By: ${frs}\nReason: ${reason}\n\nThank you,\nThe Team` 
        );
  
        console.log(`FRS record inserted and email sent for Faculty ID: ${facultyID}`);
      }
  
      res.status(201).json({ message: 'FRS added successfully for all selected faculties' });
    } catch (error) {
      console.error('Error processing bulk submission:', error);
      res.status(500).json({ message: 'Error processing bulk submission', error: error.message });
    }
  });
  app.get('/api/facultytotalupdates', authenticateToken, async (req, res) => {
    const { academicYear, semester } = req.query;

    // Function to generate the past three academic years
    const generatePastAcademicYears = () => {
        const currentYear = new Date().getFullYear();
        const years = [];
        for (let i = 0; i < 3; i++) {
            const startYear = currentYear - i;
            const endYear = startYear + 1;
            years.push(`${startYear}-${endYear}`);
        }
        return years;
    };

    const pastAcademicYears = generatePastAcademicYears();

    const academicYearFilter = academicYear && pastAcademicYears.includes(academicYear) ? [academicYear] : pastAcademicYears;

    // Build the base query
    let query = `
      SELECT
        ff.id AS facultyId,
        ff.name AS facultyName,
        ff.department,
        ff.designation,
        SUM(fh.frs_updated) AS frsScore,
        SUM(CASE WHEN fh.frs_updated > 0 THEN 1 ELSE 0 END) AS positiveCount,
        SUM(CASE WHEN fh.frs_updated < 0 THEN 1 ELSE 0 END) AS negativeCount,
        fh.academic_year AS academicYear,
        fh.semester AS semester
      FROM faculty_frs ff
      JOIN frs_history fh ON ff.id = fh.faculty_id
      WHERE ff.role = 'user'
      AND fh.academic_year IN (${academicYearFilter.map(() => '?').join(',')})
      ${semester ? 'AND fh.semester = ?' : ''}
      GROUP BY ff.id, fh.academic_year, fh.semester
      ORDER BY frsScore DESC
    `;

    try {
        // Construct the parameters array
        const params = [...academicYearFilter];
        if (semester) {
            params.push(semester);
        }

        console.log('Generated Query:', query);
        console.log('Parameters:', params);

        // Ensure this line is inside an async function
        const [results] = await db.query(query, params);
        res.json(results);
    } catch (err) {
        console.error('Error fetching faculty data:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});



app.get('/api/faculty', authenticateToken, async (req, res) => {
    const { academicYear, semester } = req.query;
  
    // Function to generate the past three academic years
    const generatePastAcademicYears = () => {
      const currentYear = new Date().getFullYear();
      const years = [];
      for (let i = 0; i < 3; i++) {
        const startYear = currentYear - i;
        const endYear = startYear + 1;
        years.push(`${startYear}-${endYear}`);
      }
      return years;
    };
  
    const pastAcademicYears = generatePastAcademicYears();
  
    // Handle academicYear filter to include past three academic years
    const academicYearFilter = academicYear && pastAcademicYears.includes(academicYear) ? [academicYear] : pastAcademicYears;
  
    // Build the base query
    let query = `
      SELECT
        @row_number := @row_number + 1 AS sNo,
        ff.id AS facultyId,
        ff.name AS facultyName,
        ff.department,
        ff.designation,
        SUM(fh.frs_updated) AS frsScore,
        fh.academic_year AS academicYear,
        ${semester ? 'fh.semester AS semester' : 'NULL AS semester'}
      FROM faculty_frs ff
      JOIN frs_history fh ON ff.id = fh.faculty_id
      JOIN (SELECT @row_number := 0) AS rn
      WHERE ff.role = 'user'
      AND fh.academic_year IN (${academicYearFilter.map(() => '?').join(',')})
    `;
  

    if (semester) {
      query += `
        AND fh.semester = ?
      `;
    }
    if (semester) {
      query += `
        GROUP BY ff.id, fh.academic_year, fh.semester
      `;
    } else {
      query += `
        GROUP BY ff.id, fh.academic_year
      `;
    }
    query += `
      ORDER BY frsScore DESC
    `;
  
    try {
    
      let params = [...academicYearFilter];
      if (semester) {
        params.push(semester);
      }
  
      console.log('Generated Query:', query);
      console.log('Parameters:', params);
  
    
      const [results] = await db.query(query, params);
      res.json(results);
    } catch (err) {
      console.error('Error fetching faculty data:', err);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });

  app.get('/api/popup/:facultyId', async (req, res) => {
    const { facultyId } = req.params;
    const { academicYear, semester } = req.query; // Use req.query for query parameters
  
    console.log("Faculty ID:", facultyId);
    console.log("Academic Year:", academicYear);
    console.log("Semester:", semester);
    
  
    try {
      // Parse academic year
    
  
  
      // Build SQL query with dynamic conditions
      let query = `
        SELECT
          id AS serialNo,
          DATE_FORMAT(created_at, '%d-%m-%Y') AS date,
          academic_year AS academicYear,
          semester AS semester,
          vertical,
          reason,
          frs_updated AS updatedFRS
        FROM
          frs_history 
        WHERE
          faculty_id = ? AND academic_year = ? AND semester = ? 
      `;
  
      const queryParams = [facultyId,academicYear,semester];
        query += ` ORDER BY created_at DESC`;
  
      const [rows] = await db.query(query, queryParams);
  
      // Send response with FRS data
      res.json(rows);
    } catch (error) {
      console.error('Error fetching FRS data:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });
  

const PORT = 4000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
