const router = require("express").Router();
const auth = require("../middleware/authMiddleware");
const controller = require("../controllers/careController");
router.use(auth);
router.get("/", controller.list);
router.post("/", controller.save);
router.patch("/:id", controller.save);
router.post("/:id/doses", controller.takeDose);
module.exports = router;
