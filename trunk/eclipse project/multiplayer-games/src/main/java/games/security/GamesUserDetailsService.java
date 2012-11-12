package games.security;

import games.model.PlayerImpl;

import java.util.HashMap;
import java.util.Map;

import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;

public class GamesUserDetailsService implements UserDetailsService {

	private Map<String, PlayerImpl> players = new HashMap<String, PlayerImpl>();

	public GamesUserDetailsService() {
		{
			PlayerImpl ender = new PlayerImpl();
			ender.setUserName("ender");
			ender.setPassword("ender");
			ender.setFirstName("Ender");
			ender.setLastName("");

			players.put("ender", ender);
		}
		{
			PlayerImpl sissy = new PlayerImpl();
			sissy.setUserName("sissy");
			sissy.setPassword("sissy");
			sissy.setFirstName("Sissy");
			sissy.setLastName("");

			players.put("sissy", sissy);
		}
		{
			PlayerImpl a = new PlayerImpl();
			a.setUserName("a");
			a.setPassword("a");
			a.setFirstName("a");
			a.setLastName("");

			players.put("a", a);
		}
	}

	@Override
	public UserDetails loadUserByUsername(String userName) throws UsernameNotFoundException {
		PlayerImpl player = players.get(userName);
		if (player == null)
			throw new UsernameNotFoundException("User name not found.");
		return player;
	}

}
