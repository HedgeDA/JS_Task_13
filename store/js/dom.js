'use strict';

function createElement(content) {
  if (typeof content === 'string') {
    return document.createTextNode(content);
  }

  let element = document.createElement(content.name);

  for (let property in content.props) {
    element.setAttribute(property, content.props[property]);
  }

  content.childs.forEach(child => element.appendChild(createElement(child)));

  return element;
}

