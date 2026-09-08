import Contact from "../models/ContactSchema.js";

export const getAllContactMessages = async (req, res) => {
  try {
    const messages = await Contact.find({}).sort("-createdAt");
    res.status(200).json({ success: true, message: "Messages found", data: messages });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to fetch messages" });
  }
};

export const createContactMessage = async (req, res) => {
  const { email, subject, message } = req.body;
  if (!email || !subject || !message) {
    return res.status(400).json({
      success: false,
      message: "Email, subject and message are required",
    });
  }
  try {
    const contact = await Contact.create({ email, subject, message });
    res.status(200).json({
      success: true,
      message: "Message sent successfully",
      data: contact,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to send message" });
  }
};
