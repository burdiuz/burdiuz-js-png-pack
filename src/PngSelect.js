import { ByteArray, PNGUtil, PNGFile } from "./bin.js";
import { Template } from "./Template.js";

export const IMAGE_SELECT_EVENT_TYPE = "ImageSelected";

const getDataTransferFile = ({ files, items }, mimeType) => {
  let selectedImage;

  if (items && items.length) {
    const item = Array.from(items).find((item) => {
      if (item.kind !== "file") {
        return false;
      }

      const file = item.getAsFile();
      return file.type === mimeType;
    });

    selectedImage = item && item.getAsFile();
  }

  if (!selectedImage && files && files.length) {
    selectedImage = Array.from(items).find((file) => file.type === mimeType);
  }

  return selectedImage;
};

export class PngSelect extends Template {
  constructor() {
    super();

    this.initializeContent();

    this.addEventListener("dragenter", () => {
      this.content.dropArea.style.visibility = "visible";
    });

    this.addEventListener("dragleave", () => {
      this.content.dropArea.style.visibility = "hidden";
    });

    this.addEventListener("dragover", (event) => {
      event.preventDefault();
    });

    this.addEventListener("drop", (event) => {
      event.preventDefault();
      this.content.dropArea.style.visibility = "hidden";

      const selectedImage = getDataTransferFile(
        event.dataTransfer,
        "image/png"
      );

      console.log(selectedImage);

      if (!selectedImage) {
        // Display error text message somewhere near input.
        return;
      }

      this.dispatchEvent(
        new CustomEvent(IMAGE_SELECT_EVENT_TYPE, { detail: selectedImage })
      );
    });
  }

  async initializeContent() {
    await this.loadContent("./src/PngSelect.template.html");
    this.linkContent();

    console.log(this.content);

    this.content.select.addEventListener("change", async (event) => {
      const [file] = event.target.files;

      console.log(event, file);

      this.dispatchEvent(
        new CustomEvent(IMAGE_SELECT_EVENT_TYPE, { detail: file })
      );

      return;

      /**
       * This should be done in content section, here we just select PNg file
       * And in its container we will display image information with preview
       * and a link to download
       */
      const buffer = await PNGUtil.readFile(file);

      const bytes = new ByteArray(new Uint8Array(buffer));

      const data = PNGFile.read(bytes);

      console.log(data);
    });
  }
}

customElements.define("png-select", PngSelect);
