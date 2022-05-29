import { ByteArray, PNGUtil, PNGFile } from "./bin.js";

const imageSelect = document.getElementById("image_select");

imageSelect.addEventListener("change", async (event) => {
  const [file] = event.target.files;

  console.log(event, file);

  const buffer = await PNGUtil.readFile(file);

  const bytes = new ByteArray(new Uint8Array(buffer));

  const data = PNGFile.read(bytes);

  console.log(data);
});
