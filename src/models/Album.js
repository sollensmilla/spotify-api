import mongoose from "mongoose";

const albumSchema = new mongoose.Schema({
    album_id: { type: String, required: true, unique: true },
    album_name: String,
    artists: [String],
    total_tracks: Number
});

export default mongoose.model("Album", albumSchema);