const mysql = require('mysql2/promise');
const { MongoClient } = require('mongodb');
require('dotenv').config();

// MySQL Connection Pool
const mysqlPool = mysql.createPool({
  host: process.env.MYSQL_HOST || 'localhost',
  port: process.env.MYSQL_PORT || 3306,
  user: process.env.MYSQL_USER || 'root',
  password: process.env.MYSQL_PASSWORD || '',
  database: process.env.MYSQL_DATABASE || 'sonken',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0
});

// MongoDB Connection
let mongoClient = null;
let mongoDb = null;

async function connectMongoDB() {
  try {
    const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/sonken';
    mongoClient = new MongoClient(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    
    await mongoClient.connect();
    mongoDb = mongoClient.db();
    console.log('✓ MongoDB connected successfully');
    return mongoDb;
  } catch (error) {
    console.error('✗ MongoDB connection error:', error.message);
    return null;
  }
}

// Test MySQL Connection
async function testMySQLConnection() {
  try {
    const connection = await mysqlPool.getConnection();
    await connection.ping();
    connection.release();
    console.log('✓ MySQL connected successfully');
    return true;
  } catch (error) {
    console.error('✗ MySQL connection error:', error.message);
    return false;
  }
}

// Get MySQL Pool
function getMySQLPool() {
  return mysqlPool;
}

// Get MongoDB Database
function getMongoDB() {
  return mongoDb;
}

// Close all connections
async function closeConnections() {
  try {
    await mysqlPool.end();
    if (mongoClient) {
      await mongoClient.close();
    }
    console.log('All database connections closed');
  } catch (error) {
    console.error('Error closing connections:', error);
  }
}

module.exports = {
  mysqlPool,
  getMySQLPool,
  connectMongoDB,
  getMongoDB,
  testMySQLConnection,
  closeConnections
};
