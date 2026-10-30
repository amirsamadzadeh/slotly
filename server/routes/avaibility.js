const express = require("express");
const router = express.Router();
const prisma = require("../lib/prisma");
const authMiddleWare = require("../middlewares/auth.middleware");

router.get("/", authMiddleWare, async (req, res) => {
  try {
    const userID = req.user.id;

    const avaibilities = await prisma.availability.findMany({
      where: {
        userId: userID,
      },
      orderBy: {
        dayOfWeek: "asc",
      },
    });

    return res.status(200).json(avaibilities);
  } catch (error) {
    console.log("error =>", error);
    return res.status(500).json({ message: "internal server error ." });
  }
});

router.post("/", authMiddleWare, async (req, res) => {
  try {
    const { dayOfWeek, startTime, endTime } = req.body;
    const userID = req.user.id;

    if (
      typeof dayOfWeek !== "number" ||
      dayOfWeek < 0 ||
      dayOfWeek > 6 ||
      !startTime?.trim("") ||
      !endTime?.trim("") ||
      startTime.trim() >= endTime.trim()
    ) {
      return res
        .status(400)
        .json({ message: "لطفا مقادیر درست برای هر یک فیلد وارد کنید ." });
    }

    const savedSlot = await prisma.availability.upsert({
      where: {
        userId_dayOfWeek: {
          userId: userID,
          dayOfWeek: dayOfWeek,
        },
      },
      update: {
        startTime: startTime.trim(),
        endTime: endTime.trim(),
      },
      create: {
        userId: userID,
        dayOfWeek: dayOfWeek,
        startTime: startTime.trim(),
        endTime: endTime.trim(),
      },
    });

    return res.status(200).json(savedSlot);
  } catch (error) {
    console.log("error =>", error);
    return res.status(500).json({ message: "internal server error ." });
  }
});

router.delete("/:dayOfWeek", authMiddleWare, async (req, res) => {
  try {
    const day = Number(req.params.dayOfWeek);
    const userID = req.user.id;

    if (typeof day !== "number" || day < 0 || day > 6 || Number.isNaN(day)) {
      return res.status(400).json({ message: "not valid day of a week" });
    }

    await prisma.availability.delete({
      where: {
        userId_dayOfWeek: {
          userId: userID,
          dayOfWeek: day,
        },
      },
    });

    return res
      .status(202)
      .json({ message: "day deleted from bookingTime Avaibility" });
  } catch (error) {
    console.log("error =>", error);
    return res.status(500).json({ message: "internal server error ." });
  }
});

module.exports = router;
