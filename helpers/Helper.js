export const devPrint = (message, ...rest) => {
  if (process.env.NODE_ENV === "development") {
    console.log(message, ...rest);
  }
};

export const getEnvironmentVariable = (variableName) => {
  const value = process.env[variableName];
  if (value === undefined || value === null) {
    throw new Error(
      "UNDEFINED_ENV",
      `${variableName} is not defined in the environment `
    );
  }
  return value;
};

export const getRoute = (productionRouteEnvVariableName, developmentRoute) => {
  return process.env.NODE_ENV === "production"
    ? getEnvironmentVariable(productionRouteEnvVariableName)
    : developmentRoute;
};
