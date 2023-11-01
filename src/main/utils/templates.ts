import memoize from './memoize';

type TemplateParams = Readonly<{
  template: string;
  variables: string[];
}>;

type TemplateFunc = (...args: unknown[]) => string;

const _memoize: (key: string) => TemplateFunc = memoize(stringified => {
  const { template, variables } = JSON.parse(stringified);
  return new Function(...variables, `return \`${template}\`;`) as TemplateFunc;
});

const _newFunction = ({ template, variables }: TemplateParams): TemplateFunc => {
  const stringified = JSON.stringify({ template, variables });
  return _memoize(stringified);
};

/**
 * Dynamically populate a template according to {@param template}. which specifies the template string,
 * and {@param variables}, which provides key-value substitutions for each variable in {@param template}.
 */
export const fillTemplate = (
  template: string,
  variables: Record<string, unknown>
): string => {
  const keys = Object.keys(variables);
  const values = Object.values(variables);
  const func = _newFunction({ template, variables: keys });
  return func(...values);
};
