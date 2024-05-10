const express = require("express");
const tourController = require("./../controllers/tourController.js");
const revController = require("../controllers/revController.js");
const authController = require("../controllers/authController.js");
const router = express.Router({ mergeParams: true });

router.use(authController.protect); //to protect all routes

router.get("/", revController.getAllReviews);
router.post(
  "/",
  authController.restrictTo("user"),
  revController.setUserTourId,
  revController.newReview
);
router
  .route("/:id")
  .get(revController.getReview)
  .delete(
    authController.restrictTo("user", "admin"),
    revController.deleteReview
  )
  .patch(
    authController.restrictTo("user", "admin"),
    revController.updateReview
  );
module.exports = router;
