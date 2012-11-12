package games.model.persistence.mock;

import games.model.Game;
import games.model.GameOption.BooleanOption;
import games.model.GameOption.EnumerationOption;
import games.model.persistence.GameRepository;

import java.util.Collection;
import java.util.LinkedList;
import java.util.List;

public class GameRepositoryMock implements GameRepository {

	private List<Game> games = new LinkedList<Game>();

	public GameRepositoryMock() {
		Game x0 = createTicTacToe();
		Game reversi = createReversi();
		Game jungleChess = createJungleChess();

		games.add(x0);
		games.add(reversi);
		games.add(jungleChess);
	}

	private Game createJungleChess() {
		Game jungleChess = new Game();
		jungleChess.setGameId("jungle-chess");
		jungleChess.setShortName("Jungle Chess");
		jungleChess.setName("Jungle Chess - Dou Shou Qi");
		String jungleChessDescription = "Jungle or Dou Shou Qi (Chinese: \"Game of Fighting Animals\") is a traditional Chinese board game played on a 7x9 board. The game is also known as The Jungle Game, Jungle Chess, or Animal Chess. Each side has eight pieces representing different animals, each with a different rank. Higher ranking pieces can capture all pieces of identical or weaker ranking. The goal of the game is either to move a piece onto a special square, the den, on the opponent's side of the board, or capture all of the opponent's pieces.";
		jungleChess.setDescription(jungleChessDescription);
		
		jungleChess.addGameOption( new BooleanOption("elephantMayKillRat", "The elephant may kill the rat", true) );
		jungleChess.addGameOption( new BooleanOption("tigerEqualsLion", "The tiger and the lion are equally strong", false) );
		jungleChess.addGameOption( new BooleanOption("leopardJump", "The leopard may jump horizontally across water", false) );
		jungleChess.addGameOption( new BooleanOption("lionJump", "The lion may jump across water", true) );
		jungleChess.addGameOption( new BooleanOption("universalTraps", "All traps work the same for both players", false) );
		jungleChess.addGameOption( new BooleanOption("foxReplacesWolf", "The fox replaces the wolf", false) );
		jungleChess.addGameOption( new BooleanOption("attackFromWater", "Animals may attack when entering/exiting water", false) );
		jungleChess.addGameOption( new BooleanOption("highLevelAnimalsMayEnterTraps", "Animals with power level 4 and above may enter traps", true));
		jungleChess.addGameOption( new BooleanOption("dogCanSwim", "The dog can swim", false));
		
		return jungleChess;
	}

	private Game createReversi() {
		Game reversi = new Game();
		reversi.setGameId("reversi");
		reversi.setShortName("Reversi");
		reversi.setName("Reversi");
		String reversiDescription = "Reversi is a strategy board game for two players, played on an 8x8 uncheckered board. There are 64 identical pieces called 'disks' (often spelled 'discs'), which are light on one side and dark on the other to correspond with the opponents in a game. Players take alternate turns by placing a piece of their own color on the board, in such a position that there exists at least one straight (horizontal, vertical, or diagonal) occupied line between the new piece and another self-owned piece, with one or more contiguous pieces of the opponent between them, which are thus 'captured'. Each player's objective is generally to have as many disks one's own color at the end as possible and for one's opponent to have as few.";
		reversi.setDescription(reversiDescription);

		String[] boardSizes = { "4", "6", "8", "10", "12" };
		EnumerationOption boardSize = new EnumerationOption("boardSize", "Board size", boardSizes, 2);
		reversi.addGameOption(boardSize);

		String[] setups = { "horizontal", "diagonal" };
		EnumerationOption initialSetup = new EnumerationOption("initialSetup", "Initial setup", setups, 1);
		reversi.addGameOption(initialSetup);

		return reversi;
	}

	private Game createTicTacToe() {
		Game x0 = new Game();
		x0.setGameId("x-0");
		x0.setShortName("X and 0");
		x0.setName("Tic-tac-toe - X and 0");
		String x0Description = "Tic-tac-toe, originally called noughts and crosses (and still known as this in Britain and Australia), Xs and Os (in Ireland) and X and 0 (in India) is a pencil-and-paper game for two players, X and O, who take turns marking the spaces in a 3x3 grid. The player who succeeds in placing three respective marks in a horizontal, vertical, or diagonal row wins the game.";
		x0.setDescription(x0Description);

		String[] boardSizes = { "3", "4", "5" };
		EnumerationOption boardSize = new EnumerationOption("boardSize", "Board size", boardSizes, 0);
		x0.addGameOption(boardSize);

		return x0;
	}

	@Override
	public Collection<Game> getGames() {
		return games;
	}

	@Override
	public Game getGameByGameId(String gameId) {
		for (Game game : games) {
			if (game.getGameId().equals(gameId)) {
				return game;
			}
		}
		return null;
	}

}
