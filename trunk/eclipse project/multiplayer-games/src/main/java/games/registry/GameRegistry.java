package games.registry;

import games.model.dto.GameCreateCommand;
import games.model.dto.OpenGameDTO;
import games.model.persistence.GameRepository;

import java.util.HashMap;
import java.util.LinkedList;
import java.util.List;
import java.util.Map;
import java.util.Map.Entry;

import org.springframework.beans.factory.annotation.Autowired;

public class GameRegistry {

	private Map<String, GameCreateCommand> gameMap = new HashMap<String, GameCreateCommand>();
	private Map<String, Object> gameOptionsMap = new HashMap<String, Object>();

	@Autowired
	private GameRepository gameRepository;

	public void addCreatedGame(String userName, GameCreateCommand createCommand) {
		gameMap.put(userName, createCommand);
	}
	
	public GameCreateCommand removeOpenGameForUserName(String gameCreator) {
		return gameMap.remove(gameCreator);
	}
	
	public void setGameOptions(String player1, String player2, Object options){
		gameOptionsMap.put(player1, options);
		gameOptionsMap.put(player2, options);
	}

	public Object getGameCreateOptionsForUser(String userName) {
		return gameOptionsMap.get(userName);
	}

	public List<OpenGameDTO> getDTOsForOpenGames() {

		List<OpenGameDTO> games = new LinkedList<OpenGameDTO>();

		for (Entry<String, GameCreateCommand> entry : gameMap.entrySet()) {
			GameCreateCommand gameCreateCommand = entry.getValue();
			String gameId = gameCreateCommand.gameType;
			OpenGameDTO dto = new OpenGameDTO(entry.getKey(), gameRepository.getGameByGameId(gameId), gameCreateCommand.gameOptions);
			games.add(dto);
		}
		return games;
	}

}
