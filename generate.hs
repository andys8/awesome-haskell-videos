#!/usr/bin/env stack
{- stack script
 --resolver lts-16.0
 --install-ghc
 --package "bytestring http-conduit"
 --ghc-options=-Wall
-}

{-# LANGUAGE OverloadedStrings #-}

import qualified Data.ByteString.Lazy.Char8    as L8
import           Network.HTTP.Simple
import           System.Environment             ( getArgs )
import           Data.Maybe

main :: IO ()
main = do
  key <- fromMaybe "" . listToMaybe <$> getArgs
  putStrLn $ "Key: " <> key
  response <- httpLBS "http://httpbin.org/get"
  putStrLn $ "The status code was: " ++ show (getResponseStatusCode response)
  print $ getResponseHeader "Content-Type" response
  L8.putStrLn $ getResponseBody response
