function PushClient(channel, callback) {

	this.channel = channel;
	this.ajax = getBrowserDependentAjaxClient();
	this.onMessage = callback;
	this.url = "comet";

	var pushClient = this;

	function getBrowserDependentAjaxClient() {
		var client = null;
		try {
			client = new XMLHttpRequest();
		} catch (e) {
			// Internet Explorer
			try {
				client = new ActiveXObject("Msxml2.XMLHTTP");
			} catch (e) {
				client = new ActiveXObject("Microsoft.XMLHTTP");
			}
		}
		return client;
	};

	function handleMessage() {
		// states are:
		// 0 (Uninitialized) The object has been created, but not initialized (the open method has not been called).
		// 1 (Open) The object has been created, but the send method has not been called.
		// 2 (Sent) The send method has been called. responseText is not available. responseBody is not available.
		// 3 (Receiving) Some data has been received. responseText is not available. responseBody is not available.
		// 4 (Loaded)
		try {
			if (this.readyState == 0) {
				// pushClient.onMessage(this.readyState, this.status, this.responseText);
			} else if (this.readyState == 1) {
				// pushClient.onMessage(this.readyState, this.status, this.responseText);
			} else if (this.readyState == 2) {
				// pushClient.onMessage(this.readyState, this.status, this.responseText);
			} else if (this.readyState == 3) {
				// pushClient.onMessage(this.readyState, this.status, this.responseText);
			} else if (this.readyState == 4) {
				// the connection is now closed.
				if (this.status == 200){
					if (this.responseText != "ack"){
						pushClient.onMessage(this.responseText.substring(3));
					}
					// start again - we were just disconnected!
					pushClient.connect();
				} 
			}
		} catch (e) {
			console.log(e);
		}
	};

	PushClient.prototype.connect = function() {

		try {
			var params = escape("channel") + "=" + escape(this.channel);
			var url = this.url + "?" + params;
			this.ajax.onreadystatechange = handleMessage;
			this.ajax.open("GET", url, true); // true means async

			// send the GET request to the server
			this.ajax.send(null);
		} catch (e) {
			alert(e);
		}
	};
}
