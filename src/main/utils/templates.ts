let timeCounter = 0;
let countCounter = 0;

/**
 * Dynamically populate a template according to {@param template}. which specifies the template string,
 * and {@param variables}, which provides key-value substitutions for each variable in {@param template}.
 */
const fillTemplate = (template: string, variables: Record<string, any>): string => {
  const t1 = new Date().getTime();
  const keys = Object.keys(variables);
  const values = Object.values(variables);
  const func = new Function(...keys,  `return \`${template}\`;`)(...values);
  const t2 = new Date().getTime();
  countCounter++;
  timeCounter += t2 - t1;
  console.log(`filled template in ${t2 - t1} ms (${countCounter} ${timeCounter} ms)`);
  return func;
};

export { fillTemplate };
