export const mapFilterUndefined = <
  ItemType extends any,
  ReturnItemType extends any
>(
  items: ItemType[],
  mapper: (item: ItemType) => ReturnItemType | undefined,
): ReturnItemType[] =>
  items.reduce<ReturnItemType[]>((acc, next) => {
    const result = mapper(next);
    if (!result) return acc;
    return [...acc, result];
  }, []);
