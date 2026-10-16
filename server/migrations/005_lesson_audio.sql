-- Audio narration: an optional audio file per lesson, read aloud for learners
-- with low reading confidence. Stored as a URL (Cloudinary or object storage),
-- cached offline by the service worker like other media.
alter table lessons add column audio_url text;
