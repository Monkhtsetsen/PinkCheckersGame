window.onload = function () {
	var gameBoard = [
	  [0, 1, 0, 1, 0, 1, 0, 1],
	  [1, 0, 1, 0, 1, 0, 1, 0],
	  [0, 1, 0, 1, 0, 1, 0, 1],
	  [0, 0, 0, 0, 0, 0, 0, 0],
	  [0, 0, 0, 0, 0, 0, 0, 0],
	  [2, 0, 2, 0, 2, 0, 2, 0],
	  [0, 2, 0, 2, 0, 2, 0, 2],
	  [2, 0, 2, 0, 2, 0, 2, 0]
	];
	//hadgalah massiv
	var pieces = [];
	var tiles = [];
  
	var dist = function (x1, y1, x2, y2) {
	  return Math.sqrt(Math.pow((x1 - x2), 2) + Math.pow((y1 - y2), 2));
	}
	function Piece(element, position) {
	  this.allowedtomove = true;
	  this.element = element;
	  //talbriin mor bln bagan deer gameBoard massiv deer baina
	  this.position = position;
	  //ali toglogch nuuh eelj
	  this.player = '';
	  if (this.element.attr("id") < 12)
		this.player = 1;
	  else
		this.player = 2;
	  //jitiin daamnii huug daam buyu haan bolgh
	  this.king = false;
	  this.makeKing = function () {
		this.element.css("backgroundImage", "url('img/king" + this.player + ".png')");
		this.king = true;
	  }
	  //nooh uildel hiihdee
	  this.move = function (tile) {
		this.element.removeClass('selected');
		if (!Board.isValidPlacetoMove(tile.position[0], tile.position[1])) return false;
		//haan buyu daam bish l bol hoishoo nuuh bolomjgui bolgoh
		if (this.player == 1 && this.king == false) {
		  if (tile.position[0] < this.position[0]) return false;
		} else if (this.player == 2 && this.king == false) {
		  if (tile.position[0] > this.position[0]) return false;
		}
		//Board.board geh temdeglgees ustgaj shineer gargj ireh
		Board.board[this.position[0]][this.position[1]] = 0;
		Board.board[tile.position[0]][tile.position[1]] = this.player;
		this.position = [tile.position[0], tile.position[1]];
		this.element.css('top', Board.dictionary[this.position[0]]);
		this.element.css('left', Board.dictionary[this.position[1]]);
		//hervee huu esreg taliin hyzgaart hurvel haan buyu daam bolno(buh zug ruu 1 1eer nuuh bolomjtoi)
		if (!this.king && (this.position[0] == 0 || this.position[0] == 7))
		  this.makeKing();
		return true;
	  };
  
	  //nuuh bolomjtoi nuudluudiig shalgah
	  this.canJumpAny = function () {
		return (this.canOpponentJump([this.position[0] + 2, this.position[1] + 2]) ||
		  this.canOpponentJump([this.position[0] + 2, this.position[1] - 2]) ||
		  this.canOpponentJump([this.position[0] - 2, this.position[1] + 2]) ||
		  this.canOpponentJump([this.position[0] - 2, this.position[1] - 2]))
	  };
  
	  //өрсөлдөгчөө тодорхой газар руу ideh боломжтой эсэхийг шалгана
	  this.canOpponentJump = function (newPosition) {
		var dx = newPosition[1] - this.position[1];
		var dy = newPosition[0] - this.position[0];
		//хэрэв хаан биш бол объект ухрахгүй эсэхийг шалгаарай
		if (this.player == 1 && this.king == false) {
		  if (newPosition[0] < this.position[0]) return false;
		} else if (this.player == 2 && this.king == false) {
		  if (newPosition[0] > this.position[0]) return false;
		}
		//esreg taliin hyzgaart bgaa esh
		if (newPosition[0] > 7 || newPosition[1] > 7 || newPosition[0] < 0 || newPosition[1] < 0) return false;
		var tileToCheckx = this.position[1] + dx / 2;
		var tileToChecky = this.position[0] + dy / 2;
		if (tileToCheckx > 7 || tileToChecky > 7 || tileToCheckx < 0 || tileToChecky < 0) return false;
		if (!Board.isValidPlacetoMove(tileToChecky, tileToCheckx) && Board.isValidPlacetoMove(newPosition[0], newPosition[1])) {
		  //ter nuudeeld huu bga eshiig shalgn
		  for (let pieceIndex in pieces) {
			if (pieces[pieceIndex].position[0] == tileToChecky && pieces[pieceIndex].position[1] == tileToCheckx) {
			  if (this.player != pieces[pieceIndex].player) {
				return pieces[pieceIndex];
			  }
			}
		  }
		}
		return false;
	  };
  
	  this.opponentJump = function (tile) {
		var pieceToRemove = this.canOpponentJump(tile.position);
		if (pieceToRemove) {
		  pieceToRemove.remove();
		  return true;
		}
		return false;
	  };
  
	  this.remove = function () {
		//idegdsen huug talbraas ustgah
		this.element.css("display", "none");
		if (this.player == 1) {
		  $('#player2').append("<div class='capturedPiece'></div>");
		  Board.score.player2 += 1;
		}
		if (this.player == 2) {
		  $('#player1').append("<div class='capturedPiece'></div>");
		  Board.score.player1 += 1;
		}
		Board.board[this.position[0]][this.position[1]] = 0;
		//canOpponentJump аргын for циклд автагдахгүйн тулд байрлалыг дахин тохируулах.
		this.position = [];
		var playerWon = Board.checkifAnybodyWon();
		if (playerWon) {
		  $('#winner').html("Player " + playerWon + " has won!");
		}
	  }
	}
  
	function Tile(element, position) {
	  this.element = element;
	  //talbariin bairshil
	  this.position = position;
	  this.inRange = function (piece) {
		for (let k of pieces)
		  if (k.position[0] == this.position[0] && k.position[1] == this.position[1]) return 'wrong';
		if (!piece.king && piece.player == 1 && this.position[0] < piece.position[0]) return 'wrong';
		if (!piece.king && piece.player == 2 && this.position[0] > piece.position[0]) return 'wrong';
		if (dist(this.position[0], this.position[1], piece.position[0], piece.position[1]) == Math.sqrt(2)) {
		  //togtmol hdlgoon
		  return 'regular';
		} else if (dist(this.position[0], this.position[1], piece.position[0], piece.position[1]) == 2 * Math.sqrt(2)) {
		  //idelt
		  return 'jump';
		}
	  };
	}
  
	//Board object - mogloomiin 
	var Board = {
	  board: gameBoard,
	  score: {
		player1: 0,
		player2: 0
	  },
	  playerTurn: 1,
	  jumpexist: false,
	  continuousjump: false,
	  tilesElement: $('div.tiles'),
	  dictionary: ["0vmin", "10vmin", "20vmin", "30vmin", "40vmin", "50vmin", "60vmin", "70vmin", "80vmin", "90vmin"],
	  //8x8 talbar
	  initalize: function () {
		var countPieces = 0;
		var countTiles = 0;
		for (let row in this.board) { //мөр нь индекс
		  for (let column in this.board[row]) { //багана нь индекс
			//buh talbriig hynan huunuudee haan bairluulahiig
			if (row % 2 == 1) {
			  if (column % 2 == 0) {
				countTiles = this.tileRender(row, column, countTiles)
			  }
			} else {
			  if (column % 2 == 1) {
				countTiles = this.tileRender(row, column, countTiles)
			  }
			}
			if (this.board[row][column] == 1) {
			  countPieces = this.playerPiecesRender(1, row, column, countPieces)
			} else if (this.board[row][column] == 2) {
			  countPieces = this.playerPiecesRender(2, row, column, countPieces)
			}
		  }
		}
	  },
	  tileRender: function (row, column, countTiles) {
		this.tilesElement.append("<div class='tile' id='tile" + countTiles + "' style='top:" + this.dictionary[row] + ";left:" + this.dictionary[column] + ";'></div>");
		tiles[countTiles] = new Tile($("#tile" + countTiles), [parseInt(row), parseInt(column)]);
		return countTiles + 1
	  },
  
	  playerPiecesRender: function (playerNumber, row, column, countPieces) {
		$(`.player${playerNumber}pieces`).append("<div class='piece' id='" + countPieces + "' style='top:" + this.dictionary[row] + ";left:" + this.dictionary[column] + ";'></div>");
		pieces[countPieces] = new Piece($("#" + countPieces), [parseInt(row), parseInt(column)]);
		return countPieces + 1;
	  },
	  //байршилд объект байгаа эсэхийг шалгана
	  isValidPlacetoMove: function (row, column) {
		// console.log(row); console.log(column); console.log(this.board);
		if (row < 0 || row > 7 || column < 0 || column > 7) return false;
		if (this.board[row][column] == 0) {
		  return true;
		}
		return false;
	  },
	  //change the active player - мөн div.turn-ийн CSS-ийг өөрчилдөг
	  changePlayerTurn: function () {
		if (this.playerTurn == 1) {
		  this.playerTurn = 2;
		  $('.turn').css("background", "linear-gradient(to right, transparent 50%, #BEEE62 50%)");
		} else {
		  this.playerTurn = 1;
		  $('.turn').css("background", "linear-gradient(to right, #BEEE62 50%, transparent 50%)");
		}
		this.check_if_jump_exist()
		return;
	  },
	  checkifAnybodyWon: function () {
		if (this.score.player1 == 12) {
			sendScoreToBackend(1); // Player 1 wins
			return 1;
		} else if (this.score.player2 == 12) {
			sendScoreToBackend(2); // Player 2 wins
			return 2;
		}
		return false;
	},
	  //ahin ehluuleh
	  clear: function () {
		location.reload();
	  },
	  check_if_jump_exist: function () {
		this.jumpexist = false
		this.continuousjump = false;
		for (let k of pieces) {
		  k.allowedtomove = false;
		  // hervee idelt baival zuvhun ideh uildel l hiilgeh
		  if (k.position.length != 0 && k.player == this.playerTurn && k.canJumpAny()) {
			this.jumpexist = true
			k.allowedtomove = true;
		  }
		}
		// ideh uildel baihku bol busd nuudluud idevhtei
		if (!this.jumpexist) {
		  for (let k of pieces) k.allowedtomove = true;
		}
	  },
	  str_board: function () {
		ret = ""
		for (let i in this.board) {
		  for (let j in this.board[i]) {
			var found = false
			for (let k of pieces) {
			  if (k.position[0] == i && k.position[1] == j) {
				if (k.king) ret += (this.board[i][j] + 2)
				else ret += this.board[i][j]
				found = true
				break
			  }
			}
			if (!found) ret += '0'
		  }
		}
		return ret
	  }
	}
	Board.initalize();
  
	//nuuh eelj bolohod nuulgeh huugee songoh
	$('.piece').on("click", function () {
	  var selected;
	  var isPlayersTurn = ($(this).parent().attr("class").split(' ')[0] == "player" + Board.playerTurn + "pieces");
	  if (isPlayersTurn) {
		if (!Board.continuousjump && pieces[$(this).attr("id")].allowedtomove) {
		  if ($(this).hasClass('selected')) selected = true;
		  $('.piece').each(function (index) {
			$('.piece').eq(index).removeClass('selected')
		  });
		  if (!selected) {
			$(this).addClass('selected');
		  }
		} else {
		  let exist = "jump exist for other pieces, that piece is not allowed to move"
		  let continuous = "continuous jump exist, you have to jump the same piece"
		  let message = !Board.continuousjump ? exist : continuous
		  console.log(message)
		}
	  }
	});
  
	//reset game gsn tovchoor shineer ehleh
	$('#cleargame').on("click", function () {
	  Board.clear();
	});
  
	//hooson nud deer darahd nuuh
	$('.tile').on("click", function () {
	  if ($('.selected').length != 0) {
		//ali huug deer darsniig oloh
		var tileID = $(this).attr("id").replace(/tile/, '');
		var tile = tiles[tileID];
		//ali nuudel ruu dargdsniig oloh
		var piece = pieces[$('.selected').attr("id")];
		//nuuj boloh eshiig shalgah
		var inRange = tile.inRange(piece);
		if (inRange != 'wrong') {
		  //hervee nuudel ni ideh bolvol ahin idej boloh eshiig shalgah gehdee zuvhun uragshaa idne
		  if (inRange == 'jump') {
			if (piece.opponentJump(tile)) {
			  piece.move(tile);
			  if (piece.canJumpAny()) {
				// Board.changePlayerTurn(); 
				piece.element.addClass('selected');
				// idej boloh uyd oor nuudel hiih bolomjgui zaaval idne
				Board.continuousjump = true;
			  } else {
				Board.changePlayerTurn()
			  }
			}
		  } else if (inRange == 'regular' && !Board.jumpexist) {
			if (!piece.canJumpAny()) {
			  piece.move(tile);
			  Board.changePlayerTurn()
			} else {
			  alert("You must jump when possible!");
			}
		  }
		}
	  }
	});
  }
////
function sendScoreToBackend(winner) {
    // 'your-backend-url'-г өөрийн арын цэгийн бодит URL-ээр солино уу
    fetch('/score', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ winner: winner }),
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        // Шаардлагатай бол серверийн хариуг зохицуулна уу
        return response.json();
    })
    .then(data => {
        console.log('Score sent to backend:', data);
    })
    .catch(error => {
        console.error('Error sending score to backend:', error);
    });
}
// // Тоглогч ялах үед sendScoreToBackend руу залгахын тулд checkifAnybodyWon функцийг өөрчил
$(document).ready(function() {
    // Серверээс оноо авч, DOM-г шинэчлэх
    function fetchScores() {
        $.ajax({
            url: '/scores', // Suulchiin onoo
            method: 'GET',
            success: function(response) {
                $('#player1Score').text(response.player1_score);
                $('#player2Score').text(response.player2_score);
            },
            error: function(xhr, status, error) {
                console.error('Error fetching scores:', error);
            }
        });
		$(document).ready(function() {
			
			$('#resetScores').on('click', function() {
				$.ajax({
					url: '/reset-scores',
					method: 'POST',
					success: function(response) {
						console.log('Scores reset successfully');			
						fetchScores();
					},
					error: function(xhr, status, error) {
						console.error('Error resetting scores:', error);
					}
				});
			});
		});
		
    }

    //huudsiig achaaluuln
    fetchScores();
	
    //onoo avah burt ni tohiruulah
    setInterval(fetchScores, 5000);
	
});