package games.web.comet;

import javax.servlet.AsyncContext;

public class Subscriber {

	private String channel;
	private final AsyncContext aCtx;
	private String userName;
	
	public Subscriber(AsyncContext aCtx, String channel, String user) {
		this.aCtx = aCtx;
		this.channel = channel;
		this.userName = user;
	}

	public String getChannel() {
		return channel;
	}
	
	public AsyncContext getaCtx() {
		return aCtx;
	}

	public String getUser() {
		return userName;
	}
	
}
