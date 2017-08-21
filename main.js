console.log('poefixing loaded');

$('.item').each(function(index, element) {
  //console.log($(element).attr("data-ign"));
  $(element).find('.icon-td').append('<div class="standing"><div class="up"></div><div class="down"></div></div>');
  $(element).find('.bottom-row .proplist').append("<li class='whisper-count'>0</li><li class='fixingui'><div class='fixup'><span class='count'>0</span></div></li><li class='fixingui'><div class='fixdown'><span class='count'>0</span></div></li>");
});

var listIgn = {};
var alreadyVoted = [];

chrome.storage.local.get('alreadyVoted', function (result) {
    if(result.alreadyVoted) {
      alreadyVoted = result.alreadyVoted;
      console.log(alreadyVoted);
    }
});

var alreadyWhisper = [];

chrome.storage.local.get('alreadyWhisper', function (result) {
    if(result.alreadyWhisper) {
      alreadyWhisper = result.alreadyWhisper;
      console.log(alreadyWhisper);
    }
});

// Initialize Firebase
 var config = {
   apiKey: "AIzaSyAk3-WQr75K4qmu8oy70KrNkmm0TsmUQ1Y",
   authDomain: "poe-fixing.firebaseapp.com",
   databaseURL: "https://poe-fixing.firebaseio.com",
   projectId: "poe-fixing",
   storageBucket: "poe-fixing.appspot.com",
   messagingSenderId: "150775083928"
 };
 firebase.initializeApp(config);

var database = firebase.database();

var starCountRef = firebase.database().ref('IGN');
starCountRef.on('value', function(snapshot) {
  listIgn = snapshot.val();
  update(snapshot.val());
});


function update(datas) {
  $.each(datas, function(ign, value) {

      $('.item[data-ign="'+ign+'"]').find('.fixup .count').html(value.up);
      $('.item[data-ign="'+ign+'"]').find('.fixdown .count').html(value.down);

      var total = (value.up? value.up : 0)+(value.down? value.down : 0);


      if(parseFloat(value.down) > 0) {
        console.log(value.up, value.down);
              console.log((value.down/total)*100+"%");
        $('.item[data-ign="'+ign+'"]').find('.standing .down').css({
          height: (value.down/total)*100+"%"
        });
      }
      if(parseFloat(value.up) > 0) {
        console.log(value.up, value.down);
              console.log((value.up/total)*100+"%");
        $('.item[data-ign="'+ign+'"]').find('.standing .up').css({
          height: (value.up/total)*100+"%"
        });
      }

      if(value && value.items) {
        $.each(value.items, function(indexID, itemInfo) {
          $('.item.'+indexID+'[data-ign="'+ign+'"]').find('.whisper-count').html(itemInfo.whisper);
        });
      }

  });
}

$('.fixup').click(function(e){
    //Some code
    if ("isTrusted" in e) {
      if (!event.isTrusted) {
          return;
      }
    }

    if(!$(e.target).closest('.item').hasClass('voted')) {
      $(e.target).closest('.item').addClass('voted');
      var ign = $(e.target).closest('.item').attr('data-ign');
      console.log(alreadyVoted, ign);
      if(alreadyVoted.indexOf(ign) >= 0) {
        return;
      }
      saveLocal(ign);
      var count = (listIgn[ign] && listIgn[ign]['up'] ? listIgn[ign]['up']+1 : 1);
      // Write the new post's data simultaneously in the posts list and the user's post list.
      var updates = { up : count };
      firebase.database().ref("IGN/"+ign).update(updates);
    }

});

$('.whisper-btn').click(function(e){
  //Some code
  if ("isTrusted" in e) {
    if (!event.isTrusted) {
        return;
    }
  }
    var ign = $(e.target).closest('.item').attr('data-ign');


    $.each($(e.target).closest('.item')[0].className.split(" "), function(index, name) {
      if(name.indexOf('item-live-') >= 0) {
        var count = (listIgn[ign] && listIgn[ign]["items"] && listIgn[ign]["items"][name] && listIgn[ign]["items"][name].whisper ? listIgn[ign]["items"][name].whisper+1 : 1);
        var updates = { whisper : count };

        console.log(alreadyWhisper, name);
        if(alreadyWhisper.indexOf(name) >= 0) {
          return;
        }

        saveWhisper(name);

        firebase.database().ref("IGN/"+ign+"/items/"+name).update(updates);
      }
    });

});

$('.fixdown').click(function(e){
    //Some code
    if ("isTrusted" in e) {
      if (!event.isTrusted) {
          return;
      }
    }

    if(!$(e.target).closest('.item').hasClass('voted')) {
      $(e.target).closest('.item').addClass('voted');
      var ign = $(e.target).closest('.item').attr('data-ign');
      console.log(alreadyVoted, ign);
      if(alreadyVoted.indexOf(ign) >= 0) {
        return;
      }

      saveLocal(ign);
      var count = (listIgn[ign] && listIgn[ign]['down'] ? listIgn[ign]['down']+1 : 1);
      // Write the new post's data simultaneously in the posts list and the user's post list.
      var updates = { down : count };
      firebase.database().ref("IGN/"+ign).update(updates);
    }
});

function saveWhisper(ign) {
  alreadyWhisper.push(ign);

  chrome.storage.local.set({'alreadyWhisper': alreadyWhisper}, function() {
    // Notify that we saved.
    console.log('Settings saved alreadyWhisper', alreadyWhisper);
  });
}

function saveLocal(ign) {

  alreadyVoted.push(ign);

  chrome.storage.local.set({'alreadyVoted': alreadyVoted}, function() {
    // Notify that we saved.
    console.log('Settings saved alreadyVoted', alreadyVoted);
  });
}

function saveChanges() {
  // Get a value saved in a form.
  alreadyVoted =
  // Save it using the Chrome extension storage API.
  chrome.storage.sync.set({'value': theValue}, function() {
    // Notify that we saved.
    message('Settings saved');
  });
}
