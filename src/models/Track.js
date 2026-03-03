import mongoose from "mongoose";

const trackSchema = new mongoose.Schema({
    track_id: { type: String, required: true, unique: true },
    track_name: String,
    artists: [String],
    album_name: String,
    track_genre: String,
    duration_ms: Number,
    popularity: Number,
    key: Number,
    explicit: Boolean,
    tempo: Number,
    danceability: Number,
    energy: Number,
    acousticness: Number,
    instrumentalness: Number
});

export default mongoose.model("Track", trackSchema);