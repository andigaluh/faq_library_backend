const db = require("../models");
const Categorylib = db.categorylib;

const Op = db.Sequelize.Op;

// Read all categorylibs
exports.shows = (req, res) => {
  const title = req.query.title;
  var condition = title ? { title: { [Op.like]: `%${title}%` } } : null;

  Categorylib.findAll({
    where: condition,
    attributes: ["id", "title", "is_publish"],
  })
    .then((data) => {
      res.status(200).send({
        error: false,
        data: data,
      });
    })
    .catch((err) => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while retrieving categorylibs.",
      });
    });
};

// Create and Save a new Categorylib
exports.create = async (req, res) => {
  // Validate request
  if (!req.body.title) {
    res.status(400).send({
      message: "Title can not be empty!",
    });
    return;
  }

  // Create a categorylib
  const categorylib = {
    title: req.body.title,
    created_user_id: req.userId,
    is_publish: true,
  };

  // Save categorylib in the database
  Categorylib.create(categorylib)
    .then((data) => {
      res.send({
        error: false,
        data,
      });
    })
    .catch((err) => {
      res.status(400).send({
        message:
          err.message || "Some error occurred while creating the Categorylib.",
      });
    });
};

// Update and save an categorylib
exports.update = (req, res) => {
  const id = req.params.id;
  Categorylib.update(req.body, {
    where: { id: id },
  })
    .then((num) => {
      if (num == 1) {
        res.send({
            error: false,
          message: "Categorylib was updated successfully.",
        });
      } else {
        res.send({
            error: true,
          message: `Cannot update Categorylib with id=${id}. Maybe Categorylib was not found or req.body is empty!`,
        });
      }
    })
    .catch((err) => {
      res.status(400).send({
        message: "Error updating Categorylib with id=" + id,
      });
    });
};

// Read categorylib by id
exports.findOne = async (req, res) => {
  const id = req.params.id;

  Categorylib.findByPk(id, {
    attributes: ["id", "title"],
  })
    .then((data) => {
      res.send({
            error: false,
            data
        });
    })
    .catch((err) => {
      res.status(400).send({
        message: "Error retrieving Categorylib with id=" + id,
      });
    });
};

// Delete categorylib by id
exports.delete = (req, res) => {
  const id = req.params.id;

  Categorylib.destroy({
    where: { id: id },
  })
    .then((num) => {
      if (num == 1) {
        res.send({
            error: false,
          message: "Categorylib was deleted successfully!",
        });
      } else {
        res.send({
            error: true,
          message: `Cannot delete Categorylib with id=${id}. Maybe Categorylib was not found!`,
        });
      }
    })
    .catch((err) => {
      res.status(500).send({
        message: "Could not delete Categorylib with id=" + id,
      });
    });
};
