

// chrome.storage.local.set({
//   'myKarma': myKarma
// }, function() {
//   // Notify that we saved.
//   console.log('Settings saved myKarma', myKarma);
// });

var parameters = [];

chrome.storage.sync.get('parameters', function(result) {
  console.log("get parameters", result);
  if (result.parameters) {
    parameters = result.parameters;
    $.each(parameters, function(index, param) {
      $('#'+param).prop('checked', true);
    });
  }
});

console.log(parameters);

function Setchange(target) {

    paramsSelect = {
        currentWindow: true,
        active: true
    };

    console.log(target);

    chrome.tabs.query(paramsSelect, function(tabs) {
        for (var i = 0; i < tabs.length; i++) {
            chrome.tabs.sendMessage(tabs[i].id, {
                "toggle": target
            });
        }
    });
}

document.addEventListener("DOMContentLoaded", function() {

  document.getElementById("vote").onclick = function(target) {
      Setchange("vote");
      setParameters("vote");
  };
  document.getElementById("whisper").onclick = function(target) {
      Setchange("whisper");
      setParameters("whisper");
  };
  document.getElementById("report").onclick = function(target) {
      Setchange("report");
      setParameters("report");
  };
});

function setParameters(action) {

  if(parameters.indexOf(action) >= 0) {
    parameters.splice(parameters.indexOf(action), 1);
  } else {
    parameters.push(action)
  }

  chrome.storage.sync.set({
    'parameters': parameters
  }, function() {
    // Notify that we saved.
    console.log('Settings saved parameters', parameters);
  });
}
