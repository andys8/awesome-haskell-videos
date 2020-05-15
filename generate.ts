const youtubeKey = Deno.args[0];
const youtubeDataFile = "data/youtube.txt";
const youtubeApi = "https://www.googleapis.com/youtube/v3/videos";
const youtubeParts = ["snippet", "contentDetails", "statistics"];

if (!youtubeKey) {
  throw Error("YouTube API key has to be passed as argument");
}

const data = Deno.readTextFileSync(youtubeDataFile);
const videoIds = data.split("\n");

const partsStr = youtubeParts.join(",");
const idsStr = videoIds.join(",");
const url_ = encodeURI(
  `${youtubeApi}?part=${partsStr}&id=${idsStr}&key=${youtubeKey}`
);
const res = await fetch(url_);
const body = new Uint8Array(await res.arrayBuffer());
await Deno.stdout.write(body);
