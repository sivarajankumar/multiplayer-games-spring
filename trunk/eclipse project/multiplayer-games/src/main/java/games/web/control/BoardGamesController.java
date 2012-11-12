package games.web.control;

import java.security.Principal;

import games.registry.GameRegistry;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.RequestMapping;

import com.google.gson.Gson;

@RequestMapping("/games/board/**")
@Controller
public class BoardGamesController {

	@Autowired
	private GameRegistry gameRegistry;
	
	private Gson gson = new Gson();
	
	
    @RequestMapping
    public void playBoardGame(Model uiModel, Principal currentUser) {
    	uiModel.addAttribute("gameOptions", gson.toJson(gameRegistry.getGameCreateOptionsForUser(currentUser.getName())));
    }
}
