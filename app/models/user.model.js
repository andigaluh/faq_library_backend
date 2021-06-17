module.exports = (sequelize, Sequelize) => {
    const User = sequelize.define("users", {
        username: {
            type: Sequelize.STRING
        },
        email: {
            type: Sequelize.STRING
        },
        password: {
            type: Sequelize.STRING
        },
        status: {
            type: Sequelize.BOOLEAN,
            defaultValue: false,
            allowNull: false,
        },
            accesstoken: {
            type: Sequelize.TEXT
        },
            last_signin: {
            type: Sequelize.DATE,
            allowNull: true,
        }
    });

    return User;
};