package games.web.comet.legacy;

import games.constants.Constants;
import games.registry.GameRegistry;

import javax.servlet.http.HttpServletRequest;

import org.springframework.beans.factory.annotation.Autowired;

import com.google.gson.Gson;

public class GameListUpdater {

	@Autowired
	private GameRegistry gameRegistry;
	@Autowired
	private ChannelUpdater channelUpdater;
	
	private Gson gson = new Gson();
	
	public void updateOpenGamesList(HttpServletRequest request, String... excludeUsers){
		String gamesList = gson.toJson(gameRegistry.getDTOsForOpenGames());
		String channel = Constants.GAMES_CHANNEL;
		
		channelUpdater.sendMessageOnChannel(request, gamesList, channel, excludeUsers);
	}

}
