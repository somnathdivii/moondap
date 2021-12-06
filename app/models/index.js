const config = require("../config/db.config.js");
const Sequelize = require("sequelize");
const session = require('express-session');
const SequelizeStore = require('connect-session-sequelize')(session.Store);


var sequelize = new Sequelize(config.DB, config.USER, config.PASSWORD, {
  host: "localhost",
  dialect: "mysql",
  // logging: function () { },
  pool: {
    max: config.pool.max,
    min: config.pool.min,
    idle: config.pool.idle
  },
  // dialectOptions: {
  //   socketPath: "/var/run/mysqld/mysqld.sock"
  // },
  define: {
    paranoid: true
  }
});

sequelize
  .authenticate()
  .then(() => {
    console.log('Connection has been established successfully.');
  })
  .catch(err => {
    console.error('Unable to connect to the database:', err);
  });

// storing the session 
const sequelizeSessionStore = new SequelizeStore({
  db: sequelize,
});

const db = {};

// initializing in db object

db.Sequelize = Sequelize;
db.sequelize = sequelize;

// lets initiate our stored object
db.sequelizeSessionStore = sequelizeSessionStore;
// db.storage = storage;

db.user = require("../models/user.model.js")(sequelize, Sequelize, sequelizeSessionStore);
db.room = require("../models/room.model.js")(sequelize, Sequelize, sequelizeSessionStore);
db.participant = require("../models/participant.model.js")(sequelize, Sequelize, sequelizeSessionStore);
db.docs = require("../models/docs.model.js")(sequelize, Sequelize, sequelizeSessionStore);
db.mydocs = require("../models/mydocs.model.js")(sequelize, Sequelize, sequelizeSessionStore);



db.room.hasMany(db.participant, {foreignKey: 'room_id'})

db.participant.belongsTo(db.room, {foreignKey: 'room_id'})

db.user.hasMany(db.participant, {foreignKey: 'user_id'})

db.participant.belongsTo(db.user, {foreignKey: 'user_id'})


db.room.hasMany(db.docs, {foreignKey: 'room_id'})

db.docs.belongsTo(db.room, {foreignKey: 'room_id'})

db.user.hasMany(db.room, {foreignKey: 'created_by'})

db.room.belongsTo(db.user, {foreignKey: 'created_by'})


db.participant.belongsTo
(
  db.docs,
  {
      targetKey: 'room_id',
      foreignKey: 'room_id',
      // scope: {
      //     product_id: { $col: 'CustomerPurchasedProduct.product_id' }
      // }
  }
)


db.mydocs.hasMany(db.docs , {foreignKey: 'doc_id'})

// db.role = require("../models/role.model.js")(sequelize, Sequelize);

// db.role.belongsToMany(db.user, {
//   through: "user_roles",
//   foreignKey: "roleId",
//   otherKey: "userId"
// });
// db.user.belongsToMany(db.role, {
//   through: "user_roles",
//   foreignKey: "userId",
//   otherKey: "roleId"
// });

// db.ROLES = ["user", "admin", "moderator"];

module.exports = db;
