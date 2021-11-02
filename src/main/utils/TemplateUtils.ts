/**
 * Dynamically populate a template according to {@param template}. which specifies the template string,
 * and {@param variables}, which provides key-value substitutions for each variable in {@param template}.
 */
const fillTemplate = (template: string, variables: Record<string, any>) => {
  const keys = Object.keys(variables);
  const values = Object.values(variables);
  return new Function(...keys,  `return \`${template}\`;`)(...values);
};

export { fillTemplate };
