import { generateFromUrl } from "./src/services/blogGenerator";
import axios from "axios";

async function run() {
  const url = "https://nextjs.org/docs/app/building-your-application/routing/middleware";
  const r = await axios.get(`https://r.jina.ai/${url}`, {
    headers: {
      Accept: "text/markdown",
      "X-Return-Format": "markdown"
    }
  });
  const text = r.data;
  console.log("JINA OUTPUT HAS IMAGES?", text.includes("!["));
  console.log("Jina image lines:", text.split("\n").filter(l => l.includes("![")).join("\n"));
}

run().catch(console.error);
