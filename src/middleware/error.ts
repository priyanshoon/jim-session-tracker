export const errorHandler = (statusCode: number, message: string) => {
  const error = new Error();
  error.message = message;
  return error;
};
