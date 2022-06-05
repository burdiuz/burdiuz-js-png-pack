const ID_ATTR_NAME = "data-part";

/**
 *
 *
 * @param {DocumentFragment} root
 * @param {string} [attrName]
 * @returns { {[key:string]: HTMLElement | HTMLElement[]} }
 */
export const findTemplateParts = (root, attrName = ID_ATTR_NAME) => {
  const parts = {};

  /**
   * @type {NodeList};
   */
  const list = root.querySelectorAll(`*[${ID_ATTR_NAME}]`);

  list.forEach(
    /**
     * @param {HTMLElement} node
     */
    (node) => {
      const name = node.getAttribute(attrName);
      const { [name]: currentValue } = parts;

      if (!currentValue) {
        parts[name] = node;
        return;
      }

      if (currentValue instanceof Array) {
        currentValue.push(node);
        return;
      }

      parts[name] = [currentValue, node];
    }
  );

  return parts;
};

export const createTemplate =
  (templateString, preprocess = (contentEl) => contentEl) =>
  () => {
    /**
     * @type HTMLTemplateElement
     */
    const template = document.createElement("template");
    template.innerHTML = templateString;

    /**
     * @type {DocumentFragment}
     */
    const content = template.content.cloneNode(true);

    return preprocess(content);
  };

export const interpolateTemplate =
  (templateString) =>
  (props = {}, preprocess = (contentEl) => contentEl) => {
    let contentString = templateString;

    Object.keys(props).forEach((name) => {
      let { [name]: value } = props;

      if (typeof value === "function") {
        value = value(props);
      }

      contentString = contentString.replace(`{$${name}}`, value);
    });

    return createTemplate(contentString, preprocess)();
  };

export const loadTemplate = (url) =>
  fetch(url)
    .then((response) => response.text())
    .then(interpolateTemplate);

export const loadStyles = (url) =>
  fetch(url)
    .then((response) => response.text())
    .then((cssText) => {
      const style = document.createElement("style");
      style.textContent = cssText;

      return style;
    });
