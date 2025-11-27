import mongoose from "mongoose";

const ContentSchema = new mongoose.Schema({
	_id: { type: mongoose.Types.ObjectId, required: false },
	block_type: { type: String, required: true },
	title: String,
	subtitle: String,
	text: String,
});

const CardContentSchema = new mongoose.Schema({
	page: { type: String, required: true },
	content: [ContentSchema],
});

const CardContent = mongoose.model(
	"card_content",
	CardContentSchema,
	"card_contents"
);

export default CardContent;
