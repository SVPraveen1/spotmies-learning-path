const express = require("express");
const router = express.Router();
const { exportPDF, exportJSON } = require("../controllers/exportController");
const { protect } = require("../middleware/auth");

router.use(protect);

router.get("/pdf", exportPDF);
router.get("/json", exportJSON);

module.exports = router;
