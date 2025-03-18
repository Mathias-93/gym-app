import pkg from "pg";
const { Pool } = pkg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL, // Use DATABASE_URL directly
  ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false, // Allow SSL for production
});

export default pool;



/* import pkg from "pg";
const { Pool } = pkg;

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  password: process.env.DB_PW,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT || 5432,
});

export default pool; */
