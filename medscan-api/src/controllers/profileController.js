const User = require("../models/User");
const Profile = require("../models/Profile");

async function getProfile(req, res, next) {
  try {
    let profile = await Profile.findOne({ userId: req.user._id });

    if (!profile) {
      profile = await Profile.create({ userId: req.user._id });
    }

    return res.json({
      user: {
        id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        age: req.user.age
      },
      profile
    });
  } catch (error) {
    next(error);
  }
}

async function updateProfile(req, res, next) {
  try {
    const { name, email, age, verified, relatives, settings } = req.body;

    const numericAge = age === undefined || age === "" ? undefined : Number(age);
    if (numericAge !== undefined && (!Number.isInteger(numericAge) || numericAge < 0 || numericAge > 120)) {
      return res.status(400).json({ message: "Informe uma idade válida entre 0 e 120 anos." });
    }

    if (name || email || numericAge !== undefined) {
      await User.findByIdAndUpdate(req.user._id, {
        ...(name ? { name } : {}),
        ...(email ? { email } : {}),
        ...(numericAge !== undefined ? { age: numericAge } : {})
      });
    }

    const profile = await Profile.findOneAndUpdate(
      { userId: req.user._id },
      {
        ...(typeof verified === "boolean" ? { verified } : {}),
        ...(relatives ? { relatives } : {}),
        ...(settings ? { settings } : {})
      },
      { new: true, upsert: true }
    );

    const user = await User.findById(req.user._id).select("-password");

    return res.json({
      user,
      profile
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getProfile,
  updateProfile
};
