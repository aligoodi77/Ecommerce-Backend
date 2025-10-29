import express from "express";
import User from "./user.model.js";
import bcrypt from "bcryptjs";
import generateToken from "../middleware/generateToken.js";
import verifyToken from "../middleware/verifyToken.js";

const router = express.Router();

// Register Route
router.post("/register", async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // check for missing fields
    if (!username || !email || !password) {
      return res.status(400).json({ message: "Please fill all fields" });
    }

    // check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // create new user
    const newUser = new User({
      username,
      email,
      password: hashedPassword,
    });

    // save user
    await newUser.save();

    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// Login Route
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // check fields
    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Please enter both email and password" });
    }

    // find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = await generateToken(user._id);

    res.cookie("token", token, {
      httpOnly: true,
      secure: true,
      sameSite: "None",
    });

    res.status(200).json({
      message: "Login successful",
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        profileImage: user.profileImage,
        bio: user.bio,
        profession: user.profession,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// Logout Route
router.post("/logout", async (req, res) => {
  try {
    // clear token cookie
    res.clearCookie("token", {
      httpOnly: true,
      secure: true,
      sameSite: "None",
    });

    res.status(200).json({ message: "Logout successful" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// Delete User Route
router.delete("/users/:id", verifyToken, async (req, res) => {
  try {
    const { id } = req.params;

    // check if user exists
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // delete user
    await User.findByIdAndDelete(id);

    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// Get All Users Route
router.get("/users", verifyToken, async (req, res) => {
  try {
    const users = await User.find({}, "id email role").sort({ creatAt: -1 });
    res.status(200).json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// Update User Role Route
router.put("/users/:id", verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { newRole } = req.body;

    // find and update user
    const user = await User.findByIdAndUpdate(id, { role }, { new: true });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      message: "User role updated successfully",
      user,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

//edit or update profile
router.patch("/edit-profile", verifyToken, async (req, res) => {
  try {
    const { userId, username, profileImage, bio, profession } = req.body;

    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }
    if (!User) {
      return res.status(400).json({ message: "User not found" });
    }

    //Update Profile

    if (username !== undefined) {
      User.username = username;
    }
    if (profileImage !== undefined) {
      User.profileImage = profileImage;
    }
    if (bio !== undefined) {
      User.bio = bio;
    }
    if (profession !== undefined) {
      User.profession = profession;
    }
    await User.save();
    res.status(200).json({
      message: "Login successful",
      user: {
        _id: User._id,
        username: User.username,
        email: User.email,
        role: User.role,
        profileImage: User.profileImage,
        bio: User.bio,
        profession: User.profession,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
