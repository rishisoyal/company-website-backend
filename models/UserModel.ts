import mongoose from "mongoose";

const UserScema = new mongoose.Schema({
  _id: {
    type: mongoose.Types.ObjectId,
    required: false,
    default: new mongoose.Types.ObjectId(),
  },
  name: { type: String, required: true },
  password_hash: { type: String, required: true },
  role: { type: String, required: false },
});

const User = mongoose.models.user || mongoose.model("user", UserScema, "users");
export default User;
