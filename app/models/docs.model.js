module.exports = (sequelize, Sequelize) => {
  const Attachment = sequelize.define("attachment", {
    file_name: {
      type: Sequelize.STRING,
      unique: true,
      allowNull: true,
    },
    file_type: {
      type: Sequelize.ENUM('pdf', 'url'),
      allowNull: true,
    },
    user_id: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
    doc_id: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
    room_id: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
    createdAt: {
      field: 'createdAt',
      type: Sequelize.DATE,
    },
  });

  return Attachment;
};