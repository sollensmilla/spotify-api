import mongoose from "mongoose";

const artistSchema = new mongoose.Schema({
    artist_id: { type: String, required: true, unique: true },
    artist_name: String,
    genres: [String],
    total_tracks: Number,
    average_popularity: Number
});

export default mongoose.model("Artist", artistSchema);