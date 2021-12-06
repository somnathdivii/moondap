module.exports = (sequelize, Sequelize) => {
  const Room = sequelize.define("room", {
    room_name: {
      type: Sequelize.STRING,
      unique: true,
      allowNull: false,
    },
    status: {
      type: Sequelize.ENUM('active', 'inactive'),
      allowNull: false,
    },
    autosaveall: {
      type: Sequelize.ENUM('1', '0'),
      allowNull: true,
    },
    allowsharing: {
      type: Sequelize.ENUM('1', '0'),
      allowNull: true,
    },
    created_by: {
      field: 'created_by',
      type: Sequelize.INTEGER,
    },
    create_date: {
      field: 'create_date',
      type: Sequelize.DATE,
    },
  });

  return Room;
};