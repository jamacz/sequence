var express = require('express');
var path = require('path');
var http = require('http');
var socketIO = require('socket.io');

var app = express();
var server = http.Server(app);
var io = socketIO(server);

var PORT = process.env.PORT || 80;

app.use(express.static('public', {
  extensions: ['html']
}));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '\public', '\sequence.html'));
});

// ---

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

var board;

var deck;

var players;
var turn;
var maxPlayers;
var winner;
var deadCard;
var numRowsToWin;
var numPlayers;

var lastgo = undefined;

function initialise() {
  board = [
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
  deck = shuffleDeck(generateDeck());
  players = {};
  turn = 0;
  maxPlayers = 0;
  winner = undefined;
  deadCard = false;
  numRowsToWin = 2;
  lastgo = undefined;
  numPlayers = 0;
}

function generateDeck() {
  var d = [];
  for (var v of ["a", "2", "3", "4", "5", "6", "7", "8", "9", "10", "j", "q", "k"]) {
    for (var s of ["h", "s", "c", "d"]) {
      d.push(Card(v, s));
      d.push(Card(v, s));
    }
  }
  return d;
}

function shuffleDeck(d) {
  var nd = [];
  var l = d.length;
  for (var i = 0; i < l; i++) {
    var a = Math.floor(Math.random() * d.length);
    nd.push(d[a]);
    d.splice(a, 1);
  }
  return nd;
}

function takeFirst(d) {
  var c = d[0];
  d.splice(0, 1);
  return c;
}

function checkForRow(b) {
  var runs = {
    r: 0,
    g: 0,
    b: 0
  };
  for (var y = 0; y < 10; y++) {
    var col = board[y][0].state;
    if (board[y][0].value == "w") {
      col = board[y][1].state;
    }
    var run = 0;
    var containsCompleted = 0;
    for (var x = 0; x < 10; x++) {
      if (board[y][x].state == col && col != "" || board[y][x].value == "w") {
        run++;
        if (board[y][x].completed) {
          containsCompleted++;
        }
      } else {
        if (run >= 5) {
          runs[col]++;
          if (containsCompleted < 2) {
            for (var i = x - run; i < x; i++) {
              if (board[y][i].value != "w") {
                board[y][i].completed = true;
              }
            }
          }
        }
        if (run >= 9) {
          runs[col]++;
          for (var i = x - run; i < x; i++) {
            if (board[y][i].value != "w") {
              board[y][i].completed = true;
            }
          }
        }
        run = 1;
        col = board[y][x].state;
        containsCompleted = 0;
      }
    }

    if (run >= 5) {
      runs[col]++;
      if (containsCompleted < 2) {
        for (var i = 10 - run; i < 10; i++) {
          if (board[y][i].value != "w") {
            board[y][i].completed = true;
          }
        }
      }
    }
    if (run >= 9) {
      runs[col]++;
      for (var i = 10 - run; i < 10; i++) {
        if (board[y][i].value != "w") {
          board[y][i].completed = true;
        }
      }
    }
  }
  for (var x = 0; x < 10; x++) {
    var col = board[0][x].state;
    if (board[0][x].value == "w") {
      col = board[1][x].state;
    }
    var run = 0;
    var containsCompleted = 0;
    for (var y = 0; y < 10; y++) {
      if (board[y][x].state == col && col != "" || board[y][x].value == "w") {
        run++;
        if (board[y][x].completed) {
          containsCompleted++;
        }
      } else {
        if (run >= 5) {
          runs[col]++;
          if (containsCompleted < 2) {
            for (var i = y - run; i < y; i++) {
              if (board[i][x].value != "w") {
                board[i][x].completed = true;
              }
            }
          }
        }
        if (run >= 9) {
          runs[col]++;
          for (var i = y - run; i < y; i++) {
            if (board[i][x].value != "w") {
              board[i][x].completed = true;
            }
          }
        }
        run = 1;
        col = board[y][x].state;
        containsCompleted = 0;
      }
    }

    if (run >= 5) {
      runs[col]++;
      if (containsCompleted < 2) {
        for (var i = 10 - run; i < 10; i++) {
          if (board[i][x].value != "w") {
            board[i][x].completed = true;
          }
        }
      }
    }
    if (run >= 9) {
      runs[col]++;
      for (var i = 10 - run; i < 10; i++) {
        if (board[i][x].value != "w") {
          board[i][x].completed = true;
        }
      }
    }
  }
  for (var y = -5; y <= 5; y++) {
    var col = board[Math.max(0, y)][Math.max(0, -y)].state;
    if (board[Math.max(0, y)][Math.max(0, -y)].value == "w") {
      col = board[1][1].state;
    }
    var run = 0;
    var containsCompleted = 0;
    for (var x = Math.max(0, -y); x < Math.min(10, 10 - y); x++) {
      if (board[y + x][x].state == col && col != "" || board[y + x][x].value == "w") {
        run++;
        if (board[y + x][x].completed) {
          containsCompleted++;
        }
      } else {
        if (run >= 5) {
          runs[col]++;
          if (containsCompleted < 2) {
            for (var i = x - run; i < x; i++) {
              if (board[y + i][i].value != "w") {
                board[y + i][i].completed = true;
              }
            }
          }
        }
        if (run >= 9) {
          runs[col]++;
          for (var i = x - run; i < x; i++) {
            if (board[y + i][i].value != "w") {
              board[y + i][i].completed = true;
            }
          }
        }
        run = 1;
        col = board[y + x][x].state;
        containsCompleted = 0;
      }
    }

    if (run >= 5) {
      runs[col]++;
      if (containsCompleted < 2) {
        for (var i = Math.min(10, 10 - y) - run; i < Math.min(10, 10 - y); i++) {
          if (board[y + i][i].value != "w") {
            board[y + i][i].completed = true;
          }
        }
      }
    }
    if (run >= 9) {
      runs[col]++;
      for (var i = Math.min(10, 10 - y) - run; i < Math.min(10, 10 - y); i++) {
        if (board[y + i][i].value != "w") {
          board[y + i][i].completed = true;
        }
      }
    }
  }
  for (var y = 4; y <= 14; y++) {
    var col = board[Math.min(9, y)][Math.max(0, y - 9)].state;
    if (board[Math.min(9, y)][Math.max(0, y - 9)].value == "w") {
      col = board[8][1].state;
    }
    var run = 0;
    var containsCompleted = 0;
    for (var x = Math.max(0, y - 9); x <= Math.min(9, y); x++) {
      if (board[y - x][x].state == col && col != "" || board[y - x][x].value == "w") {
        run++;
        if (board[y - x][x].completed) {
          containsCompleted++;
        }
      } else {
        if (run >= 5) {
          runs[col]++;
          if (containsCompleted < 2) {
            for (var i = x - run; i < x; i++) {
              if (board[y - i][i].value != "w") {
                board[y - i][i].completed = true;
              }
            }
          }
        }
        if (run >= 9) {
          runs[col]++;
          for (var i = x - run; i < x; i++) {
            if (board[y - i][i].value != "w") {
              board[y - i][i].completed = true;
            }
          }
        }
        run = 1;
        col = board[y - x][x].state;
        containsCompleted = 0;
      }
    }

    if (run >= 5) {
      runs[col]++;
      if (containsCompleted < 2) {
        for (var i = Math.min(9, y) - run + 1; i < Math.min(9, y) + 1; i++) {
          if (board[y - i][i].value != "w") {
            board[y - i][i].completed = true;
          }
        }
      }
    }
    if (run >= 9) {
      runs[col]++;
      for (var i = Math.min(9, y) - run + 1; i < Math.min(9, y) + 1; i++) {
        if (board[y - i][i].value != "w") {
          board[y - i][i].completed = true;
        }
      }
    }
  }
  return runs;
}



io.on('connection', function(socket) {
  socket.on('addPlayer', function(data) {
    socket.username = data;
    if (players[data]) {
      players[data].active = true;
    } else {
      numPlayers++;
      players[data] = {
        active: true,
        cards: [],
        team: "",
        order: numPlayers
      };
    }
    io.sockets.emit('usernameAccepted', data);
    updateBoard();
  });

  socket.on('makeMove', function(data) {
    var c = -1;
    var cd = -1;
    if (players[socket.username]) {
      if (players[socket.username].order == turn && data.card && turn != 0) {

        for (var i = 0; i < players[socket.username].cards.length; i++) {
          if (players[socket.username].cards[i].value == data.card.value && players[socket.username].cards[i].suit == data.card.suit) {
            cd = i;
          }
          if (
            (((board[data.y][data.x].value == players[socket.username].cards[i].value &&
                board[data.y][data.x].suit == players[socket.username].cards[i].suit) || (players[socket.username].cards[i].value == "j" && (players[socket.username].cards[i].suit == "c" || players[socket.username].cards[i].suit == "d"))) &&
              board[data.y][data.x].state == "" && players[socket.username].cards[i].value == data.card.value && players[socket.username].cards[i].suit == data.card.suit)
          ) {
            board[data.y][data.x].state = players[socket.username].team;
            lastgo = {
              x: data.x,
              y: data.y
            };
            nextTurn();
            c = i;

          } else if (players[socket.username].cards[i].value == "j" && (players[socket.username].cards[i].suit == "s" || players[socket.username].cards[i].suit == "h") && board[data.y][data.x].state != "" && board[data.y][data.x].state != players[socket.username].team && players[socket.username].cards[i].value == data.card.value && players[socket.username].cards[i].suit == data.card.suit && board[data.y][data.x].completed == false) {
            board[data.y][data.x].state = "";
            lastgo = {
              x: data.x,
              y: data.y
            };
            nextTurn();
            c = i;
          }
        }
        if (c != -1) {

          players[socket.username].cards[c] = takeFirst(deck);
        } else {
          var spaceFree = false;
          if (data.card.value != "j") {
            for (var y = 0; y < 10; y++) {
              for (var x = 0; x < 10; x++) {
                if (board[y][x].value == data.card.value && board[y][x].suit == data.card.suit) {
                  if (board[y][x].state == "") {
                    spaceFree = true;
                  }
                }
              }
            }
          }

          if (!spaceFree && cd != -1 && !deadCard) {
            players[socket.username].cards[cd] = takeFirst(deck);
            io.sockets.emit('deselect', "");
            deadCard = true;
          }
        }




      }
    }
    updateBoard();
  });

  socket.on('startGame', function(data) {
    numRowsToWin = data.rows
    maxPlayers = data.players.length;
    var numCards = 0;
    if (maxPlayers <= 2) {
      numCards = 7;
    } else if (maxPlayers <= 4) {
      numCards = 6;
    } else if (maxPlayers <= 6) {
      numCards = 5;
    } else if (maxPlayers <= 9) {
      numCards = 4;
    } else {
      numCards = 3;
    }
    for (var i in players) {
      players[i].order = 0;
      players[i].team = "";
    }
    if (maxPlayers >= 2 && maxPlayers <= 12 && maxPlayers != 5 && maxPlayers != 7 && maxPlayers != 11) {
      for (var i = 0; i < data.players.length; i++) {
        if (!players[data.players[i].player]) {
          players[data.players[i].player] = {
            active: true,
            cards: [],
            team: "",
            order: 0
          };
        }
        players[data.players[i].player].order = i + 1;
        players[data.players[i].player].team = data.players[i].team;
        for (var j = 0; j < numCards; j++) {
          players[data.players[i].player].cards.push(takeFirst(deck));
        }
      }
      turn = 1;
      updateBoard();
    }

  });

  socket.on('disconnect', function() {
    if (socket.username) {
      if (players[socket.username]) {
        players[socket.username].active = false;
      }
    }
    updateBoard();
  });

  socket.on("swapPlayers", function(data) {
    var first;
    var second;
    for (var i in players) {
      if (players[i].order == data.first) {
        first = i;
      }
      if (players[i].order == data.second) {
        second = i;
      }
    }
    if (first !== undefined && second !== undefined) {
      var temp = players[second].order;
      players[second].order = players[first].order;
      players[first].order = temp;
    }
    updateBoard();
    console.log(data);
  })

  socket.on("changeTeam", function(data) {
    console.log(data);
    var pteam = players[data].team;
    if (pteam == "r") {
      players[data].team = "g";
    } else if (pteam == "g") {
      players[data].team = "b";
    } else if (pteam == "b") {
      players[data].team = "";
    } else if (pteam == "") {
      players[data].team = "r";
    }
    updateBoard();
  });

  socket.on('restart', function() {
    io.sockets.emit('restart', "");
    initialise();
  });
});

function nextTurn() {
  deadCard = false;
  if (!winner) {
    turn++;
    if (turn > maxPlayers) {
      turn = 1;
    }
  }

}

function updateBoard() {
  var rows = checkForRow(board);

  if (rows.r == numRowsToWin) {
    win("r");
  }
  if (rows.g == numRowsToWin) {
    win("g");
  }
  if (rows.b == numRowsToWin) {
    win("b");
  }
  io.sockets.emit('updateBoard', {
    turn: turn,
    board: board,
    players: players,
    lastgo: lastgo
  });
}

function win(w) {
  turn = 0;
  winner = w;
  io.sockets.emit('win', w);

}

initialise();

server.listen(PORT, function() {
  console.log('Starting server');
});