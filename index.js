import { ByteArray, PNGUtil, PNGFile } from "./bin.js";
import  "./src/PageLayout.js";

/* https://github.com/Microsoft/TypeScript/wiki/Using-the-Compiler-API
import ts from "./ts-stream/4.7.3/typescript.module.js";
console.log(ts.transpileModule);
console.log(document.querySelectorAll('script[type="application/typescript"]'));
*/

class PngSelect extends HTMLElement {
  constructor() {
    super();
    
    this.initializeContent();

    this.addEventListener("dragenter", () => {
      this.style.borderColor = "#000";
    });

    this.addEventListener("dragleave", () => {
      delete this.style.borderColor;
    });

    this.addEventListener("dragover", (event) => {
      event.preventDefault();
    });

    this.addEventListener("drop", (event) => {
      event.preventDefault();
      console.log(event.dataTransfer.types);
      console.log(event.dataTransfer.files[0]);
      console.log(event.dataTransfer.items[0].kind);
      console.log(event.dataTransfer.items[0].getAsFile());
      /**
lastModified: 1653212411652
lastModifiedDate: Sun May 22 2022 12:40:11 GMT+0300 (Eastern European Summer Time) {}
name: "preview.png"
size: 51873
type: "image/png"
webkitRelativePath: ""
       */
    });
  }

  initializeContent() {
    this.innerHTML = `
<input id="image_select" type="file" />
`;

    const imageSelect = document.getElementById("image_select");

    imageSelect.addEventListener("change", async (event) => {
      const [file] = event.target.files;

      console.log(event, file);

      const buffer = await PNGUtil.readFile(file);

      const bytes = new ByteArray(new Uint8Array(buffer));

      const data = PNGFile.read(bytes);

      console.log(data);
    });
  }
}

class PngContent extends HTMLElement {
  constructor() {
    super();
  }
}

customElements.define("png-select", PngSelect);

customElements.define("png-content", PngContent);
