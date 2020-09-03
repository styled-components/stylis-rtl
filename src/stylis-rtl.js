// @flow

import cssjanus from 'cssjanus';
import { COMMENT, compile, DECLARATION, IMPORT, KEYFRAMES, MEDIA, RULESET, serialize, strlen } from 'stylis';

function stringifyPreserveComments(element, index, children, callback) {
  switch (element.type) {
    case IMPORT:
    case DECLARATION:
    case COMMENT:
      return (element.return = element.return || element.value);
    case RULESET: {
      element.value = element.props.join(',');
      element.children.forEach((x) => {
        if (x.type === COMMENT) x.children = x.value;
      });
    }
  }

  return strlen((children = serialize(element.children, stringifyPreserveComments)))
    ? (element.return = element.value + '{' + children + '}')
    : '';
}

function stylisRTLPlugin(element: Object, index: number, children: Object[], callback: Function): ?string {
  if (element.type === KEYFRAMES || (element.type === RULESET && (!element.parent || element.parent.type === MEDIA))) {
    element.children = compile(
      cssjanus.transform(stringifyPreserveComments(element, index, children, callback))
    )[0].children;

    element.return = '';
  }
}

// stable identifier that will not be dropped by minification unless the whole module
// is unused
Object.defineProperty(stylisRTLPlugin, 'name', { value: 'stylisRTLPlugin' });

export default stylisRTLPlugin;
