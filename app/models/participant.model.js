
module.exports = (sequelize, Sequelize) => {
  const Participant = sequelize.define("participant", {
    
    room_id: {
      type: Sequelize.INTEGER,
      allowNull: true,
    },
    user_id: {
      type: Sequelize.INTEGER,
      allowNull: true,
    },
    user_type: {
      type: Sequelize.ENUM('host', 'presenter', 'viewer'),
      allowNull: true,
    },
    sharing_user_type: {
      type: Sequelize.ENUM('none', 'presenter', 'viewer'),
      allowNull: true,
    },
    
  });

  return Participant;
};