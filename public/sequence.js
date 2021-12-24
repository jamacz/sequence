var socket = io();

function Space(val, suit) {

  return {
    value: val,
    suit: suit,
    state: "",
    completed: false
  };

}

function Card(val, suit) {
  return {
    value: val,
    suit: suit
  };
}

var board = [
  [
    Space("w", "w"),
    Space("2", "s"),
    Space("3", "s"),
    Space("4", "s"),
    Space("5", "s"),
    Space("6", "s"),
    Space("7", "s"),
    Space("8", "s"),
    Space("9", "s"),
    Space("w", "w")
  ],
  [
    Space("6", "c"),
    Space("5", "c"),
    Space("4", "c"),
    Space("3", "c"),
    Space("2", "c"),
    Space("a", "h"),
    Space("k", "h"),
    Space("q", "h"),
    Space("10", "h"),
    Space("10", "s")
  ],
  [
    Space("7", "c"),
    Space("a", "s"),
    Space("2", "d"),
    Space("3", "d"),
    Space("4", "d"),
    Space("5", "d"),
    Space("6", "d"),
    Space("7", "d"),
    Space("9", "h"),
    Space("q", "s")
  ],
  [
    Space("8", "c"),
    Space("k", "s"),
    Space("6", "c"),
    Space("5", "c"),
    Space("4", "c"),
    Space("3", "c"),
    Space("2", "c"),
    Space("8", "d"),
    Space("8", "h"),
    Space("k", "s")
  ],
  [
    Space("9", "c"),
    Space("q", "s"),
    Space("7", "c"),
    Space("6", "h"),
    Space("5", "h"),
    Space("4", "h"),
    Space("a", "h"),
    Space("9", "d"),
    Space("7", "h"),
    Space("a", "s")
  ],
  [
    Space("10", "c"),
    Space("10", "s"),
    Space("8", "c"),
    Space("7", "h"),
    Space("2", "h"),
    Space("3", "h"),
    Space("k", "h"),
    Space("10", "d"),
    Space("6", "h"),
    Space("2", "d")
  ],
  [
    Space("q", "c"),
    Space("9", "s"),
    Space("9", "c"),
    Space("8", "h"),
    Space("9", "h"),
    Space("10", "h"),
    Space("q", "h"),
    Space("q", "d"),
    Space("5", "h"),
    Space("3", "d")
  ],
  [
    Space("k", "c"),
    Space("8", "s"),
    Space("10", "c"),
    Space("q", "c"),
    Space("k", "c"),
    Space("a", "c"),
    Space("a", "d"),
    Space("k", "d"),
    Space("4", "h"),
    Space("4", "d")
  ],
  [
    Space("a", "c"),
    Space("7", "s"),
    Space("6", "s"),
    Space("5", "s"),
    Space("4", "s"),
    Space("3", "s"),
    Space("2", "s"),
    Space("2", "h"),
    Space("3", "h"),
    Space("5", "d")
  ],
  [
    Space("w", "w"),
    Space("a", "d"),
    Space("k", "d"),
    Space("q", "d"),
    Space("10", "d"),
    Space("9", "d"),
    Space("8", "d"),
    Space("7", "d"),
    Space("6", "d"),
    Space("w", "w")
  ]
];

var cards = [];
var team = "";
var turn = 0;
var winner = "";

var currentPlayer = {
  name: "",
  team: ""
}

var selectedCard;
var selectedElement;

var mTurn = false;

function myTurn() {

  $(".selected").removeClass("selected");
  $("#board").removeClass("myturn");
  $("#board-container").removeClass("shadedout");
  $(".disabled").removeClass("disabled");
  $("#board").addClass("myturn");
  $(".card").addClass("disabled");
  $("#deck-container").removeClass("shadedout");
  $("#turn-indicator.hidden").removeClass("hidden");
  $("#turn-indicator").addClass("hidden");

  if (!(selectedCard)) {
    $("#board-container").addClass("shadedout");
  }

  for (var y = 0; y < board.length; y++) {
    for (var x = 0; x < board[y].length; x++) {
      if (selectedCard) {
        if (
          board[y][x].value == selectedCard.value &&
          board[y][x].suit == selectedCard.suit &&
          board[y][x].state == "" ||
          board[y][x].state != "" && board[y][x].state != team && board[y][x].completed == false && selectedCard.value == "j" && (selectedCard.suit == "s" || selectedCard.suit == "h") ||
          board[y][x].state == "" && selectedCard.value == "j" && (selectedCard.suit == "c" || selectedCard.suit == "d") && board[y][x].value != "w"

        ) {
          $("#board .board-row").eq(y).children().eq(x).removeClass("disabled");
        }
      } else {
        for (let c of cards) {
          if (
            (board[y][x].value == c.value &&
              board[y][x].suit == c.suit &&
              board[y][x].state == "" ||
              board[y][x].state != "" && board[y][x].state != team && c.value == "j" && (c.suit == "s" || c.suit == "h") ||
              board[y][x].state == "" && c.value == "j" && (c.suit == "c" || c.suit == "d")) && board[y][x].value != "w"
          ) {
            $("#board .board-row").eq(y).children().eq(x).removeClass("disabled");
          }
        }
      }

    }
  }
  if (selectedElement) {
    selectedElement.children().first().addClass("selected");
  }

}

function endMyTurn() {
  $("#turn-indicator.colr").removeClass("colr");
  $("#turn-indicator.colg").removeClass("colg");
  $("#turn-indicator.colb").removeClass("colb");
  if (winner == "r") {
    $("#turn-indicator").addClass("colr");
    $("#turn-indicator").text("Red Wins!");
  } else if (winner == "g") {
    $("#turn-indicator").addClass("colg");
    $("#turn-indicator").text("Green Wins!");
  } else if (winner == "b") {
    $("#turn-indicator").addClass("colb");
    $("#turn-indicator").text("Blue Wins!");
  } else if (turn == 0) {
    $("#turn-indicator").text("Waiting for players...");
  } else {
    $("#turn-indicator").addClass("col" + currentPlayer.team);
    $("#turn-indicator").text("▲ " + currentPlayer.name + "'s turn ▲");
  }
  $("#turn-indicator.hidden").removeClass("hidden");
  $(".selected").removeClass("selected");
  $("#board").removeClass("myturn");
  $("#board").removeClass("shadedout");
  $(".disabled").removeClass("disabled");
  $("#deck-container").addClass("shadedout");
  selectedCard = undefined;
  selectedElement = undefined;
}

function updateBoard() {

  $("#board.colr").removeClass("colr");
  $("#board.colg").removeClass("colg");
  $("#board.colb").removeClass("colb");
  $("#board").addClass("col" + currentPlayer.team);
  $("#deck.col").removeClass("col");
  $("#deck.colr").removeClass("colr");
  $("#deck.colg").removeClass("colg");
  $("#deck.colb").removeClass("colb");
  $("#deck").addClass("col" + team);
  for (var y = 0; y < board.length; y++) {
    for (var x = 0; x < board[y].length; x++) {
      $("#board .board-row")
        .eq(y)
        .children()
        .eq(x)
        .removeClass("counter-red")
        .removeClass("counter-green")
        .removeClass("counter-blue")
        .removeClass("counter-completed");
      if (board[y][x].state == "r") {
        $("#board .board-row").eq(y).children().eq(x).addClass("counter-red");
      } else if (board[y][x].state == "g") {
        $("#board .board-row").eq(y).children().eq(x).addClass("counter-green");
      } else if (board[y][x].state == "b") {
        $("#board .board-row").eq(y).children().eq(x).addClass("counter-blue");
      }

      if (board[y][x].completed) {
        $("#board .board-row").eq(y).children().eq(x).addClass("counter-completed");
      }
    }
  }

  while ($("#deck-container .deck-card-container").length < cards.length) {
    $("#deck-container").append('<div class="deck-card-container" data-cardno="0"><div class="deck-card"><h1></h1><h2></h2></div></div>');

  }

  while ($("#deck-container .deck-card-container").length > cards.length) {
    $("#deck-container .deck-card-container").eq(0).remove();
  }

  $("#deck-container").attr("data-nochildren", cards.length);

  for (var i = 0; i < cards.length; i++) {
    sortHand();
    $(".deck-card-container").eq(i).find("h1").text(cards[i].value.toUpperCase());
    $(".deck-card-container").eq(i).find(".deck-card.jack").removeClass("jack");
    if (cards[i].value == "j") {
      $(".deck-card-container").eq(i).find(".deck-card").addClass("jack");
      if (cards[i].suit == "h") {
        $(".deck-card-container").eq(i).find("h2").text("\uf068");
        $(".deck-card-container").eq(i).find(".deck-card.red").removeClass("red");
      } else if (cards[i].suit == "s") {
        $(".deck-card-container").eq(i).find("h2").text("\uf068");
        $(".deck-card-container").eq(i).find(".deck-card.red").removeClass("red");
      } else if (cards[i].suit == "d") {
        $(".deck-card-container").eq(i).find("h2").text("\uf067");
        $(".deck-card-container").eq(i).find(".deck-card.red").removeClass("red");
        $(".deck-card-container").eq(i).find(".deck-card").addClass("red");
      } else if (cards[i].suit == "c") {
        $(".deck-card-container").eq(i).find("h2").text("\uf067");
        $(".deck-card-container").eq(i).find(".deck-card.red").removeClass("red");
        $(".deck-card-container").eq(i).find(".deck-card").addClass("red");
      }
    } else {

      if (cards[i].suit == "h") {
        $(".deck-card-container").eq(i).find("h2").text("\uf004");
        $(".deck-card-container").eq(i).find(".deck-card.red").removeClass("red");
        $(".deck-card-container").eq(i).find(".deck-card").addClass("red");
      } else if (cards[i].suit == "s") {
        $(".deck-card-container").eq(i).find("h2").text("\uf2f4");
        $(".deck-card-container").eq(i).find(".deck-card.red").removeClass("red");
      } else if (cards[i].suit == "d") {
        $(".deck-card-container").eq(i).find("h2").text("\uf219");
        $(".deck-card-container").eq(i).find(".deck-card.red").removeClass("red");
        $(".deck-card-container").eq(i).find(".deck-card").addClass("red");
      } else if (cards[i].suit == "c") {
        $(".deck-card-container").eq(i).find("h2").text("\uf327");
        $(".deck-card-container").eq(i).find(".deck-card.red").removeClass("red");
      }
    }
  }

  $('.deck-card-container').off('click');

  $(".deck-card-container").click(function() {
    selectedCard = cards[$(this).index()];
    console.log($(this).index());
    selectedElement = $(this);
    updateBoard();
  });

  if (mTurn) {
    myTurn();
  } else if (!mTurn) {
    endMyTurn();
  }
}

$(".card").click(function() {
  makeMove($(this).index(), $(this).parent().index());
});

$(".deck-card-container").click(function() {

  selectedCard = cards[$(this).index()];
  selectedElement = $(this);
  updateBoard();
});

function makeMove(xpos, ypos) {
  socket.emit("makeMove", {
    x: xpos,
    y: ypos,
    card: selectedCard
  });
}

var username;

$("#username-input").keyup(function(event) {
  if (event.keyCode === 13) {
    event.preventDefault();
    document.getElementById("username-submit").click();
  }
});

function startGame() {
  username = $("#username-input").val();
  if (username.length > 0) {
    socket.emit("addPlayer", username);
  }
}

function sGameRes() {

  if (username == "host") {
    $("#host-buttons").addClass("show");
    $("#host-buttons2").addClass("show");
    $("#board-container").addClass("host");
  } else {
    $("#deck").removeClass("hidden");
  }
  $("#username").addClass("hidden");
  $("#board").removeClass("hidden");
}

function getNameFromOrder(d, n) {
  for (var property in d.players) {
    if (d.players.hasOwnProperty(property)) {
      if (d.players[property].order == n && n != 0) {
        return property;
      }
    }
  }
  return undefined;
}

var gameOrder = [];

function sortHand() {
  var numSorted = 0;
  var order = [];
  for (var i = 0; i < cards.length; i++) {
    order[i] = -1;
  }

  while (numSorted != cards.length) {
    var lowestVal = 14;
    var lowestSuit = "j";
    var lowestPos;
    for (var i = 0; i < cards.length; i++) {
      if (order[i] == -1) {
        if ((cards[i].suit == "h" || cards[i].suit == "s" && (lowestSuit != "h") || cards[i].suit == "d" && (lowestSuit != "h" && lowestSuit != "s") || cards[i].suit == "c" && (lowestSuit != "h" && lowestSuit != "s" && lowestSuit != "d")) && cards[i].value != "j" || cards[i].value == "j" && lowestSuit == "j") {
          if (cards[i].suit != lowestSuit && cards[i].value != "j") {
            lowestVal = 14;
          }
          var v = 0;
          if (cards[i].value == "j") {
            if (cards[i].suit == "h" || cards[i].suit == "s") {
              v = 2;
            } else {
              v = 1;
            }
          } else if (cards[i].value == "a") {
            v = 13;
          } else if (cards[i].value == "k") {
            v = 12;
          } else if (cards[i].value == "q") {
            v = 11;
          } else {
            v = parseInt(cards[i].value, 10);
          }
          if (v < lowestVal) {
            lowestVal = v;
            if (cards[i].value != "j") {
              lowestSuit = cards[i].suit;
            }


            lowestPos = i;
          }

        }
      }
    }

    order[lowestPos] = numSorted;
    $(".deck-card-container").eq(lowestPos).attr("data-cardno", numSorted.toString());
    numSorted++;
  }
}

var playerOrder = [];

// -- socket stuff --

socket.on('usernameAccepted', function(data) {
  if (data == username) {
    sGameRes();
  }
});

socket.on('updateBoard', function(data) {
  turn = data.turn;
  console.log(data);

  playerOrder = [];
  console.log(data.players);
  for (var i in data.players) {
    playerOrder[data.players[i].order - 1] = {
      player: i,
      team: data.players[i].team
    };
  }

  $("#host-buttons").empty();
  for (var i of playerOrder) {
    var el = $('<div class="host-player host-active">' + i.player + '<div class="hb-gap"></div><div class="hb-team"></div><div class="hb-sort"></div></div>').appendTo("#host-buttons");
    if (data.players[i.player].team == "r") {
      el.addClass("host-colr");
    } else if (data.players[i.player].team == "g") {
      el.addClass("host-colg");
    } else if (data.players[i.player].team == "b") {
      el.addClass("host-colb");
    }
  }

  $(".host-player .hb-sort").click(function() {
    socket.emit("swapPlayers", {
      first: $(this).parent().index() + 1,
      second: $(this).parent().index() + 2
    })
  });

  $(".host-player .hb-team").click(function() {
    socket.emit("changeTeam", playerOrder[$(this).parent().index()].player)
  });

  var cp = getNameFromOrder(data, data.turn);
  if (cp) {
    currentPlayer = {
      name: cp,
      team: data.players[cp].team
    };
    if (currentPlayer.name == username) {
      mTurn = true;
    } else {
      mTurn = false;
    }
  } else {
    mTurn = false;
  }

  board = data.board;
  if (username) {
    cards = data.players[username].cards;
    team = data.players[username].team;
  }

  updateBoard();
});

$("#host-button1").click(function() {
  var stgame = [];
  for (var i of playerOrder) {
    if (i.team !== "") {
      stgame.push(i);
    }
  }
  socket.emit("startGame", {
    rows: 2,
    players: stgame
  });
})

socket.on("restart", function() {
  location.reload();
});

socket.on('deselect', function() {
  selectedCard = undefined;
  selectedElement = undefined;
});

socket.on('win', function(data) {
  winner = data;
  updateBoard();
});