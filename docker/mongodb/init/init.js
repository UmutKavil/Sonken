// Sonken MongoDB Initialization Script

// Switch to sonken database
db = db.getSiblingDB('sonken');

// Create users collection with validation
db.createCollection('users', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['username', 'email', 'passwordHash'],
      properties: {
        username: {
          bsonType: 'string',
          description: 'Username must be a string and is required'
        },
        email: {
          bsonType: 'string',
          pattern: '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$',
          description: 'Email must be a valid email address'
        },
        passwordHash: {
          bsonType: 'string',
          description: 'Password hash is required'
        },
        isAdmin: {
          bsonType: 'bool',
          description: 'Admin status'
        },
        createdAt: {
          bsonType: 'date',
          description: 'Creation timestamp'
        },
        updatedAt: {
          bsonType: 'date',
          description: 'Last update timestamp'
        }
      }
    }
  }
});

// Create indexes for users
db.users.createIndex({ username: 1 }, { unique: true });
db.users.createIndex({ email: 1 }, { unique: true });

// Create projects collection
db.createCollection('projects', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['name', 'path'],
      properties: {
        name: {
          bsonType: 'string',
          description: 'Project name is required'
        },
        description: {
          bsonType: 'string',
          description: 'Project description'
        },
        path: {
          bsonType: 'string',
          description: 'Project path is required'
        },
        userId: {
          bsonType: 'objectId',
          description: 'Reference to user'
        },
        status: {
          enum: ['active', 'inactive', 'archived'],
          description: 'Project status'
        },
        metadata: {
          bsonType: 'object',
          description: 'Additional project metadata'
        },
        createdAt: {
          bsonType: 'date',
          description: 'Creation timestamp'
        },
        updatedAt: {
          bsonType: 'date',
          description: 'Last update timestamp'
        }
      }
    }
  }
});

// Create indexes for projects
db.projects.createIndex({ name: 1 });
db.projects.createIndex({ userId: 1 });
db.projects.createIndex({ status: 1 });

// Create server logs collection
db.createCollection('serverLogs');
db.serverLogs.createIndex({ level: 1 });
db.serverLogs.createIndex({ timestamp: -1 });

// Create settings collection
db.createCollection('settings');
db.settings.createIndex({ key: 1 }, { unique: true });

// Insert default admin user
db.users.insertOne({
  username: 'admin',
  email: 'admin@sonken.local',
  passwordHash: '$2b$10$rqzH8ZqQGHKqTlqPJcwvDOKKPRKJYXwOIGZXHhH5YKqKPRKJYXwOI',
  isAdmin: true,
  createdAt: new Date(),
  updatedAt: new Date(),
  lastLogin: null
});

// Insert default settings
db.settings.insertMany([
  {
    key: 'app_name',
    value: 'Sonken',
    description: 'Application name',
    updatedAt: new Date()
  },
  {
    key: 'app_version',
    value: '1.0.0',
    description: 'Application version',
    updatedAt: new Date()
  },
  {
    key: 'maintenance_mode',
    value: false,
    description: 'Enable maintenance mode',
    updatedAt: new Date()
  }
]);

// Insert initial log entry
db.serverLogs.insertOne({
  level: 'info',
  message: 'MongoDB database initialized successfully',
  timestamp: new Date(),
  details: {
    database: 'sonken',
    collections: ['users', 'projects', 'serverLogs', 'settings']
  }
});

print('Sonken MongoDB database initialized successfully!');
print('Collections created: ' + db.getCollectionNames().join(', '));
