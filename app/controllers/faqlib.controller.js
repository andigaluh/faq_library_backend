const db = require("../models");
const middleware = require("../middleware");
const Locationlib = db.locationlib;
const Categorylib = db.categorylib;
const Faqlib = db.faqlib;
const User = db.user;
const getPagination = middleware.Pagination.getPagination;
const getPagingData = middleware.Pagination.getPagingData;
const Op = db.Sequelize.Op;

// Create and Save a new News
exports.create = async (req, res) => {
    // Validate request
    if (!req.body.title) {
        res.status(400).send({
            message: "Title can not be empty!",
        });
        return;
    }

    // Create a news
    const formData = {
        title: req.body.title,
        content: req.body.content,
        locationlib_id: req.body.locationlib_id,
        categorylib_id: req.body.categorylib_id,
        created_user_id: req.userId,
        is_publish: req.body.is_publish
        };

        // Save news in the database
        Faqlib.create(formData)
        .then((data) => {
            res.send({
                error : false,
                message : "Success",
                data
            });
        })
        .catch((err) => {
            res.status(400).send({
            message:
                err.message || "Some error occurred while creating the Article.",
            });
        });
};

// Read all faq
exports.shows = (req, res) => {
    const { page, size, title, is_publish } = req.query;
    const { limit, offset } = getPagination(page, size);
    var ispublish = is_publish ? { is_publish: { [Op.eq]: is_publish } } : null;
    var istitle = title ? { title: { [Op.like]: `%${title}%` } } : null;
    var condition = {
        [Op.and]: [ispublish, istitle],
    };


    Faqlib.findAndCountAll({
        where: condition,
        limit,
        offset,
        attributes: ["id", "title", "content", "is_publish", "createdAt"],
        include: [
        {
            model: Locationlib,
            as: "locationlib",
            attributes: ["id", "title"],
        },
        {
            model: Categorylib,
            as: "categorylib",
            attributes: ["id", "title"],
        },
        {
            model: User,
            as: "created_user",
            attributes: ["id", "username"],
        },
        ],
        order: [["id", "DESC"]],
    })
        .then((data) => {
            if (data.rows.length > 0) {
                const response = getPagingData(data, page, limit);
                res.send({
                    error: false,
                    message: "data found",
                    data: response,
                });
            } else {
                res.status(200).send({
                    error: true,
                    message: "data not found",
                    data: [],
                });
            }
            
        })
        .catch((err) => {
            res.status(500).send({
                message: err.message || "Some error occurred while retrieving Article.",
            });
        });
};

exports.findOne = async (req, res) => {
    const id = req.params.id;

    Faqlib.findByPk(id, {
        attributes: ["id", "title", "content", "is_publish", "createdAt"],
        include: [
        {
            model: Locationlib,
            as: "locationlib",
            attributes: ["id", "title"],
        },
        {
            model: Categorylib,
            as: "categorylib",
            attributes: ["id", "title"],
        },
        {
            model: User,
            as: "created_user",
            attributes: ["id", "username"],
        },
        ],
    })
        .then((data) => {
            if(data) {
                res.send({
                error: false,
                message: "data found",
                data,
                });
            } else {
                res.status(200).send({
                error: true,
                message: "data not found",
                data: []
                });
            }
        
        })
        .catch((err) => {
        res.status(400).send({
            message: "Error retrieving FAQ with id=" + id,
        });
    });
};

exports.update = (req, res) => {
    const id = req.params.id;

    Faqlib.update(req.body, {
        where: { id: id },
    })
        .then((num) => {
        if (num == 1) {
            res.send({
                error: false,
                message: "Faq was updated successfully.",
            });
        } else {
            res.send({
            error: true,
            message: `Cannot update faq with id=${id}. Maybe faq was not found or req.body is empty!`,
            });
        }
        })
        .catch((err) => {
        res.status(400).send({
            message: "Error updating Faq with id=" + id,
        });
    });
};

exports.delete = (req, res) => {
  const id = req.params.id;

  Faqlib.destroy({
    where: { id: id },
  })
    .then((num) => {
      if (num == 1) {
        res.send({
            error: false,
          message: "Faq was deleted successfully!",
        });
      } else {
        res.send({
            error: true,
          message: `Cannot delete Article with id=${id}. Maybe Article was not found!`,
        });
      }
    })
    .catch((err) => {
      res.status(500).send({
        message: "Could not delete Article with id=" + id,
      });
    });
};