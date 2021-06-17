module.exports = (sequelize, Sequelize) => {
  const Locationlib = sequelize.define("locationlib", {
    title: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    is_publish: {
      type: Sequelize.BOOLEAN,
      defaultValue: true,
    },
    created_user_id: {
      type: Sequelize.INTEGER,
      defaultValue: 1,
    },
  });

  return Locationlib;
};
