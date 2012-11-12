package games.model;

import java.util.Collections;
import java.util.LinkedList;
import java.util.List;

public class Game {

	private String gameId;
	private String shortName;
	private String name;
	private String description;

	private List<GameOption> options;

	public void addGameOption(GameOption option) {
		if (options == null)
			options = new LinkedList<GameOption>();
		options.add(option);
	}

	public List<GameOption> getGameOptions() {
		return Collections.unmodifiableList(options);
	}

	public String getGameId() {
		return gameId;
	}

	public String getShortName() {
		return shortName;
	}

	public void setShortName(String shortName) {
		this.shortName = shortName;
	}

	public void setGameId(String gameId) {
		this.gameId = gameId;
	}

	public String getName() {
		return name;
	}

	public void setName(String name) {
		this.name = name;
	}

	public String getDescription() {
		return description;
	}

	public void setDescription(String description) {
		this.description = description;
	}

}
