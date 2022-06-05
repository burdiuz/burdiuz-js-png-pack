import { Template } from "./Template.js";

export class ImageInfo extends Template {
  constructor() {
    super();
    this.loadContent("./src/ImageInfo.template.html");
  }
}

customElements.define("image-info", ImageInfo);
