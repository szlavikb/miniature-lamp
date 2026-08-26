/**
 * A Datacap mezőérték-XML-ben nincs sima szöveges érték node: minden
 * karaktert egy külön <C>NN</C> elem tárol, ahol NN a karakter decimális
 * kódja (pl. <C>68</C><C>79</C>... -> "DO..."). Ez a függvény állítja
 * vissza belőle az eredeti szöveget.
 */
export function decodeCharCodes(parent: Element | null): string {
  if (!parent) {
    return '';
  }
  const charNodes = Array.from(parent.children).filter((el) => el.tagName === 'C');
  return charNodes
    .map((el) => {
      const code = Number(el.textContent?.trim());
      return Number.isFinite(code) ? String.fromCharCode(code) : '';
    })
    .join('');
}
