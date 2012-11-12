package games.web.comet;


import java.io.IOException;

import javax.servlet.AsyncEvent;

import org.slf4j.LoggerFactory;

import org.slf4j.Logger;

public class AsyncListener implements javax.servlet.AsyncListener {

	private static Logger logger = LoggerFactory.getLogger(AsyncListener.class);
	
	private final String name;
	private final String channel;
	private final Subscriber subscriber;
	private SubscriberRegistry registry;

	
	public AsyncListener(String string, SubscriberRegistry subscriberRegistry, String channel2, Subscriber subscriber2) {
		this.name = string;
		this.registry = subscriberRegistry;
		this.channel = channel2;
		this.subscriber = subscriber2;
	}

	@Override
	public void onComplete(AsyncEvent event) throws IOException {
		removeFromModel();
		checkError(event);
	}

	@Override
	public void onTimeout(AsyncEvent event) throws IOException {
		removeFromModel();
		checkError(event);
	}

	@Override
	public void onError(AsyncEvent event) throws IOException {
		removeFromModel();
		checkError(event);
	}

	@Override
	public void onStartAsync(AsyncEvent event) throws IOException {
		checkError(event);
	}

	private void checkError(AsyncEvent event) {
		if(event.getThrowable() != null){
			logger.error("Async listener {} error:", name);
			event.getThrowable().printStackTrace();
		}
	}

	private void removeFromModel() {
		registry.getSubscribersForChannel(channel).remove(subscriber);
	}
	
}
