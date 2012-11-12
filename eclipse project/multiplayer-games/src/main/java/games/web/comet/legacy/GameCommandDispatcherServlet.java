package games.web.comet.legacy;

import java.io.IOException;

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
 * Servlet implementation class MoveDispatcherServlet
 */
@WebServlet(name = "gameCommandDispatcherServlet", urlPatterns = { "/games/board/game-command" }, asyncSupported = true)
public class GameCommandDispatcherServlet extends HttpServlet {
	private static final long serialVersionUID = 1L;

	private ChannelUpdater channelUpdater;
	
    /**
     * @see HttpServlet#HttpServlet()
     */
    public GameCommandDispatcherServlet() {
        super();
    }

    @Override    
    public void init(ServletConfig config) throws ServletException {
        super.init(config);
        final WebApplicationContext context = 
            WebApplicationContextUtils.getWebApplicationContext(
                config.getServletContext());        
        channelUpdater = (ChannelUpdater) context.getBean("channelUpdater" );        
    }
    
    static class GameCommand {
    	Object payload;
    	String player;
    	String opponent;
    	String commandType;
    }
    
    private Gson gson = new Gson();
    
	/**
	 * @see HttpServlet#doPost(HttpServletRequest request, HttpServletResponse response)
	 */
	protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
		// get JSON data
		StringBuilder sb = new StringBuilder();
		String commandString;
		while ((commandString = request.getReader().readLine()) != null) {
			sb.append(commandString);
		}
		commandString = sb.toString();
		// deserialize to find out which player and which opponent
		GameCommand move = gson.fromJson(commandString, GameCommand.class);
		// send move to opponent
		channelUpdater.sendMessageOnChannel(request, commandString, move.player + "vs" + move.opponent);
	}

}
