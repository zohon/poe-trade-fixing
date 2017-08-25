console.log("chrome runtime id", chrome.runtime.id);

var parameters = [];
// chrome.storage.local.set({
//   'parameters': parameters
// }, function() {
//   // Notify that we saved.
//   console.log('Settings saved parameters', parameters);
// });

chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    // console.log(sender.tab ?
    //             "from a content script:" + sender.tab.url :
    //             "from the extension");
    if (!sender.tab && request.toggle) {

      if(parameters.indexOf(request.toggle) >= 0) {
        parameters.splice(parameters.indexOf(request.toggle), 1);
      } else {
        parameters.push(request.toggle);
      }

      activeParameters(parameters);
    }

});



function activeParameters(parameters) {
  console.log(parameters);
  if(parameters.indexOf('vote') >= 0 ) {
    $('.fixup').closest('li').removeClass('hidden');
    $('.fixdown').closest('li').removeClass('hidden');
  } else {
    $('.fixup').closest('li').addClass('hidden');
    $('.fixdown').closest('li').addClass('hidden');
  }

  if(parameters.indexOf('whisper') >= 0 ) {
    $('.whisper-count').closest('li').removeClass('hidden');
  } else {
    $('.whisper-count').closest('li').addClass('hidden');
  }

  if(parameters.indexOf('report') >= 0 ) {
    $('.report').removeClass('hidden');
  } else {
    $('.report').addClass('hidden');
  }

  // switch (parameters) {
  //   case "vote":
  //     if ($('.fixup').closest('li').hasClass('hidden')) {
  //       $('.fixup').closest('li').removeClass('hidden');
  //     } else {
  //       $('.fixup').closest('li').addClass('hidden');
  //     }
  //     if ($('.fixdown').closest('li').hasClass('hidden')) {
  //       $('.fixdown').closest('li').removeClass('hidden');
  //     } else {
  //       $('.fixdown').closest('li').addClass('hidden');
  //     }
  //     break;
  //   case "whisper":
  //     if ($('.whisper-count').closest('li').hasClass('hidden')) {
  //       $('.whisper-count').closest('li').removeClass('hidden');
  //     } else {
  //       $('.whisper-count').closest('li').addClass('hidden');
  //     }
  //     break;
  //   case "report":
  //     if ($('.report').hasClass('hidden')) {
  //       $('.report').removeClass('hidden');
  //     } else {
  //       $('.report').addClass('hidden');
  //     }
  //     break;
  // }
}

var parameters = [];

chrome.storage.sync.get('parameters', function(result) {
  if (result.parameters) {
    parameters = result.parameters;
    activeParameters(parameters);
  }
});

// Initialize Firebase

// DEV
// var config = {
//   apiKey: "AIzaSyD9z6wR2rOlHl-qmdp7Ec302lwsE4hhJSA",
//   authDomain: "poe-fixing-dev.firebaseapp.com",
//   databaseURL: "https://poe-fixing-dev.firebaseio.com",
//   projectId: "poe-fixing-dev",
//   storageBucket: "poe-fixing-dev.appspot.com",
//   messagingSenderId: "628753270892"
// };
//

// PROD
var config = {
  apiKey: "AIzaSyAk3-WQr75K4qmu8oy70KrNkmm0TsmUQ1Y",
  authDomain: "poe-fixing.firebaseapp.com",
  databaseURL: "https://poe-fixing.firebaseio.com",
  projectId: "poe-fixing",
  storageBucket: "poe-fixing.appspot.com",
  messagingSenderId: "150775083928"
};
firebase.initializeApp(config);


function InitializeAll() {
  $('.item').each(function(index, element) {
    //console.log($(element).attr("data-seller"));
    if ($(element).hasClass('antifixing')) {
      return;
    }
    $(element).addClass('antifixing');


    var select = document.createElement('select');
    $('select').addClass('report');
    var option = document.createElement('option');
    $(option).attr('value', null);
    $(option).html("Report account");
    $(select).append(option);
    $.each(["Price fixing", "AFK"], function(index, data) {
      var option = document.createElement('option');
      $(option).attr('value', data);
      $(option).html(data);
      $(select).append(option);
    })
    $(element).find('.third-cell').html(select);
    $(element).find('.icon-td').append('<div class="standing"><div class="up"></div><div class="down"></div></div>');
    $(element).find('.bottom-row .proplist').append("<li class='whisper-count'>0</li><li class='fixingui'><div class='fixup'><span class='count'>0</span></div></li><li class='fixingui'><div class='fixdown'><span class='count'>0</span></div></li>");
  });


  $('.report').change(function(e) {

    if (e.originalEvent === undefined) {
      return;
    }

    //Some code
    if ("isTrusted" in e) {
      if (!event.isTrusted) {
        return;
      }
    }

    var reportInfo = $(this).val();

    if (reportInfo == "Report account") {
      return
    }

    var ign = $(e.target).closest('.item').attr('data-seller');

    // Write the new post's data simultaneously in the posts list and the user's post list.
    var updates = {};

    if (alreadyReported[ign]) {

      if (alreadyReported[ign][reportInfo]) {
        showInfo('You have already voted reported&nbsp;<b>' + ign + '</b>&nbsp;for&nbsp;<b>' + reportInfo + '</b>');
        return;
      } else {
        $.each(alreadyReported[ign], function(index, data) {
          var count = (listIgn[ign] && listIgn[ign]['report'] && listIgn[ign]['report'][index] ? listIgn[ign]['report'][index] - 1 : 0);
          updates[index] = count;
        });
      }

    }
    var count = (listIgn[ign] && listIgn[ign]['report'] && listIgn[ign]['report'][reportInfo] ? listIgn[ign]['report'][reportInfo] + 1 : 1);
    updates[reportInfo] = count;
    saveLocalReport(ign, updates);
    firebase.database().ref("IGN/" + ign + "/report").update(updates);
  });

  $('.fixup').click(function(e) {

    if (e.originalEvent === undefined) {
      return;
    }

    //Some code
    if ("isTrusted" in e) {
      if (!event.isTrusted) {
        return;
      }
    }

    if (!$(e.target).closest('.item').hasClass('voted')) {
      $(e.target).closest('.item').addClass('voted');
      var ign = $(e.target).closest('.item').attr('data-seller');

      if (alreadyVoted.indexOf(ign) >= 0) {
        console.log("alreadyVoted", ign, alreadyVoted);
        showInfo('You have already voted for&nbsp;<b>' + ign + '</b>');
        return;
      }
      // if(!checkActions()) {
      //   return;
      // }

      saveLocal(ign);
      saveLocalKarma("up");
      var count = (listIgn[ign] && listIgn[ign]['up'] ? listIgn[ign]['up'] + 1 : 1);
      // Write the new post's data simultaneously in the posts list and the user's post list.
      var updates = {
        up: count
      };
      firebase.database().ref("IGN/" + ign).update(updates);
    }

  });

  $('.whisper-btn').click(function(e) {

    if (e.originalEvent === undefined) {
      return;
    }

    //Some code
    if ("isTrusted" in e) {
      if (!event.isTrusted) {
        return;
      }
    }
    var ign = $(e.target).closest('.item').attr('data-seller');


    $.each($(e.target).closest('.item')[0].className.split(" "), function(index, name) {
      if (name.indexOf('item-live-') >= 0) {
        var count = (listIgn[ign] && listIgn[ign]["items"] && listIgn[ign]["items"][name] && listIgn[ign]["items"][name].whisper ? listIgn[ign]["items"][name].whisper + 1 : 1);
        var updates = {
          whisper: count
        };

        if (alreadyWhisper.indexOf(name) >= 0) {
          showInfo('You have already whispered for this item');
          return;
        }

        saveWhisper(name);
        firebase.database().ref("IGN/" + ign + "/items/" + name).update(updates);
      }
    });

  });

  $('.fixdown').click(function(e) {

    if (e.originalEvent === undefined) {
      return;
    }

    //Some code
    if ("isTrusted" in e) {
      if (!event.isTrusted) {
        return;
      }
    }

    if (!$(e.target).closest('.item').hasClass('voted')) {
      $(e.target).closest('.item').addClass('voted');
      var ign = $(e.target).closest('.item').attr('data-seller');


      if (alreadyVoted.indexOf(ign) >= 0) {
        console.log("alreadyVoted", ign, alreadyVoted);
        showInfo('You have already voted for&nbsp;<b>' + ign + '</b>');
        return;
      }

      if (!checkActions()) {
        return;
      }

      saveLocal(ign);
      saveLocalKarma("down");

      var count = (listIgn[ign] && listIgn[ign]['down'] ? listIgn[ign]['down'] + 1 : 1);
      // Write the new post's data simultaneously in the posts list and the user's post list.
      var updates = {
        down: count
      };
      firebase.database().ref("IGN/" + ign).update(updates);
    }
  });

}

InitializeAll();

var listIgn = {};
var alreadyVoted = [];
var alreadyReported = {};
var myKarma = {
  up: 0,
  down: 0
};

var timerAction = 300;
var firstAction = null;
var limitNumberAction = 0;

var myExtensionId = null;

chrome.storage.local.get('myExtensionId', function(result) {
  if (!result.myExtensionId) {
    myExtensionId = uuidv4();
    chrome.storage.local.set({
      'myExtensionId': myExtensionId
    }, function() {
      // Notify that we saved.
      console.log('Settings saved myExtensionId', myExtensionId);
      getMyKarma();
    });
  } else {
    myExtensionId = result.myExtensionId;
    console.log('myExtensionId = ', myExtensionId);
    getMyKarma();
  }
});

function uuidv4() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = Math.random() * 16 | 0,
      v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

// chrome.storage.local.set({
//   'myKarma': myKarma
// }, function() {
//   // Notify that we saved.
//   console.log('Settings saved myKarma', myKarma);
// });

// chrome.storage.local.set({
//   'alreadyVoted': []
// }, function() {
//   // Notify that we saved.
//   console.log('Settings saved alreadyVoted', alreadyVoted);
// });
//
// chrome.storage.local.set({
//   'alreadyWhisper': []
// }, function() {
//   // Notify that we saved.
//   console.log('Settings saved alreadyWhisper', alreadyWhisper);
// });

// chrome.storage.local.set({
//   'alreadyReported': {}
// }, function() {
//   // Notify that we saved.
//   console.log('Settings saved alreadyReported', alreadyReported);
// });

chrome.storage.local.get('myKarma', function(result) {
  if (result.myKarma) {
    myKarma = result.myKarma;
    console.log(myKarma);
  }
});

chrome.storage.local.get('alreadyReported', function(result) {
  if (result.alreadyReported) {
    alreadyReported = result.alreadyReported;
    console.log("alreadyReported", alreadyReported);
  }
});

chrome.storage.local.get('alreadyVoted', function(result) {
  if (result.alreadyVoted) {
    alreadyVoted = result.alreadyVoted;
    console.log(alreadyVoted);
  }
});

var alreadyWhisper = [];

chrome.storage.local.get('alreadyWhisper', function(result) {
  if (result.alreadyWhisper) {
    alreadyWhisper = result.alreadyWhisper;
    console.log(alreadyWhisper);
  }
});

var database = firebase.database();

function getMyKarma() {
  var starCountRef = firebase.database().ref('users/' + myExtensionId);

  starCountRef.on('value', function(snapshot) {
    if (snapshot.val()) {
      myKarma = snapshot.val();
      console.log("getMyKarma", snapshot.val());
    } else {
      console.log('nothing in users/' + myExtensionId);
    }
  }, function(error) {
    console.error(error);
  });

}

var starCountRef = firebase.database().ref('IGN');
starCountRef.on('value', function(snapshot) {
  if (snapshot.val()) {
    listIgn = snapshot.val();
    update(snapshot.val());
  } else {
    console.log('nothing in IGN');
  }
}, function(error) {
  console.error(error);
});

var globalListen = "";
$('form').submit(function(e) {
  if (globalListen) {
    clearTimeout(globalListen);
  }
  globalListen = setTimeout(function() {
    InitializeAll();
    update(listIgn);
    globalListen = "";
  }, 2000);
});

$('.loader').bind('DOMNodeInserted DOMNodeRemoved', function() { // when tere is change on the request
  if (globalListen) {
    clearTimeout(globalListen);
  }

  globalListen = setTimeout(function() {
    console.log("globalListen", "listen");
    InitializeAll();
    globalListen = "";
    update(listIgn);
  }, 200);
});

var somethingWrong = setTimeout(function() {
  showInfo("Extension poe fixing has reached its peak connections limit");
}, 4000);

function update(datas) {

  if (somethingWrong) {
    clearTimeout(somethingWrong);
  }

  $.each(datas, function(ign, value) {

    if ($('.item[data-seller="' + ign + '"]').find('.fixup .count').html() != value.up) {
      $('.item[data-seller="' + ign + '"]').find('.fixup .count').html(value.up);
    }

    if ($('.item[data-seller="' + ign + '"]').find('.fixdown .count').html() != value.down) {
      $('.item[data-seller="' + ign + '"]').find('.fixdown .count').html(value.down);
    }

    var total = (value.up ? value.up : 0) + (value.down ? value.down : 0);

    if (parseFloat(value.down) > 0) {
      // console.log(value.up, value.down);
      // console.log((value.down / total) * 100 + "%");
      $('.item[data-seller="' + ign + '"]').find('.standing .down').css({
        height: (value.down / total) * 100 + "%"
      });
    }
    if (parseFloat(value.up) > 0) {
      // console.log(value.up, value.down);
      // console.log((value.up / total) * 100 + "%");
      $('.item[data-seller="' + ign + '"]').find('.standing .up').css({
        height: (value.up / total) * 100 + "%"
      });
    }

    if (value && value.items) {
      $.each(value.items, function(indexID, itemInfo) {
        $('.item.' + indexID + '[data-seller="' + ign + '"]').find('.whisper-count').html(itemInfo.whisper);
      });
    }

  });
}


function showInfo(text) {

  var div = document.createElement('div');
  $(div).addClass('infoTicker');
  $(div).html(text);
  $('body').append(div);

  setTimeout(function() {
    $(div).addClass('hideme');
  }, 4000);

  setTimeout(function() {
    $(div).remove();
  }, 5000);

}


function saveWhisper(ign) {
  alreadyWhisper.push(ign);

  chrome.storage.local.set({
    'alreadyWhisper': alreadyWhisper
  }, function() {
    // Notify that we saved.
    console.log('Settings saved alreadyWhisper', alreadyWhisper);
  });
}

function checkActions() {

  if (!firstAction) {
    firstAction = new Date();
  }

  limitNumberAction++;
  var myAction = new Date();

  console.log("checkActions", limitNumberAction, getDiffSec(firstAction, myAction));

  if (getDiffSec(firstAction, myAction) > timerAction && limitNumberAction > 2) {
    firstAction = new Date();
    limitNumberAction = 0;
    return true;
  } else if (limitNumberAction <= 2) {
    return true;
  }
  showInfo('Number of vote execed please wait&nbsp;<b>' + Math.round((300 - getDiffSec(firstAction, myAction))) + "sec</b>");
  return false;
}

function getDiffSec(date1, date2) {
  var t1 = date1;
  var t2 = date2;
  var dif = t1.getTime() - t2.getTime();

  var Seconds_from_T1_to_T2 = dif / 1000;
  var Seconds_Between_Dates = Math.abs(Seconds_from_T1_to_T2);

  return parseFloat(Seconds_Between_Dates);
}

function saveLocal(ign) {

  alreadyVoted.push(ign);

  chrome.storage.local.set({
    'alreadyVoted': alreadyVoted
  }, function() {
    // Notify that we saved.
    console.log('Settings saved alreadyVoted', alreadyVoted);
  });
}

function saveLocalReport(ign, report) {

  //alreadyReported.push({ ign: ign, report: report });
  alreadyReported[ign] = report;

  chrome.storage.local.set({
    'alreadyReported': alreadyReported
  }, function() {
    // Notify that we saved.
    console.log('Settings saved alreadyReported', alreadyReported);
  });

}

function saveLocalKarma(karma) {

  myKarma[karma]++;

  chrome.storage.local.set({
    'myKarma': myKarma
  }, function() {
    // Notify that we saved.
    console.log('Settings saved myKarma', myKarma);
  });

  var updates = myKarma;
  firebase.database().ref("users/" + myExtensionId).update(updates);
}

function saveChanges() {
  // Get a value saved in a form.
  alreadyVoted =
    // Save it using the Chrome extension storage API.
    chrome.storage.sync.set({
      'value': theValue
    }, function() {
      // Notify that we saved.
      message('Settings saved');
    });
}
