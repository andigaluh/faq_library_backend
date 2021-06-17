var router = require("express").Router();
const { authJwt } = require("../middleware");
const controller = require("../controllers/categorylib.controller");

module.exports = function (app) {
  app.use(function (req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });

  router.put("/:id", [authJwt.verifyToken, authJwt.isAdmin], controller.update);

  router.get(
    "/:id",
    [authJwt.verifyToken, authJwt.isAdmin],
    controller.findOne
  );

  router.get("/", [authJwt.verifyToken, authJwt.isAdmin], controller.shows);

  router.post("/", [authJwt.verifyToken, authJwt.isAdmin], controller.create);

  // Delete with id
  router.delete(
    "/:id",
    [authJwt.verifyToken, authJwt.isAdmin],
    controller.delete
  );

  app.use("/api/category", router);
};
