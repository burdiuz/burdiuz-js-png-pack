import {
  findTemplateParts,
  interpolateTemplate,
  loadStyles,
  loadTemplate,
} from "./utils.js";

/**
 *
 * @param {HTMLElement} target
 * @param {string} contentStr
 * @param {Object} [props]
 * @returns {HTMLElement}
 */
export const removeContentOf = (target) => {
  while (target.firstElementChild) {
    target.removeChild(target.firstElementChild);
  }

  return target;
};

/**
 *
 * @param {HTMLElement} target
 * @param {string} contentStr
 * @param {Object} [props]
 * @returns {DocumentFragment}
 */
export const setContentTo = (target, contentStr, props) => {
  removeContentOf(target);
  return appendContentTo(target, contentStr, props);
};

/**
 *
 * @param {HTMLElement} target
 * @param {string} contentStr
 * @param {Object} [props]
 * @returns {DocumentFragment}
 */
export const prependContentTo = (target, contentStr, props) => {
  const content = interpolateTemplate(contentStr)(props);

  target.prepend(content);

  return content;
};

/**
 *
 * @param {HTMLElement} target
 * @param {string} contentStr
 * @param {Object} [props]
 * @returns {DocumentFragment}
 */
export const appendContentTo = (target, contentStr, props) => {
  const content = interpolateTemplate(contentStr)(props);

  target.appendChild(content);

  return content;
};

const ShadowRootSymbol = Symbol("Template.shadow-root");

export class Template extends HTMLElement {
  constructor(templateString = "", shadowMode = "open", rootStyles = null) {
    super();
    this.content = {};

    if (rootStyles) {
      Object.assign(this.style, {
        display: "block",
        ...rootStyles,
      });
    }

    if (shadowMode) {
      this[ShadowRootSymbol] = this.attachShadow({ mode: shadowMode });
    }

    if (templateString) {
      this.setContent(templateString);
      this.linkContent();
    }
  }

  get root() {
    return this[ShadowRootSymbol] || this;
  }

  linkContent() {
    this.content = {};
    Object.assign(this.content, findTemplateParts(this.root));
  }

  removeContent() {
    return removeContentOf(this.root);
  }

  setContent(contentStr, props) {
    return setContentTo(this.root, contentStr, props);
  }

  /**
   *
   * @param {string} contentStr
   * @param {Object} [props]
   * @returns {DocumentFragment}
   */
  prependContent(contentStr, props) {
    return prependContentTo(this.root, contentStr, props);
  }

  /**
   *
   * @param {string} contentStr
   * @param {Object} [props]
   * @returns {DocumentFragment}
   */
  appendContent(contentStr, props) {
    return appendContentTo(this.root, contentStr, props);
  }

  async loadContent(url, props, prepare) {
    // Create a placeholder node that will be replaced with loaded content
    // needed to preserve order of appending children
    const placeholder = document.createElement("span");
    placeholder.style.visibility = "hidden";
    placeholder.dataset.type = "placeholder";
    placeholder.dataset.placeholderUrl = url;
    this.root.appendChild(placeholder);

    const interpolateFn = await loadTemplate(url);
    const element = interpolateFn(props, prepare);

    if (placeholder.parentNode) {
      placeholder.replaceWith(element);
    }

    return element;
  }

  async loadStyle(url) {
    const element = await loadStyles(url);

    this.root.appendChild(element);

    return element;
  }
}
