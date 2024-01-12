function copyToClipboard(text, targetId, successMessage, afterText) {
  var input = document.createElement('input');
  input.setAttribute('value', text);
  document.body.appendChild(input);
  input.select();
  document.execCommand('copy');
  document.body.removeChild(input);

  var target = document.getElementById(targetId);
  target.innerHTML = successMessage;

  setTimeout(function() {
    target.innerHTML = afterText;
  }, 1000);
}