const express = require("express");
const tourController = require("./../controllers/tourController.js");
const authController = require("../controllers/authController.js");
// const reveiwsController = require("../controllers/revController.js");
const reviewsRoutes = require("../routes/reviewsRoutes");
const router = express.Router();

//nested route:
router.use("/:tourId/reviews", reviewsRoutes);

// router.param("id", tourController.chekId);

router
  .route("/fiveTopCheap")
  .get(tourController.getTopCheap, tourController.getAllTours);

router.route("/tour-stats").get(tourController.getTourStats);

router
  .route("/monthly-plan")
  .get(
    authController.protect,
    authController.restrictTo("admin", "lead-guide", "guide"),
    tourController.getMonthlyPlan
  );

router
  .route("/")
  .get(tourController.getAllTours)
  .post(
    authController.protect,
    authController.restrictTo("admin", "lead-guide"),
    tourController.createTour
  );

router
  .route("/:id")
  .get(tourController.getTour)
  .patch(
    authController.protect,
    authController.restrictTo("admin", "lead-guide"),
    tourController.updateTour
  )
  .delete(
    authController.protect,
    authController.restrictTo("admin", "lead-guide"),
    tourController.deleteTour
  );

module.exports = router;
