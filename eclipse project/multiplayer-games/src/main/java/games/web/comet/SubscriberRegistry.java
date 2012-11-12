package games.web.comet;

import java.util.Collections;
import java.util.HashMap;
import java.util.LinkedList;
import java.util.List;
import java.util.Map;

public class SubscriberRegistry {

	final Map<String, List<Subscriber>> clients = new HashMap<String, List<Subscriber>>();

	public synchronized List<Subscriber> getSubscribersForChannel(String channel) {
		return clients.get(channel);
	}

	public synchronized void addSubscriber(String channel, Subscriber subscriber) {
		List<Subscriber> subscribers = clients.get(channel);
		if (subscribers == null) {
			// first subscriber to this channel!
			subscribers = Collections.synchronizedList(new LinkedList<Subscriber>());
			clients.put(channel, subscribers);
		}
		// add the new data object to the model
		subscribers.add(subscriber);
	}
}
