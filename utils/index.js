exports.parseDate = date => {
  let parseDate = `${new Date(date).toLocaleDateString()} ${new Date(date).toLocaleTimeString()}`;
  return parseDate;
}
