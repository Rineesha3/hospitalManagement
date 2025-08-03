import Booking from "../models/BookingSchema.js";
import Doctor from "../models/DoctorSchema.js"; 

export const updatedDoctor = async (req, res) => {
  const id = req.params.id;
  const updateFields = { ...req.body };

  if (req.file) {
    updateFields.photo = req.file.filename; // Save only filename or full path depending on your design
  }

  try {
    const updatedDoctor = await Doctor.findByIdAndUpdate(
      id,
      { $set: updateFields },
      { new: true }
    );
    res.status(200).json({
      success: true,
      message: "Updated successfully",
      data: updatedDoctor,
    });
  } catch (err) {
    console.error("Error updating doctor:", err);
    res.status(500).json({ success: false, message: "Failed to update" });
  }
};


export const deletedDoctor = async (req, res) => {
  const id = req.params.id;
  try {
    const deletedDoctor = await Doctor.findByIdAndDelete(id);
    res.status(200).json({
      success: true,
      message: "Deleted successfully",
      data: deletedDoctor,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to delete" });
  }
};
export const getSingleDoctor = async (req, res) => {
  const id = req.params.id;
  try {
    const doctor = await Doctor.findById(id)
      .populate("reviews")
      .select("-password");
    res
      .status(200)
      .json({ success: true, message: "Doctor found", data: doctor });
  } catch (err) {
    res.status(404).json({ success: false, message: "No doctor found" });
  }
};
export const getAllDoctor = async (req, res) => {
  try {
    const { query } = req.query;
    let doctors;

    if (query) {
      doctors = await Doctor.find({
        isApproved: "approved",
        $or: [
          { name: { $regex: query, $options: "i" } },
          { specialization: { $regex: query, $options: "i" } },
        ],
      }).select("-password");
    } else {
      doctors = await Doctor.find({ isApproved: "approved" }).select(
        "-password"
      );
    }

    res
      .status(200)
      .json({ success: true, message: "Doctors found", data: doctors });
  } catch (err) {
    res.status(500).json({ success: false, message: "Not found" });
  }
};

export const getDoctorProfile = async(req,res)=>{
  const doctorId = req.userId;
    try {
      const doctor = await Doctor.findById(doctorId);
      if (!doctor) {
        return res
          .status(404)
          .json({ success: false, message: "Doctor not found" });
      }
      const appointments=await Booking.find({doctor:doctorId}) 
      const { password, ...rest } = doctor._doc;
      res.status(200).json({
        success: true,
        message: "Profile info is getting",
        data: { ...rest,appointments },
      });
    } catch (err) {
      res
        .status(500)
        .json({ success: false, message: "Something went wrong,cannot get" });
    }
}
export const updateDoctorProfile = async (req, res) => {
  const doctorId = req.userId;
  const updateFields = { ...req.body };

  // Handle file upload if applicable
  if (req.file) {
    updateFields.photo = req.file.filename; // Or Cloudinary URL if you're using it
  }

  try {
    const updatedDoctor = await Doctor.findByIdAndUpdate(
      doctorId,
      { $set: updateFields },
      { new: true }
    ).select("-password");

    res.status(200).json({
      success: true,
      message: "Doctor profile updated successfully",
      data: updatedDoctor,
    });
  } catch (err) {
    console.error("Error updating doctor profile:", err);
    res.status(500).json({
      success: false,
      message: "Failed to update doctor profile",
    });
  }
};
