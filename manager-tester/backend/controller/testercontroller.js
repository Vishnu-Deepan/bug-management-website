const nodemailer = require('nodemailer');
const bcrypt = require('bcrypt');
const pool = require('../db');

// Function to handle tester login
const testerLogin = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Fetch tester details from the database based on email/phone
    const query = 'SELECT * FROM tester WHERE email = $1';
    const result = await pool.query(query, [email]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Tester not found' });
    }

    const tester = result.rows[0];

    // Compare hashed password with the entered password
    const isPasswordValid = await bcrypt.compare(password, tester.password);

    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid password' });
    }

    // If email/phone and password match, return success message
    res.json({ message: 'Login successful', tester });
  } catch (error) {
    console.error('Error authenticating tester:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

// Function to hash password before storing in the database
const hashPassword = async (password) => {
  const saltRounds = 10;
  return bcrypt.hash(password, saltRounds);
};



// Function to handle fetching test requests for a specific tester
const getTestRequestsForTester = async (req, res) => {
  const testerId = req.params.testerId;

  try {
    // Query to fetch test requests for the specified tester
    const query = `
      SELECT 
        testingrequest.request_id,
        testingrequest.request_name,
        testingrequest.customer_id,
        testingrequest.web_application_url,
        testingrequest.status
      FROM 
        testingrequest
      INNER JOIN 
        request_acceptance ON testingrequest.request_id = request_acceptance.request_id
      WHERE 
        request_acceptance.tester_id = $1`;
      
    const result = await pool.query(query, [testerId]);

    // Send the fetched test requests to the client
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching test requests:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};


const startTesting = async (req, res) => {
  const { requestId } = req.params;

  try {
    // Update the status to "Testing In Progress" in the database
    const updateStatusQuery = 'UPDATE testingrequest SET status = $1 WHERE request_id = $2';
    await pool.query(updateStatusQuery, ['Testing In Progress', requestId]);

    res.status(200).json({ message: 'Testing started successfully' });
  } catch (error) {
    console.error('Error starting testing:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};


const getTestRequestDetails = async (req, res) => {
  const requestId = req.params.requestId;

  try {
    // Query to fetch test request details with customer name
    const query = `
      SELECT tr.*, c.customer_name
      FROM testingrequest tr
      JOIN customer c ON tr.customer_id = c.customer_id
      WHERE tr.request_id = $1
    `;
    const result = await pool.query(query, [requestId]);

    // Check if test request exists
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Test request not found' });
    }

    // Send the fetched test request details to the client
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching test request details:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};


// Controller function to create a new bug
const createBug = async (req, res) => {
  try {
    const { summary, feature, severity, steps, tester_id, request_id, bugName, status } = req.body;

    // Check if any required field is missing
    if (!summary || !feature || !severity || !steps || !tester_id || !request_id || !bugName || !status) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    // Retrieve customer_id based on tester_id or request_id from another table
    const customerQuery = `
      SELECT customer_id FROM request_acceptance WHERE tester_id = $1 AND request_id = $2;
    `;
    const customerValues = [tester_id, request_id];
    const customerResult = await pool.query(customerQuery, customerValues);

    if (customerResult.rows.length === 0) {
      return res.status(404).json({ error: 'Customer not found for the provided tester and request' });
    }

    const customer_id = customerResult.rows[0].customer_id;

    // Insert bug data into the database
    const query = `
      INSERT INTO bug (bug_name, summary, feature_workflow, severity, steps_to_reproduce, tester_id, request_id, customer_id, status)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *;
    `;
    const values = [bugName, summary, feature, severity, steps, tester_id, request_id, customer_id, status];
    const result = await pool.query(query, values);

    res.status(201).json({ message: 'Bug created successfully', bug: result.rows[0] });
  } catch (error) {
    console.error('Error creating bug:', error);
    res.status(500).json({ error: 'Failed to create bug. Please try again later.' });
  }
};


const getBugsByRequestId = async (req, res) => {
  try {
    const { requestId } = req.body;

    // Log the entire request body
    console.log('Received request body:', req.body);

    // Query to fetch bugs by request_id
    const query = 'SELECT * FROM bug WHERE request_id = $1';
    const result = await pool.query(query, [requestId]);

    if (result.rows.length === 0) {
      console.log('No bugs found for the specified request ID');
      return res.status(404).json({ message: 'No bugs found for the specified request ID', requestId });
    }

    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching bugs:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};





// Your nodemailer transporter setup
const transporter = nodemailer.createTransport({
  // Your email service configuration (SMTP)
  service: 'YourEmailService',
  auth: {
    user: 'YourEmailAddress',
    pass: 'YourEmailPassword'
  }
});

exports.createRequest = async (req, res) => {
  const { customer_id, request_name, web_application_url, username, password } = req.body;
  const existingRequestsQuery = 'SELECT status FROM testingrequest WHERE customer_id = $1';
  const existingRequestsValues = [customer_id];

  try {
    const existingRequests = await db.query(existingRequestsQuery, existingRequestsValues);
    
    if (existingRequests.rows.length > 0) {
      const hasPendingRequests = existingRequests.rows.some(request => request.status !== 'Testing Completed');
      const status = hasPendingRequests ? 'Pending' : 'Under Review';
      const accepted = false;
      
      if (hasPendingRequests) {
        return res.status(400).json({ error: `You already have a Test Request ${existingRequests.rows[0].status}`});
      }
      
      const insertQuery = 'INSERT INTO testingrequest (customer_id, request_name, web_application_url, email, password, status, accepted) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *';
      const insertValues = [customer_id, request_name, web_application_url, username, password, status, accepted];
      const { rows } = await db.query(insertQuery, insertValues);
      
      // Send email
      const mailOptions = {
        from: 'your_email@example.com',
        to: '21uit002@kamaragengg.in',
        subject: 'New Test Request Created',
        text: 'A new test request has been created successfully.'
      };

      transporter.sendMail(mailOptions, function(error, info){
        if (error) {
          console.error('Error sending email:', error);
        } else {
          console.log('Email sent: ' + info.response);
        }
      });

      return res.status(201).json({ request: rows[0] });
    } else {
      const status = 'Under Review';
      const accepted = false;
      
      const insertQuery = 'INSERT INTO testingrequest (customer_id, request_name, web_application_url, email, password, status, accepted) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *';
      const insertValues = [customer_id, request_name, web_application_url, username, password, status, accepted];
      const { rows } = await db.query(insertQuery, insertValues);
      
      // Send email
      const mailOptions = {
        from: 'your_email@example.com',
        to: '21uit002@kamaragengg.in',
        subject: 'New Test Request Created',
        text: 'A new test request has been created successfully.'
      };

      transporter.sendMail(mailOptions, function(error, info){
        if (error) {
          console.error('Error sending email:', error);
        } else {
          console.log('Email sent: ' + info.response);
        }
      });

      return res.status(201).json({ request: rows[0] });
    }
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};




module.exports = {
  testerLogin,
  hashPassword,
  getTestRequestsForTester,
  startTesting,
  getTestRequestDetails,
  createBug,
  getBugsByRequestId,
  updateBugStatus
};
