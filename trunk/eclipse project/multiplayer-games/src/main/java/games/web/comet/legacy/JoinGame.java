package games.web.comet.legacy;

import games.model.dto.GameCreateCommand;
import games.registry.GameRegistry;

import java.io.IOException;
import java.security.Principal;

import javax.servlet.ServletConfig;
import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.springframework.web.context.WebApplicationContext;
import org.springframework.web.context.support.WebApplicationContextUtils;

import com.google.gson.Gson;

/**
 * Servlet implementation class JoinGame
 */
@WebServlet(name = "gameJoinerServlet", urlPatterns = { "/games/join-game" }, asyncSupported = true)
public class JoinGame extends HttpServlet {
	private static final long serialVersionUID = 1L;

	private GameRegistry gameRegistry;
	private GameListUpdater gameListUpdater;
	private ChannelUpdater channelUpdater;

	/**
	 * @see HttpServlet#HttpServlet()
	 */
	public JoinGame() {
		super();
	}

	@Override
	public void init(ServletConfig config) throws ServletException {
		super.init(config);
		final WebApplicationContext context = WebApplicationContextUtils.getWebApplicationContext(config.getServletContext());
		gameRegistry = (GameRegistry) context.getBean("gameRegistry");
		gameListUpdater = (GameListUpdater) context.getBean("gameListUpdater");
		channelUpdater = (ChannelUpdater) context.getBean("channelUpdater");
	}

	static class GameStart {
		String page;
		String opponent;
		String player;
		boolean begin;
	}

	/**
	 * @see HttpServlet#doGet(HttpServletRequest request, HttpServletResponse
	 *      response)
	 */
	protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {

		String gameCreator = request.getParameter("playerName");

		Principal principal = request.getUserPrincipal();
		String gameJoiner = principal.getName();

		if (gameCreator.equals(gameJoiner)) {
			response.sendError(HttpServletResponse.SC_BAD_REQUEST);
			return;
		}

		String gameId = request.getParameter("gameId");

		// remove started game from list of games
		GameCreateCommand command = gameRegistry.removeOpenGameForUserName(gameCreator);
		// add options
		gameRegistry.setGameOptions(gameCreator, gameJoiner, command.gameOptions);
		// refresh game list
		gameListUpdater.updateOpenGamesList(request, gameCreator, gameJoiner);

		GameStart game = new GameStart();
		game.page = gameId;

		// redirect creator
		game.player = gameCreator;
		game.opponent = gameJoiner;
		// TODO hardcoded who begins
		game.begin = true;
		String gameStartForCreator = new Gson().toJson(game);

		channelUpdater.sendMessageOnChannel(request, gameStartForCreator, gameCreator);

		// redirect joiner
		game.player = gameJoiner;
		game.opponent = gameCreator;
		game.begin = false;
		String gameStartForJoiner = new Gson().toJson(game);

		response.getOutputStream().print(gameStartForJoiner);
		response.flushBuffer();
	}

}
