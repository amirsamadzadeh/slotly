const express = require("express");
const router = express.Router();
const prisma = require("../lib/prisma");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const authMiddleWare = require("../middlewares/auth.middleware");

router.post("/register", async (req, res) => {
  try {
    const { name, email, password, username } = req.body;

    if (
      !name?.trim() ||
      !email?.trim() ||
      !password?.trim() ||
      !username?.trim()
    ) {
      return res
        .status(400)
        .json({ message: "هیچکدام از فیلد ها نباید خالی باشد" });
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanUsername = username.trim().toLowerCase();
    const cleanName = name.trim();

    const isUserAlreadyExist = await prisma.user.findFirst({
      where: {
        OR: [{ username: cleanUsername }, { email: cleanEmail }],
      },
    });

    if (isUserAlreadyExist) {
      return res
        .status(409)
        .json({ message: "یوزرنیم یا ایمیل از قبل ثبت نام شده است" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name: cleanName,
        password: hashedPassword,
        email: cleanEmail,
        username: cleanUsername,
      },
      select: {
        id: true,
        name: true,
        email: true,
        username: true,
        createdAt: true,
      },
    });

    return res.status(201).json({
      message: "با موفقیت ثبت نام شدید . ",
      data: user,
    });
  } catch (err) {
    console.log("error -> ", err);
    res.status(500).json({ message: "خطای سرور" });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email?.trim() || !password?.trim()) {
      return res.status(401).json({ message: "ایمیل یا پسوورد اشتباه میباشد" });
    }

    const cleanEmail = email.trim().toLowerCase();

    const user = await prisma.user.findUnique({
      where: { email: cleanEmail },
    });

    if (!user) {
      return res.status(401).json({ message: "ایمیل یا پسوورد اشتباه میباشد" });
    }

    const isPassCorrect = await bcrypt.compare(password, user.password);

    if (!isPassCorrect) {
      return res.status(401).json({ message: "ایمیل یا پسوورد اشتباه میباشد" });
    }

    const userToken = await jwt.sign(
      { id: user.id, username: user.username, email: cleanEmail },
      process.env.JWT_SECRET,
      { expiresIn: "7d" },
    );

    return res.status(200).json({
      message: "با موفقیت وارد شدید .",
      data: {
        id: user.id,
        name: user.name,
        username: user.username,
        email: user.email,
        token: userToken,
      },
    });
  } catch (err) {
    console.log("error -> ", err);
    res.status(500).json({ message: "خطای سرور" });
  }
});

router.get("/me", authMiddleWare, async (req, res) => {
  try {
    const id = req.user.id;
    if (!id) {
      return res.status(401).json({ message: "unauthorized person ." });
    }

    const user = await prisma.user.findUnique({
      where: {
        id,
      },
      select: {
        id: true,
        name: true,
        email: true,
        username: true,
        createdAt: true,
        image: true,
      },
    });

    if (!user) {
      return res.status(401).json({ message: "unauthorized person ." });
    }

    return res.status(200).json({ data: user });
  } catch (error) {
    console.log("error message =>", error);
    return res.status(500).json({ message: "internal server error ." });
  }
});

module.exports = router;
