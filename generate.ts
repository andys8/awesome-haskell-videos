const youtubeKey = Deno.args[0];
const youtubeDataFile = "data/youtube.txt";
const youtubeApi = "https://www.googleapis.com/youtube/v3/videos";
const youtubeParts = ["snippet", "contentDetails", "statistics"];

const markdownPlaceholder = "%%%video-placeholder%%%";
const markdownOutputTemplate = "README.template.md";
const markdownOutputFile = "README.md";

const htmlPlaceholder = "<!-- %%%video-placeholder%%% -->";
const htmlOutputTemplate = "website.template.html";
const htmlOutputFile = "docs/index.html";

if (!youtubeKey) {
  throw Error("YouTube API key has to be passed as argument");
}

const readYouTubeIds = (): Promise<string[]> =>
  Deno.readTextFile(youtubeDataFile).then((x) => x.split("\n"));

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
    description: string;
    publishedAt: string;
    thumbnails: { medium: { url: string } };
  };
  statistics: {
    viewCount: string;
    likeCount: string;
  };
};

type Video = {
  id: string;
  title: string;
  description: string;
  publishedAt: string;
  thumbnailUrl: string;
  linkUrl: string;
  views: number;
  likes: number;
};

const sortVideos = (videos: Video[] = []) =>
  videos.sort((a, b) => +new Date(b.publishedAt) - +new Date(a.publishedAt));

const comparePublished = (a: Video, b: Video) =>
  +new Date(b.publishedAt) - +new Date(a.publishedAt);

const youtubeLinkUrl = (id: string) => `https://youtu.be/${id}`;

const toVideoData = (resp: YoutubeResponse): Video[] => {
  const toVideo = ({ id, snippet, statistics }: YoutubeVideo) => ({
    id,
    title: snippet.title,
    description: snippet.description,
    publishedAt: snippet.publishedAt,
    thumbnailUrl: snippet.thumbnails.medium.url,
    linkUrl: youtubeLinkUrl(id),
    views: parseInt(statistics.viewCount, 10),
    likes: parseInt(statistics.likeCount, 10),
  });
  const { items = [] } = resp;
  return items.map(toVideo).sort(comparePublished);
};

const renderMarkdown = (videos: Video[] = []) =>
  videos.map(({ title, linkUrl }) => `- [${title}](${linkUrl})`).join("\n");

const writeReadme = async (content: string) => {
  const template = await Deno.readTextFile(markdownOutputTemplate);
  const output = template.replace(markdownPlaceholder, content);
  await Deno.writeTextFile(markdownOutputFile, output);
};

const cutText = (max: number, text: string = "") =>
  text.length <= max ? text : text.substring(0, max - 3) + "...";

const renderHtml = (videos: Video[] = []) => {
  type HL = "1" | "2" | "3" | "4";
  const headline = (i: HL, text: string) => `<h${i}>${text}</h${i}>`;
  const link = (url: string, text: string) => `<a href="${url}" target="_blank">${text}</a>`;
  const img = (src: string) => `<img class="float-left thumb" src="${src}"/>`;
  const div = (cl: string, text: string) => `<div class="${cl}">${text}</div>`;
  const p = (text: string) => `<p>${text}</p>`;
  const stats = (year: number, views: number, likes: number) =>
    `<small>${year} - ${views} views - ${likes} likes</small>`;

  return videos
    .map(
      ({
        title,
        linkUrl,
        thumbnailUrl,
        description,
        views,
        likes,
        publishedAt,
      }) =>
        div(
          "video",
          [
            headline("3", link(linkUrl, title)),
            div(
              "clearfix",
              [
                link(linkUrl, img(thumbnailUrl)),
                stats(new Date(publishedAt).getFullYear(), views, likes),
                p(cutText(500, description)),
              ].join("\n")
            ),
          ].join("\n")
        )
    )
    .join("\n");
};

const writeWebsite = async (content: string) => {
  const template = await Deno.readTextFile(htmlOutputTemplate);
  const output = template.replace(htmlPlaceholder, content);
  await Deno.writeTextFile(htmlOutputFile, output);
};

const response = await requestVideoData(await readYouTubeIds());
const videos = toVideoData(response);
writeReadme(renderMarkdown(videos));
writeWebsite(renderHtml(videos));
