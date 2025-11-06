import xss from 'xss';

function filterObject(obj, ...allowedFields) {
  const filteredObj = {};
  Object.keys(obj).forEach(el => {
    if (allowedFields.includes(el)) filteredObj[el] = xss(obj[el]);
  });
  return filteredObj;
}

export default filterObject;
