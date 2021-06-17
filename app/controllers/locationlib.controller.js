const db = require("../models");
const Locationlib = db.locationlib;

const Op = db.Sequelize.Op;

// Read all locationlibs
exports.shows = (req, res) => {
    const title = req.query.title;
    var condition = title ? { title: { [Op.like]: `%${title}%` } } : null;
    
    Locationlib.findAll({
        where: condition,
        attributes: ["id", "title", "is_publish"],
    })
        .then((data) => {
            res.status(200).send({
                error : false,
                data : data
            })
        })
        .catch((err) => {
            res.status(500).send({
                message:
                err.message ||
                "Some error occurred while retrieving locationlibs.",
            });
        });
};

// Create and Save a new Locationlib
exports.create = async (req, res) => {
    // Validate request
    if (!req.body.title) {
        res.status(400).send({
        message: "Title can not be empty!",
        });
        return;
    }

    // Create a locationlib
    const locationlib = {
        title: req.body.title,
        created_user_id: req.userId,
        is_publish: true
    };

    // Save locationlib in the database
    Locationlib.create(locationlib)
        .then((data) => {
            res.send({
                error : false,
                data
            });
        })
        .catch((err) => {
        res.status(400).send({
            message:
            err.message ||
            "Some error occurred while creating the Locationlib.",
        });
        });
};

// Update and save an locationlib
exports.update = (req, res) => {
    const id = req.params.id;
    Locationlib.update(req.body, {
        where: { id: id },
    })
        .then((num) => {
        if (num == 1) {
            res.send({
                error: false,
                message: "Locationlib was updated successfully.",
            });
        } else {
            res.send({
                error: true,
                message: `Cannot update Locationlib with id=${id}. Maybe Locationlib was not found or req.body is empty!`,
            });
        }
        })
        .catch((err) => {
        res.status(400).send({
            message: "Error updating Locationlib with id=" + id,
        });
        });
};

// Read locationlib by id
exports.findOne = async (req, res) => {
  const id = req.params.id;

  Locationlib.findByPk(id, {
    attributes: ["id", "title"],
  })
    .then((data) => {
      res.send({
        error : false,
        data
      });
    })
    .catch((err) => {
      res.status(400).send({
        message: "Error retrieving Locationlib with id=" + id,
      });
    });
};

// Delete locationlib by id
exports.delete = (req, res) => {
    const id = req.params.id;

    Locationlib.destroy({
        where: { id: id },
    })
        .then((num) => {
        if (num == 1) {
            res.send({
                error: false,
                message: "Locationlib was deleted successfully!",
            });
        } else {
            res.send({
                error: true,
                message: `Cannot delete Locationlib with id=${id}. Maybe Locationlib was not found!`,
            });
        }
        })
        .catch((err) => {
            res.status(500).send({
                message: "Could not delete Locationlib with id=" + id,
            });
        });
};
