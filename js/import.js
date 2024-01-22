function wimport(base, files) {
  files.forEach(function (file) {
    var script = document.createElement("script");
    script.src = base + file;
    document.head.appendChild(script);
  });
}

/* Example:

wimport("https://example.org/path/", [
"to/111.js",
"other/222.js",
"333.js"
]);

*/