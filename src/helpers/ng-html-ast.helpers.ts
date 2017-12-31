import * as ngc from '@angular/compiler';

export function containsMatchingElement(templateAst: ngc.ParseTreeResult, predicate: (element: ngc.Element) => boolean) {
  let matchingElementFound = false;

  let currentNodes = templateAst.rootNodes;

  while (!matchingElementFound && currentNodes && currentNodes.length > 0) {
    const childNodes: ngc.Node[] = [];

    for (let i = 0, length = currentNodes.length; !matchingElementFound && i < length; ++i) {
      const node = currentNodes[i];

      if (node instanceof ngc.Element) {
        matchingElementFound = predicate(node);
        childNodes.push(...node.children);
      }
    }

    currentNodes = childNodes;
  }

  return matchingElementFound;
}
