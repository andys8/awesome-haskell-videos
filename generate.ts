const youtubeKey = Deno.args[0];
const youtubeDataFile = "data/youtube.txt";
const youtubeApi = "https://www.googleapis.com/youtube/v3/videos";
const youtubeParts = ["snippet", "contentDetails", "statistics"];

if (!youtubeKey) {
  throw Error("YouTube API key has to be passed as argument");
}

const readYouTubeIds = (): string[] =>
  Deno.readTextFileSync(youtubeDataFile).split("\n");

const requestVideoData = async (videoIds: string[] = []) => {
  const idsStr = videoIds.join(",");
  const partsStr = youtubeParts.join(",");
  const url_ = encodeURI(
    `${youtubeApi}?part=${partsStr}&id=${idsStr}&key=${youtubeKey}`
  );
  const res = await fetch(url_);
  return await res.json();
};

type YoutubeResponse = {
  items: Array<YoutubeVideo>;
};

type YoutubeVideo = {
  id: string;
  snippet: {
    title: string;
    publishedAt: string;
    thumbnails: { medium: { url: string } };
  };
};

type Video = {
  id: string;
  title: string;
  publishedAt: string;
  thumbnailUrl: string;
  linkUrl: string;
};

const sortVideos = (videos: Video[] = []) =>
  videos.sort((a, b) => +new Date(b.publishedAt) - +new Date(a.publishedAt));

const comparePublished = (a: Video, b: Video) =>
  +new Date(b.publishedAt) - +new Date(a.publishedAt);

const youtubeLinkUrl = (id: string) => `https://youtu.be/${id}`;

const toVideoData = (resp: YoutubeResponse): Video[] => {
  const toVideo = ({ id, snippet }: YoutubeVideo) => ({
    id,
    title: snippet.title,
    publishedAt: snippet.publishedAt,
    thumbnailUrl: snippet.thumbnails.medium.url,
    linkUrl: youtubeLinkUrl(id),
  });
  const { items = [] } = resp;
  return items.map(toVideo).sort(comparePublished);
};

const renderMarkdown = (videos: Video[] = []) =>
  videos.map(({ title, linkUrl }) => `- [${title}](${linkUrl})`).join("\n");

const response = await requestVideoData(readYouTubeIds());
console.log(renderMarkdown(toVideoData(response)));
