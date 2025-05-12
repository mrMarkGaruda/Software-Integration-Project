// docker/init-scripts/02-init-mongo.js
//
// This script initializes the MongoDB replica set for production environments
// It will be automatically executed when the MongoDB container starts

// Use hardcoded credentials for initialization (do not use process.env)
const adminUser = 'admin';
const adminPwd = 'admin';
const appUser = 'appuser';
const appPwd = 'apppassword';

// Check if we're in a production environment with replica set
if (db.runCommand({ isMaster: 1 }).msg !== 'isdbgrid') {
  print('Configuring MongoDB replica set...');

  // Only initiate if not already initialized
  try {
    const status = rs.status();
    if (status.ok === 0 || status.codeName === 'NotYetInitialized') {
      rs.initiate({
        _id: 'rs0',
        members: [
          { _id: 0, host: 'mongodb:27017', priority: 2 },
          { _id: 1, host: 'mongodb_backup:27018', priority: 1 },
        ],
      });
      print('Replica set initialized successfully');
    } else {
      print('Replica set already initialized');
    }
  } catch (e) {
    print('Error initializing replica set: ' + e);
    print('This may be normal if the replica set is already initialized');
  }
}

// Create admin user if not exists
try {
  db = db.getSiblingDB('admin');
  if (db.system.users.find({ user: adminUser }).count() === 0) {
    db.createUser({
      user: adminUser,
      pwd: adminPwd,
      roles: [{ role: 'root', db: 'admin' }],
    });
    print('Admin user created');
  } else {
    print('Admin user already exists');
  }
} catch (e) {
  print('Error creating admin user: ' + e);
}

// Create application database user if not exists
try {
  db = db.getSiblingDB('epita');
  if (db.system.users.find({ user: appUser }).count() === 0) {
    db.createUser({
      user: appUser,
      pwd: appPwd,
      roles: [{ role: 'readWrite', db: 'epita' }],
    });
    print('Application user created');
  } else {
    print('Application user already exists');
  }
} catch (e) {
  print('Error creating application user: ' + e);
}

// Add a healthcheck to MongoDB in Compose files and update mongo-express depends_on
// (This is a YAML change, not JS, but here is the healthcheck for Compose)
//
// In docker-compose.yml, docker-compose.dev.yml, docker-compose.release.yml, docker-compose.pprod.yml, docker-compose.prod.yml:
//
//   mongodb:
//     ...
//     healthcheck:
//       test: ["CMD", "mongosh", "--eval", "db.adminCommand('ping')"]
//       interval: 10s
//       timeout: 5s
//       retries: 5
//
//   mongo-express:
//     ...
//     depends_on:
//       mongodb:
//         condition: service_healthy
//
// Also, ensure all ME_CONFIG_MONGODB_SERVER and connection strings use 'mongodb' (not 'mongo').
//
// No code change needed in this JS file, but this comment documents the infra fix.

print('MongoDB initialization completed');
