import { Template } from "./Template.js";

export class ImageContent extends Template {
  constructor() {
    super();

    this.initializeContent();
  }

  async initializeContent() {
    const content = await this.loadContent('./src/ImageContent.template.html');
    console.log(content);
  }
}

customElements.define("image-content", ImageContent);
