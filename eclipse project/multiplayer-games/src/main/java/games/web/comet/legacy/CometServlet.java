package games.web.comet.legacy;

import games.constants.Constants;
import games.web.comet.AsyncListener;
import games.web.comet.Subscriber;
import games.web.comet.SubscriberRegistry;

import java.io.IOException;
import java.security.Principal;

import javax.servlet.AsyncContext;
import javax.servlet.ServletConfig;
import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.springframework.web.context.WebApplicationContext;
import org.springframework.web.context.support.WebApplicationContextUtils;

/**
 * Servlet implementation class CometServlet
 */
@WebServlet(name = "cometServlet", urlPatterns = { "/games/comet", "/games/board/comet" }, asyncSupported = true)
public class CometServlet extends HttpServlet {
       
	private static final long serialVersionUID = 5244401306388187088L;

	private SubscriberRegistry subscriberRegistry;
	
	/**
     * @see HttpServlet#HttpServlet()
     */
    public CometServlet() {
        super();
    }
    
    /* (non-Javadoc)     
     * @see javax.servlet.GenericServlet#init(javax.servlet.ServletConfig)     
     */    
    @Override    
    public void init(ServletConfig config) throws ServletException {
		super.init(config);
		final WebApplicationContext context = WebApplicationContextUtils.getWebApplicationContext(config.getServletContext());
		subscriberRegistry = (SubscriberRegistry) context.getBean("subscriberRegistry");      
    }

	/**
	 * @see HttpServlet#doGet(HttpServletRequest request, HttpServletResponse response)
	 */
	protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
		String channel = request.getParameter("channel");
		
		final AsyncContext aCtx = request.startAsync(request, response);
		aCtx.setTimeout(20000L);
		
		Principal principal = request.getUserPrincipal();
		String userName = principal.getName();
		
		Subscriber subscriber = new Subscriber(aCtx, channel, userName);
		
		subscriberRegistry.addSubscriber(channel, subscriber);
		
		AsyncListener asyncListener = new AsyncListener("asyncListener:" + channel + ":" + userName, subscriberRegistry, channel, subscriber);
		aCtx.addListener(asyncListener);
		
		// acknowledge the subscription
		try {
			aCtx.getResponse().getOutputStream().print(Constants.ACKNOWLEDGE);
			aCtx.getResponse().flushBuffer(); // to ensure the client gets this ack NOW
		} catch (IOException e) {
			e.printStackTrace();
		}
	}

}
