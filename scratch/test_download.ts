import fs from "fs";

async function testDownload() {
  const url = "http://localhost:3000/downloads/DroidForge-Companion-v6.0.0-Master.apk";
  console.log("Fetching:", url);
  const res = await fetch(url);
  console.log("HTTP Status:", res.status);
  console.log("Content-Type:", res.headers.get("content-type"));
  console.log("Content-Disposition:", res.headers.get("content-disposition"));
  const buffer = await res.arrayBuffer();
  console.log("Downloaded Bytes:", buffer.byteLength);
}

testDownload().catch(console.error);
