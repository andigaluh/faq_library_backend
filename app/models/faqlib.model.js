module.exports = (sequelize, Sequelize) => {
  const Faqlib = sequelize.define("faqlib", {
    title: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    content: {
      type: Sequelize.TEXT,
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

  return Faqlib;
};
