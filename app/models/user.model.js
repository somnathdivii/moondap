
module.exports = (sequelize, Sequelize) => {
  const User = sequelize.define("user", {
    // id: {
    //   type: Sequelize.INTEGER,
    //   autoIncrement: true,
    //   allowNull: false,
    //   primaryKey: true,
    // },
    phone: {
      type: Sequelize.STRING,
      unique: true,
      allowNull: false,
    },
    email: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    password: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    name: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    profile_image: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    user_type: {
      type: Sequelize.ENUM('host', 'presenter', 'viewer'),
      allowNull: false,
    },
    createdAt: {
      field: 'created_at',
      type: Sequelize.DATE,
    },
    updatedAt: {
      field: 'updated_at',
      type: Sequelize.DATE,
    },
  });

  return User;
};