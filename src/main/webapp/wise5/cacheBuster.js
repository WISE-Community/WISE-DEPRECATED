var systemLocate = System.locate;
System.cacheBust = "?v=5.7.8";
System.locate = function (load) {
  var System = this; // its good to ensure exact instance-binding
  return Promise.resolve(systemLocate.call(this, load)).then(function (address) {
    if (address.endsWith('.html.js')) {
      address = address.slice(0, -3);
    }
    return address + System.cacheBust;
  });
}
