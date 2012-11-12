package games.web.control;

import games.model.Game;
import games.model.dto.GameDTO;
import games.model.persistence.GameRepository;
import games.registry.GameRegistry;

import java.util.Collection;
import java.util.LinkedList;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.RequestMapping;

import com.google.gson.Gson;

@RequestMapping("/games/lobby")
@Controller
public class LobbyController {

	@Autowired
	private GameRepository gameRepository;
	@Autowired
	private GameRegistry gameRegistry;
	
	private Gson gson = new Gson();
	
	private String getGamesJson() {
		Collection<Game> games = gameRepository.getGames();
		List<GameDTO> gameDTOs = new LinkedList<GameDTO>();
		for (Game game : games){
			GameDTO dto = new GameDTO();
			dto.id = game.getGameId();
			dto.name = game.getShortName();
			dto.options = game.getGameOptions();
			gameDTOs.add(dto);
		}
		return gson.toJson(gameDTOs);
	}
	
	private String getOpenGamesJson(){
		return gson.toJson(gameRegistry.getDTOsForOpenGames());
	}
	
    @RequestMapping
    public void index( Model uiModel) {
    	uiModel.addAttribute("games", getGamesJson());
    	uiModel.addAttribute("openGames", getOpenGamesJson());
    }
    
}
