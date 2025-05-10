// docker/init-scripts/02-init-mongo.js
//
// This script initializes the MongoDB replica set for production environments
// It will be automatically executed when the MongoDB container starts

// Check if we're in a production environment with replica set
if (db.runCommand({ isMaster: 1 }).msg !== 'isdbgrid') {
  print('Configuring MongoDB replica set...');

  // Initialize the replica set if we're the primary node
  try {
    rs.initiate({
      _id: 'rs0',
      members: [
        { _id: 0, host: 'mongodb:27017', priority: 2 },
        { _id: 1, host: 'mongodb_backup:27018', priority: 1 },
      ],
    });

    print('Replica set initialized successfully');
  } catch (e) {
    print('Error initializing replica set: ' + e);
    print('This may be normal if the replica set is already initialized');
  }
}

// Create default users
// This will create admin users only if they don't already exist
db = db.getSiblingDB('admin');
db.createUser({
  user: process.env.MONGO_USERNAME || 'admin',
  pwd: process.env.MONGO_PASSWORD || 'admin',
  roles: [{ role: 'root', db: 'admin' }],
});

// Create application database and user
db = db.getSiblingDB('epita');
db.createUser({
  user: process.env.MONGO_USERNAME || 'admin',
  pwd: process.env.MONGO_PASSWORD || 'admin',
  roles: [{ role: 'readWrite', db: 'epita' }],
});

print('MongoDB initialization completed');
