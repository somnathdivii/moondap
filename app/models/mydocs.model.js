module.exports = (sequelize, Sequelize) => {
    const Mydoc = sequelize.define("mydoc", {
       user_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        },
       file_name: {
       type: Sequelize.STRING,
       unique: true,
       allowNull: false,
       },
       file_type: {
        type: Sequelize.ENUM('pdf', 'url'),
        allowNull: false,
      },
      active: {
        type: Sequelize.ENUM('1', '0'),
        allowNull: false,
      },
      createdAt: {
        field: 'createdAt',
        type: Sequelize.DATE,
      },
    });
  
    return Mydoc;
  };