// import JavaScript
function wimport(base, files) {
  files.forEach(function (file) {
    var script = document.createElement("script");
    script.src = base + file;
    document.head.appendChild(script);
  });
}

// import CSS
function wimpcss(base, files) {
  files.forEach(function (file) {
    var link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = base + file;
    document.head.appendChild(link);
  });
}

/* Example:

wimport("https://example.org/path/", [
"to/111.js",
"other/222.js",
"333.js"
]);

*/