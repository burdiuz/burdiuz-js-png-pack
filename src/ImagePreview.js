import { Template } from "./Template.js";

export class ImagePreview extends Template {
  constructor() {
    super();
    this.loadContent("./src/ImagePreview.template.html");
  }
}

customElements.define("image-preview", ImagePreview);
