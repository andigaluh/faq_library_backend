const db = require("../models");
const config = require("../config/auth.config");
const User = db.user;
const Role = db.role;

const Op = db.Sequelize.Op;

var jwt = require("jsonwebtoken");
var bcrypt = require("bcryptjs");
const mailsender = require("../middleware/mailsender");
const encDec = require("../middleware/encDec")
const configMail = require("../config/mail.config");

exports.signup = (req, res) => {

    if (!req.body.username) {
        res.status(400).send({
        message: "Username can not be empty!"
        });
        return
    }

    if (!req.body.email) {
        res.status(400).send({
        message: "Email can not be empty!"
        });
        return;
    }

    if (!req.body.password) {
        res.status(400).send({
        message: "Password can not be empty!",
        });
        return;
    }

  // Save User to Database
  User.create({
    username: req.body.username,
    email: req.body.email,
    password: bcrypt.hashSync(req.body.password, 8),
    status: req.body.status,
  })
    .then(user => {
      if (req.body.roles) {
        Role.findAll({
          where: {
            name: {
              [Op.or]: req.body.roles
            }
          }
        }).then(roles => {
          user.setRoles(roles).then(() => {
            res.send({ message: configMail.userRegistrationSuccessText });
          });
        });
      } else {
        // user role = 1
        user.setRoles([1]).then(() => {
          res.send({ message: configMail.userRegistrationSuccessText });
        });
      }

      let encryptedId = encDec.encryptedString(user.id);
      let urlActivation = config.URL + "/api/auth/activate/" + encryptedId;

      let textMsg = configMail.userRegistrationText.replace("{req.body.name}", req.body.name).replace("{req.body.email}", req.body.email).replace("{req.body.password}", req.body.password).replace("{urlActivation}", urlActivation);
      
      let htmlMsg = configMail.userRegistrationHTML.replace("{req.body.name}", req.body.name).replace("{req.body.email}", req.body.email).replace("{req.body.password}", req.body.password).replace("{urlActivation}", urlActivation).replace("{urlActivationText}", urlActivation);

      mailsender({
        to: req.body.email,
        subject: configMail.userRegistrationSubject,
        text: textMsg,
        html: htmlMsg,
      });

    })
    .catch(err => {
      res.status(500).send({ message: err.message });
    });
};

exports.signin = (req, res) => {
  User.findOne({
    where: {
      username: req.body.username
    }
  })
    .then(user => {
      if (!user) {
        return res.status(404).send({ message: "User Not found." });
      }

      if (user.status === false) {
        return res.status(404).send({ message: "User not active" })
      }

      var passwordIsValid = bcrypt.compareSync(
        req.body.password,
        user.password
      );

      if (!passwordIsValid) {
        return res.status(401).send({
          accessToken: null,
          message: "Invalid Password!"
        });
      }

      var token = jwt.sign({ id: user.id }, config.secret, {
        expiresIn: 86400 // 24 hours
      });

      var authorities = [];
      user.getRoles().then(roles => {
        for (let i = 0; i < roles.length; i++) {
          authorities.push("ROLE_" + roles[i].name.toUpperCase());
        }

        User.update({ accesstoken: token, last_signin: Date() }, { where: { id: user.id }}).then((num) => {
          console.log('update accessToken : ' + num);
        })

        res.status(200).send({
          id: user.id,
          username: user.username,
          email: user.email,
          roles: authorities,
          accessToken: token,
          last_signin: Date()
        });
      });
    })
    .catch(err => {
      res.status(500).send({ message: err.message });
    });
};

exports.logout = (req, res) => {
  const id = req.userId
  const logoutToken = ""
  User.update({
    accesstoken: logoutToken
  }, {
    where: { id: id },
  })
    .then((num) => { 
      if (num == 1) {
        res.send({
          message: "User was Logout.",
        });
      } else {
        res.send({
          message: `Cannot logout User with id=${id}. Maybe User was not found or req.body is empty!`,
        });
      }
    })
    .catch((err) => {
      res.status(400).send({
        message: "Error logout User with id=" + id,
      });
    });
};

// Activate / non-activate user by id
exports.activate = (req, res) => {
  //const id = req.params.id;
  const id = req.params.id;
  const status = (req.params.status == "true") ? true : false;

  User.update({
    status: status
  }, {
    where: { id: id },
  })
    .then((num) => {
      if (num == 1) {
        if (status == true) {
          res.send({
            message: "User is active",
          });
        } else {
          res.send({
            message: "User is not-active",
          });
        }
      } else {
        res.send({
          message: `Cannot update User with id=${id}. Maybe User was not found or req.body is empty!`,
        });
      }
    })
    .catch((err) => {
      res.status(400).send({
        message: "Error updating User with id=" + id,
      });
    });
};

// Activate / non-activate user by email
exports.activateByEmail = (req, res) => {
  const id = encDec.decryptedString(req.params.id);
  const status = true;

  User.update({
    status: status
  }, {
    where: { id: id },
  })
    .then((num) => {
      if (num == 1) {
        if (status == true) {
          res.send({
            message: "Congratulation User is active now",
          });
        } else {
          res.send({
            message: "User is not-active",
          });
        }
      } else {
        res.send({
          message: `Cannot update User with id=${id}. Maybe User was not found or req.params is empty!`,
        });
      }
    })
    .catch((err) => {
      res.status(400).send({
        message: "Error updating User with id=" + id,
      });
    });
};

exports.findMe = async (req, res) => {
  const id = req.userId;

  User.findByPk(id, {
    attributes: ["id", "username", "email", "status", "createdAt", "updatedAt", "last_signin"]
  })
    .then((data) => {
      res.send(data);
    })
    .catch((err) => {
      res.status(400).send({
        message: "Error retrieving User with id=" + id,
      });
    });
};

// Update and save an user by login
exports.updateMe = (req, res) => {
  //const id = req.params.id;
  const id = req.userId;

  User.update(req.body, {
    where: { id: id },
  })
    .then((num) => {
      if (num == 1) {
        res.send({
          message: "User was updated successfully.",
        });
      } else {
        res.send({
          message: `Cannot update User with id=${id}. Maybe User was not found or req.body is empty!`,
        });
      }
    })
    .catch((err) => {
      res.status(400).send({
        message: "Error updating User with id=" + id,
      });
    });
};

// Update and save an user by login
exports.updatePasswordByMe = (req, res) => {
  //const id = req.params.id;
  const id = req.userId;

  User.update(
    { password: bcrypt.hashSync(req.body.password, 8) },
    {
      where: { id: id },
    }
  )
    .then((num) => {
      if (num == 1) {
        res.send({
          message: "Password was updated successfully.",
        });
      } else {
        res.send({
          message: `Cannot update User with id=${id}. Maybe User was not found or req.body is empty!`,
        });
      }
    })
    .catch((err) => {
      res.status(400).send({
        message: "Error updating User with id=" + id,
      });
    });
};

// Delete user by id
exports.delete = (req, res) => {
  const id = req.params.id;
  //const id = req.userId;

  User.destroy({
    where: { id: id },
  })
    .then((num) => {
      if (num == 1) {
        res.send({
          message: "User was deleted successfully!",
        });
      } else {
        res.send({
          message: `Cannot delete User with id=${id}. Maybe User was not found!`,
        });
      }
    })
    .catch((err) => {
      res.status(500).send({
        message: "Could not delete User with id=" + id,
      });
    });
};

// check valid email
exports.findByEmail = (req, res) => {
  const email = req.body.email;
  User.findOne({
    where: { email },
    order: [['id', 'DESC']],
    attributes: ["id", "name", "email"],
  })
    .then((data) => {
      if (data) {
        res.send({ status: true, message: "verification link has been send to your email", content: data });
        let encryptedId = encDec.encryptedString(data.email);
        let urlActivation = config.CORSURL + "/reset-password/" + encryptedId;

        let textMsg = configMail.userForgetPasswordText.replace("{req.body.name}", data.name).replace("{urlActivation}", urlActivation);

        let htmlMsg = configMail.userForgetPasswordHTML.replace("{req.body.name}", data.name).replace("{urlActivation}", urlActivation).replace("{urlActivationText}", urlActivation);

        mailsender({
          to: req.body.email,
          subject: configMail.userForgetPasswordSubject,
          text: textMsg,
          html: htmlMsg,
        });

      } else {
        res.send({ status: false, message: "email not found", content: "" });
      }

    })
    .catch((err) => {
      res.status(500).send({
        message: err.message || "Some error occurred while retrieving agendas.",
      });
    });
};

// check valid email from encrypted id
exports.findEmailEnc = (req, res) => {
  const email = encDec.decryptedString(req.params.id);

  User.findOne({
    where: { email },
    order: [["id", "DESC"]],
    attributes: ["id", "name", "email"],
  })
    .then((data) => {
      if (data) {
        res.send({ status: true, message: "valid email", content: data });
      } else {
        res.send({ status: false, message: "email not found", content: "" });
      }
    })
    .catch((err) => {
      res.status(500).send({
        message: err.message || "Some error occurred while retrieving agendas.",
      });
    });
};

// reset password
exports.resetPassword = (req, res) => {
  const email = req.body.email;

  User.update(
    { password: bcrypt.hashSync(req.body.password, 8) },
    {
      where: { email },
    }
  )
    .then((num) => {
      if (num == 1) {
        res.send({
          message: `Password was updated successfully. You can login / sign in now`,
        });
      } else {
        res.send({
          message: `Cannot update User with email=${email}. Maybe User was not found or req.body is empty!`,
        });
      }
    })
    .catch((err) => {
      res.status(400).send({
        message: "Error updating User with email=" + email,
      });
    });
};