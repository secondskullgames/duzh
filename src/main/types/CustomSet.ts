type Serializer<T> = {
  serialize: (t: T) => string;
  deserialize: (s: string) => T;
};

const JsonSerializer: Serializer<any> = {
  serialize: JSON.stringify,
  deserialize: JSON.parse
};

type Props<T> = Readonly<{
  serializer: Serializer<T>
}>;

export class CustomSet<T> {
  private readonly serializer: Serializer<T>;
  private readonly set: Set<string>;

  constructor(props?: Props<T>) {
    this.serializer = props?.serializer ?? JsonSerializer;
    this.set = new Set();
  }

  add = (t: T) => {
    const serialized = this.serializer.serialize(t);
    this.set.add(serialized);
  };

  includes = (t: T): boolean => this.set.has(this.serializer.serialize(t));

  delete = (t: T) => {
    const serialized = this.serializer.serialize(t);
    this.set.delete(serialized);
  };

  values = (): T[] => [...this.set.values()].map(this.serializer.deserialize);
}
