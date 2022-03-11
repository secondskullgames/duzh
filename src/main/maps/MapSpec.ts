type Type = 'predefined' | 'generated';

namespace Type {
  export const values = () => ['generated', 'predefined'];
}

type MapSpec = {
  id: string,
  type: Type;
};

namespace MapSpec {
  export const parse = (json: any): MapSpec => {
    const toString = JSON.stringify(json);
    if ((typeof json !== 'object') || Array.isArray(json)) {
      throw new Error(`Provided MapSpec is not an object! ${toString}`);
    }

    if (!json.hasOwnProperty('id') || json?.id === undefined || json?.id === null) {
      throw new Error(`MapSpec is missing id: ${toString}`);
    }

    if (typeof json.id !== 'string') {
      throw new Error(`MapSpec.id must be a string: ${toString}`);
    }

    if (!json.hasOwnProperty('type') || json?.type === undefined || json?.type === null) {
      throw new Error(`MapSpec is missing type: ${toString}`);
    }

    if (!Type.values().includes(json.type)) {
      throw new Error(`Invalid MapSpec.type: ${toString}`);
    }

    return json as MapSpec;
  };
}

export default MapSpec;
