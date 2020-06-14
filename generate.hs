#!/usr/bin/env stack
{- stack script
 --resolver lts-16.0
 --install-ghc
 --package "bytestring http-conduit"
 --ghc-options=-Wall
-}

{-# LANGUAGE OverloadedStrings #-}
{-# LANGUAGE DuplicateRecordFields #-}

import qualified Data.ByteString.Lazy.Char8    as L8
import           Network.HTTP.Simple
import           System.Environment             ( getArgs )
import           Data.Maybe

newtype YtResponse = YtResponse { items :: [YtVideo] }

data YtVideo = YtVideo
  { id :: String
  , snippet :: YtVideoSnippet
  , statistics :: YtVideoStatistics
  }

data YtVideoSnippet = YtVideoSnippet
  { title :: String
  , description :: String
  , publishedAt :: String
  , thumbnails :: YtVideoThumbnail
  }

newtype YtVideoThumbnail = YtVideoThumbnail { medium :: YtVideoThumbnailChild }
newtype YtVideoThumbnailChild = YtVideoThumbnailChild  { url :: String }

data YtVideoStatistics = YtVideoStatistics
  { viewCount :: String
  , likeCount :: String
  }

data Video = Video
  { id :: String
  , title :: String
  , description :: String
  , publishedAt :: String
  , thumbnailUrl :: String
  , linkUrl :: String
  , views :: Integer
  , likes :: Integer
  }

youtubeDataFile :: String
youtubeDataFile = "data/youtube.txt"

youtubeApi :: String
youtubeApi = "https://www.googleapis.com/youtube/v3/videos"
youtubeParts :: [String]
youtubeParts = ["snippet", "contentDetails", "statistics"]

markdownPlaceholder :: String
markdownPlaceholder = "%%%video-placeholder%%%"
markdownOutputTemplate :: String
markdownOutputTemplate = "README.template.md"
markdownOutputFile :: String
markdownOutputFile = "README.md"

htmlPlaceholder :: String
htmlPlaceholder = "<!-- %%%video-placeholder%%% -->"
htmlOutputTemplate :: String
htmlOutputTemplate = "website.template.html"
htmlOutputFile :: String
htmlOutputFile = "docs/index.html"

main :: IO ()
main = do
  key <- fromMaybe "" . listToMaybe <$> getArgs
  putStrLn $ "Key: " <> key
  response <- httpLBS "http://httpbin.org/get"
  putStrLn $ "The status code was: " ++ show (getResponseStatusCode response)
  print $ getResponseHeader "Content-Type" response
  L8.putStrLn $ getResponseBody response
