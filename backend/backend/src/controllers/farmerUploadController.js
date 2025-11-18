const User = require("../models/User"); // ✅ changed from Farmer to User
const cloudinary = require("../config/cloudinary");
const { asyncHandler } = require("../utils/asyncHandler");
const AppError = require("../utils/AppError");

// Upload Farmer Photo
exports.uploadFarmerPhoto = asyncHandler(async (req, res, next) => {
  if (!req.file) {
    return next(new AppError("Please upload an image", 400));
  }

  const result = await cloudinary.uploader.upload(req.file.path, {
    folder: "shamba2shelf/farmers",
    transformation: [{ width: 500, height: 500, crop: "fill" }],
  });


  const farmer = await User.findOneAndUpdate(
    { _id: req.params.id, role: "farmer" },
    { profileImage: result.secure_url },
    { new: true, runValidators: true }
  ).select("-password -refreshTokens -verificationDocuments -bankDetails");

  if (!farmer) {
    return next(new AppError("Farmer not found or not a valid farmer", 404));
  }

  res.status(200).json({
    success: true,
    message: "Profile image uploaded successfully",
    data: farmer,
  });
});
