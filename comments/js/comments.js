'use strict';

function showComments(list) {
  const commentsContainer = document.querySelector('.comments');
  const commentsNodes = list.map(createCommentNode);
  const fragment = commentsNodes
    .reduce((fragment, currentValue) => {
      fragment.appendChild(currentValue);
      return fragment;
    }, document.createDocumentFragment());
  commentsContainer.appendChild(fragment);
}

function node(tagName, attributes = {}, textContent = '') {
  const newNode = document.createElement(tagName);

  for (let attribute in attributes) {
    newNode[attribute] = attributes[attribute];
  }

  if (typeof textContent === 'string') {
    if (/\n/.test(textContent)) {
      textContent.split('\n').forEach(text => {
        if (!text) {
          newNode.appendChild(node('br'));
        } else {
          newNode.appendChild(node('p', {}, text));
        }
      })
    } else {
      newNode.textContent = textContent;
    }
  } else if (textContent instanceof Array) {
    textContent.forEach(childNode =>
      newNode.appendChild(childNode)
    );
  }

  return newNode
}

function createCommentNode(comment) {
  return node('div', {'className': 'comment-wrap'}, [
    node('div', {'className': 'photo', 'title': comment.author.name}, [
      node('div', {'className': 'avatar', 'style': `background-image: url('${comment.author.pic}')`})
    ]),
    node('div', {'className': 'comment-block'}, [
      node('p', {'className': 'comment-text'}, comment.text),
      node('div', {'className': 'bottom-comment'}, [
        node('div', {'className': 'comment-date'}, new Date(comment.date).toLocaleString('ru-Ru')),
        node('ul', {'className': 'comment-actions'}, [
          node('li', {'className': 'complain'}, 'Пожаловаться'),
          node('li', {'className': 'reply'}, 'Ответить')
        ])
      ])
    ])
  ]);
}

fetch('https://neto-api.herokuapp.com/comments')
  .then(res => res.json())
  .then(showComments);
