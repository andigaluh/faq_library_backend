var router = require("express").Router();
const { authJwt } = require("../middleware");
const controller = require("../controllers/faqlib.controller");

module.exports = function (app) {
  app.use(function (req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });

  router.post("/", [authJwt.verifyToken], controller.create);

  router.get("/", [authJwt.verifyToken], controller.shows);

  router.get(
    "/:id",
    [authJwt.verifyToken],
    controller.findOne
  );

 router.put("/:id", [authJwt.verifyToken], controller.update);

  router.delete(
    "/:id",
    [authJwt.verifyToken],
    controller.delete
  );

  app.use("/api/faq", router);
};
