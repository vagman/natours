const catchAsync = funct => {
  return (request, response, next) => {
    funct(request, response, next).catch(next);
  };
};

export default catchAsync;
