import mongoose from "mongoose";

const ContentSchema = new mongoose.Schema({
  _id: { type: mongoose.Types.ObjectId, required: false },
  block_type: { type: String, required: true },
  media_path: String,
});

const MediaContentSchema = new mongoose.Schema({
  page: { type: String, required: true },
  content: [ContentSchema],
});

const MediaContent = mongoose.model(
  "media_content",
  MediaContentSchema,
  "media_contents"
);

export default MediaContent;
