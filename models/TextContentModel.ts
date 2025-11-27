import mongoose from "mongoose";

const ContentSchema = new mongoose.Schema({
  _id: { type: mongoose.Types.ObjectId, required: false },
  block_type: { type: String, required: true },
  title: String,
  subtitle: String,
  text: String,
});

const TextContentSchema = new mongoose.Schema({
  page: { type: String, required: true },
  content: [ContentSchema],
});

const TextContent = mongoose.model(
  "text_content",
  TextContentSchema,
  "text_contents"
);

export default TextContent;
