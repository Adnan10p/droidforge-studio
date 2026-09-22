import http from "http";

http.get("http://localhost:3000/DroidForge-Companion-v5.0.0-Master.apk", (res) => {
  console.log("Status Code:", res.statusCode);
  console.log("Content-Type:", res.headers["content-type"]);
  console.log("Content-Disposition:", res.headers["content-disposition"]);
  console.log("Content-Length:", res.headers["content-length"]);
});
