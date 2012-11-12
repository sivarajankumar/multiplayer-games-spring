package games.web.comet.legacy;

import games.web.comet.Subscriber;
import games.web.comet.SubscriberRegistry;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

import javax.servlet.AsyncContext;
import javax.servlet.http.HttpServletRequest;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import org.springframework.beans.factory.annotation.Autowired;

public class ChannelUpdater {

	private static Logger logger = LoggerFactory.getLogger(ChannelUpdater.class);

	@Autowired
	private SubscriberRegistry subscriberRegistry;

	public void sendMessageOnChannel(HttpServletRequest request, String message, String channel, String... excludeUsers) {

		// get the application scoped model, and copy the list of subscribers,
		// so that the long running task of publishing doesnt interfere with new logins
		List<Subscriber> subscribersForChannel = subscriberRegistry.getSubscribersForChannel(channel);
		final List<Subscriber> subscribers = new ArrayList<Subscriber>(subscribersForChannel);

		String[] excludeUsersArray = excludeUsers;
		if (excludeUsers == null)
			excludeUsersArray = new String[0];
		List<String> excludeUserList = Arrays.asList(excludeUsersArray);

		logger.info("Updating channel {} for {} subscribers...", channel, subscribers.size());
		long start = System.currentTimeMillis();

		// keep a list of failed subscribers so we can remove them at
		// the end
		List<Subscriber> toRemove = new ArrayList<Subscriber>();
		for (Subscriber s : subscribers) {

			if (excludeUserList.size() > 0 && excludeUserList.contains(s.getUser())) {
				continue;
			}
			synchronized (s) {
				AsyncContext aCtx = s.getaCtx();
				try {
					aCtx.getResponse().getOutputStream().print(message);
					aCtx.complete();
				} catch (Exception e) {
					e.printStackTrace();
					logger.warn("Failed to send to client {} - removing from list of subscribers on channel {}", s.getUser(), channel);
					toRemove.add(s);
				}
			}
		}

		// remove the failed subscribers from the model in app scope,
		// not our copy of them
		subscribers.removeAll(toRemove);

		// log success
		long end = System.currentTimeMillis() - start;
		logger.info("Finished updating channel {} in {} milliseconds.", channel, end);
	}
}
