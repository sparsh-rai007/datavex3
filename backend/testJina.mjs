import fs from "fs";

async function run() {
  const response2 = await fetch("https://r.jina.ai/https://en.wikipedia.org/wiki/Cat");
  const text2 = await response2.text();
  console.log(text2.substring(0, 1000));
  const lines = text2.split("\n");
  const imgLines = lines.filter(l => l.includes("!["));
  console.log("Images:", imgLines.slice(0, 5));
}

run();
