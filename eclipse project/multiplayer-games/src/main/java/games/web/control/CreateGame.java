package games.web.control;

import games.model.dto.GameCreateCommand;
import games.registry.GameRegistry;
import games.web.comet.legacy.GameListUpdater;

import java.security.Principal;

import javax.servlet.http.HttpServletRequest;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.ResponseBody;

import com.google.gson.Gson;

@RequestMapping("/games/create-game")
@Controller
public class CreateGame {
	
	@Autowired
	private GameRegistry gameRegistry;
	@Autowired
	private GameListUpdater gameListUpdater;

	private Gson gson = new Gson();
	
	@RequestMapping(headers = "Accept=application/json", method = RequestMethod.POST)
	@ResponseBody
	public ResponseEntity<String> createGame(@RequestBody String json, Principal currentUser,  HttpServletRequest request ) {
		HttpHeaders headers = new HttpHeaders();
		headers.add("Content-Type", "application/json; charset=utf-8");
		
		GameCreateCommand gameCreateCommand = gson.fromJson(json, GameCreateCommand.class);

		gameRegistry.addCreatedGame(currentUser.getName(), gameCreateCommand);

		gameListUpdater.updateOpenGamesList(request);

		return new ResponseEntity<String>("", headers, HttpStatus.OK);
	}
}
