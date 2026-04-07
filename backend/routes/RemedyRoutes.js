const express = require("express");
const router = express.Router();

// import controllers
const {
    fetchRemedy,
    fetchSingleRemedy,
    searchRemedies
} = require("../controllers/Remedy.controller");

router.get("/", searchRemedies);


router.get("/:id", fetchSingleRemedy);

module.exports = router;