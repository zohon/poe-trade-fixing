console.log("chrome runtime id", chrome.runtime.id);


function InitializeAll() {
  $('.item').each(function(index, element) {
    //console.log($(element).attr("data-seller"));
    if ($(element).hasClass('antifixing')) {
      return;
    }
    $(element).addClass('antifixing');
    $(element).find('.icon-td').append('<div class="standing"><div class="up"></div><div class="down"></div></div>');
    $(element).find('.bottom-row .proplist').append("<li class='whisper-count'>0</li><li class='fixingui'><div class='fixup'><span class='count'>0</span></div></li><li class='fixingui'><div class='fixdown'><span class='count'>0</span></div></li>");
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

    var ign = $(e.target).closest('.item').attr('data-seller');
    addinfo(ign, "up");

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

        if (listIgn[ign] && listIgn[ign]["items"] && listIgn[ign]["items"][name] > 0) {
          showInfo('You have already whispered for this item');
          return;
        }

        addinfo(ign, "whisper", name);
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

      var ign = $(e.target).closest('.item').attr('data-seller');
      addinfo(ign, "down");

  });

}

InitializeAll();

var listIgn = {};

// chrome.storage.local.set({
//   'listIgn': {}
// }, function() {
//   // Notify that we saved.
//   console.log('Settings saved listIgn', listIgn);
// });


chrome.storage.local.get('listIgn', function(result) {
  if (result.listIgn) {
    listIgn = result.listIgn;
    console.log(listIgn);
    update(listIgn);
  }
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


function update(datas) {

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
        $('.item.' + indexID + '[data-seller="' + ign + '"]').find('.whisper-count').html(itemInfo);
      });
    }

  });
}

function addinfo(targetign, action, other) {

  var target = {

  };

  if(listIgn[targetign]) {
    target = listIgn[targetign];
  }

  switch (action) {
    case "down":
      if(target.down != undefined) {
        target.down++;
      } else {
        target.down = 1;
      }

      break;
    case "up":
        if(target.up != undefined) {
          target.up++;
        } else {
          target.up = 1;
        }
      break;
    case "whisper":
        if(target.items && target.items[other] != undefined) {
          target[other]++;
        } else {
          if(!target.items) {
            target.items = {};
          }
          target.items[other] = 1;
        }
      break;
  }

  listIgn[targetign] = target;
  update(listIgn);
  console.log(listIgn);

  chrome.storage.local.set({
    'listIgn': listIgn
  }, function() {
    // Notify that we saved.
    console.log('Settings saved listIgn', listIgn);
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
