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
    this.appendContent("<h1>Content Start</h1>");
    this.loadContent("./src/PageLayout.template.html");
    this.loadContent("./src/PageLayout.template2.html");
    this.loadContent("./src/PageLayout.template3.html");
    this.appendContent("<h1>In the middle</h1>");
    this.loadContent("./src/PageLayout.template4.html");
    this.loadContent("./src/PageLayout.template5.html");
    this.appendContent("<h1>Content End</h1>");

    console.log(this.children, this.content, this.root);
  }
}

customElements.define("page-layout", PageLayout);
