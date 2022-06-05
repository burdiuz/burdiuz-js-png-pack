import { Template } from "./Template.js";

export class PageLayout extends Template {
  constructor() {
    super();
    /*
    super(
      `
<style>

</style>
<div>
<div data-part="dropArea">Top PNG Image section</div>
<div data-part="contents">Image Content section</div>
</div>`,
      {},
      "closed"
    );
    */
    /*
    this.loadContent("./src/PageLayout.template.html").then(() => {
      this.linkContent();
      console.log(this.content);
    });
    */
    this.loadContent("./src/PageLayout.template.html");
  }
}

customElements.define("page-layout", PageLayout);
